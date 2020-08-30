/** @packageDocumentation @module Core */

import { mRTypes } from "./mRTypes";
import * as EventSystem from "../Events/EventSystem";
import { SpellData } from "./SpellData";
import { Mob } from "../GameObjects/Mob";
import { Weapon, Armor, Accessory, EquipmentType, EquipmentTag, Equipable } from "./EquipmentCore";
import { QuerySet } from "../Structs/QuerySet";
import { MobListener, MobListenerType } from "./MobListener";
import { DataBackend } from "./DataBackend";
import { Buff } from "./Buff";
import { GameData } from "./GameData";
import { BattleMonitor } from "./BattleMonitor";

export enum EquipSlots
{
    MainHand = 'weaponMainHand',
    SubHand = 'weaponSubHand',
    Body = 'armor',
    Accessories = 'accessory',
}

/*
Idle (canCastSpell):
    globalCDRemain <= 0
    inCasting == false
    inChanneling == false

Cast a spell:
    mob.cast(spell):
        * start GCD timer
        if(spell.isCast) 
            inCasting = true
            castTime = xxx
            castRemain = castTime
            currentSpell = spell
        else
            mob.finishCast(spell)
    ->
    mob.update():
        if(castRemain >= 0) castRemain -= dt
    ->
    mob.finishCast(currentSpell):
        if(spell.isChannel)
            inCasting = false
            inChanneling = true
            channelTime = xxx
            channelTimeFactor = xxx
            channelRemain = channelTime
        else
            inCasting = false

        spell.cast(mob, target)
    ->
    mob.update():
        if(channelRemain >= 0) channelRemain -= dt
        spell.onChanneling(mob, target, dt * channelTimeFactor)
    ->
    inChanneling = false
*/
export class MobData extends EventSystem.EventElement
{
    name: string;
    image: string;

    race: string;
    job: string;
    level: number;

    availableBP: number;
    availableSP: number;

    baseStats: mRTypes.BaseStats;
    baseStatsFundemental: mRTypes.BaseStats;

    maxHealth: number;
    currentHealth: number;
    maxMana: number;
    currentMana: number;
    manaRegen: number;
    alive: boolean;

    modifiers: mRTypes.MobSpeedModifiers;
    baseSpeed: number;
    baseAttackSpeed: number;

    isMoving: boolean;

    globalCDRemain: number;

    inCasting: boolean;
    castTime: number;
    castRemain: number;

    inChanneling: boolean;
    channelTime: number;
    channelTimeFactor: number;
    channelRemain: number;

    currentSpell?: SpellData;
    currentSpellTarget?: Mob | Phaser.Math.Vector2;

    battleStats: mRTypes.BattleStats;

    weaponSubHand: Weapon;
    weaponMainHand: Weapon;
    armor: Armor;
    accessory: Accessory;

    currentWeapon: Weapon;
    anotherWeapon: Weapon;
    shouldSwitchWeapon: boolean;

    isPlayer: boolean;

    tauntMul: number;
    beingAttack: number;
    healPriority: boolean;

    // ID: number;

    listeners: QuerySet<MobListener>;
    buffList: Buff[];
    _buffListDirty: boolean; // Used to tell HUD when to update buff list

    mobConstructor: mRTypes.MobConstructor;
    parentMob?: Mob;
    spells: mRTypes.SpellDictionary;
    healthRatio: number;

    inControl: boolean = false;

    constructor(settings: mRTypes.Settings.MobData)
    {
        super(DataBackend.getSingleton().eventSystem);

        this.name = settings.name || "noname";
        // this.position = {x: this.body.left, y: this.body.top};
        this.image = settings.image || "unknown";

        // Stats
        this.race = settings.race || "unknown";
        this.job = settings.job || "unknown";
        this.level = settings.level || 1;

        this.availableBP = settings.availableBP || 0;
        this.availableSP = settings.availableSP || 0;

        this.baseStats = {
            vit: settings.vit || 1,
            str: settings.str || 1,
            dex: settings.dex || 1,
            tec: settings.tec || 1,
            int: settings.int || 1,
            mag: settings.mag || 1,
        };

        // Used to store the player base stats before any modifiers (but after lvlup, talent selections etc.)
        this.baseStatsFundemental = { ... this.baseStats };

        // health related
        this.maxHealth = settings.health || 100;
        this.currentHealth = this.maxHealth - settings.damage || settings.health || 100;
        this.alive = true;

        this.maxMana = settings.mana || 100;
        this.currentMana = this.maxMana || settings.mana || 100;
        this.manaRegen = settings.manaRegen || 5;

        // speed related (1.0 means 100% (NOT a value but a ratio))
        this.modifiers = {
            speed: settings.speed || 1.0,
            movingSpeed: settings.movingSpeed || 1.0,
            attackSpeed: settings.attackSpeed || 1.0,
            spellSpeed: settings.spellSpeed || 1.0,
            resourceCost: settings.resourceCost || 1.0,
        };

        this.baseSpeed = settings.baseSpeed || 80.0;
        this.baseAttackSpeed = settings.baseAttackSpeed || 20.0;

        this.isMoving = false;

        this.globalCDRemain = 0;

        this.inCasting = false;
        this.castTime = 0;
        this.castRemain = 0;

        this.inChanneling = false;
        this.channelTime = 0;
        this.channelTimeFactor = 1.0;
        this.channelRemain = 0;

        this.currentSpell = undefined;
        this.currentSpellTarget = undefined;

        // Stats (cannot increase directly)
        this.battleStats = {
            resist: {
                physical: 0,
                elemental: 0,
                pure: 0, // It should be 0

                slash: 0,
                knock: 0,
                pierce: 0,
                fire: 0,
                ice: 0,
                water: 0,
                nature: 0,
                wind: 0,
                thunder: 0,
                light: 0,
                dark: 0,

                heal: 0,
            },

            attackPower: {
                physical: 0,
                elemental: 0,
                pure: 0, // It should be 0

                slash: 0,
                knock: 0,
                pierce: 0,
                fire: 0,
                ice: 0,
                water: 0,
                nature: 0,
                wind: 0,
                thunder: 0,
                light: 0,
                dark: 0,

                heal: 0,
            },

            // Write a helper to get hit / avoid / crit percentage from current level and parameters ?
            // Percentage
            // Those are basic about overall hit accuracy & avoid probabilities, critical hits.
            // Advanced actions (avoid specific spell) should be calculated inside onReceiveDamage() etc.
            // Same for shields, healing absorbs (Heal Pause ====...===...==...=>! SS: [ABSORB]!!! ...*&@^#), etc.
            hitAcc: 100,
            avoid: 0,

            // Percentage
            crit: 0, // Should crit have types? e.g. physical elemental etc.
            antiCrit: 0,

            // Parry for shield should calculate inside the shield itself when onReceiveDamage().

            attackRange: 0,
            extraRange: 0,
        };

        // Equipment related
        this.equip(settings.weaponSubHand, EquipSlots.SubHand);
        this.equip(settings.weaponMainHand, EquipSlots.MainHand);
        this.equip(settings.armor, EquipSlots.Body);
        this.equip(settings.accessory, EquipSlots.Accessories);

        this.currentWeapon = this.weaponSubHand;
        this.anotherWeapon = this.weaponMainHand;

        // Should we switch the weapon now ?
        this.shouldSwitchWeapon = false;

        // Is this mob a player?
        this.isPlayer = settings.isPlayer || false;

        // How much taunt will this mob generate?
        this.tauntMul = settings.tauntMul || 1.0;
        this.beingAttack = 0;
        this.healPriority = false;

        // A Specific identify name only for this mob
        // Use EventElement.UID instead.
        // this.ID = DataBackend.getSingleton().getID();

        // ref for MobListeners (buffs, agent, weapons, armor, ...)
        /** test */
        this.listeners = new QuerySet();
        this.listeners.addQuery('buff', (arg: MobListener) => (arg.type == MobListenerType.Buff), undefined);
        this.listeners.addQuery('priority', undefined, (l: MobListener, r: MobListener) => (r.priority - l.priority));

        // buff list, only for rendering UI
        // buffs are actually plain mob listeners
        // maybe they have something different (x)
        this.buffList = [];

        // spell list, only for spells with cooldowns.
        this.spells = {} as mRTypes.SpellDictionary;

        // Which class should be used when realize this mob ?
        this.mobConstructor = settings.mobConstructor; // || game.Mobs.TestMob;

        // I finally added this ... (x)
        this.parentMob = undefined;
    }

    canSwitchWeapon(): boolean
    {
        return typeof this.anotherWeapon !== "undefined"
    }

    switchWeapon(): boolean
    {
        if (this.canSwitchWeapon())
        {
            this.shouldSwitchWeapon = true;
            return true;
        }
        return false;
    }

    getPercentage(parameter: number): number
    {
        // TODO: convert parameter to percentage from level
        return parameter;
    }

    getAtkPower(type: GameData.Elements): number
    {
        return Math.pow(
            1.0353,
            this.battleStats.attackPower[GameData.damageType[type]] +
            this.battleStats.attackPower[type]);
    }

    getResist(type: GameData.Elements): number
    {
        return Math.pow(
            0.9659,
            this.battleStats.resist[GameData.damageType[type]] +
            this.battleStats.resist[type]);
    }

    getMovingSpeed(): number
    {
        return this.modifiers.speed * this.modifiers.movingSpeed * this.baseSpeed;
    }

    getAttackSpeed(): number
    {
        if (this.currentWeapon)
        {
            return (1 / this.modifiers.speed) * (1 / this.modifiers.attackSpeed) * this.currentWeapon.baseAttackSpeed;
        }
        else
        {
            return (1 / this.modifiers.speed) * (1 / this.modifiers.attackSpeed);
        }
    }

    getEquipableTags(equipmentType: EquipmentType): EquipmentTag[]
    {
        if (this.parentMob)
        {
            return this.parentMob.getEquipableTags(equipmentType);
        }
        return [EquipmentTag.Equipment];
    }

    // To be continued - dataBackend.js:301
    updateMobBackend(mob: Mob, dt: number)
    {
        // Register parent mob
        if (typeof this.parentMob == undefined)
        {
            this.parentMob = mob;
        }

        // Switch weapon ?
        if (this.shouldSwitchWeapon === true)
        {
            this.shouldSwitchWeapon = false;

            if (this.canSwitchWeapon())
            {
                var tmp = this.currentWeapon;
                this.currentWeapon = this.anotherWeapon;
                this.anotherWeapon = tmp;
            }

            // We already switched them !
            this.removeListener(this.anotherWeapon);
            this.addListener(this.currentWeapon);
            this.anotherWeapon.activated = false;
            this.currentWeapon.activated = true;

            // I switched my weapon !!!
            this.updateListeners('switchWeapon', this, this.currentWeapon);
        }

        // Update all listeners
        this.updateListeners('update', this, dt);
        for (let listener of this.listeners.getAll())
        {
            if (listener.isOver == true)
            {
                //this buff is over. delete it from the list.
                // this.buffList.delete(buff);
                this.removeListener(listener);
            }
            else
            {
                listener.update(this, dt);
            }
        }

        // Mana Regen
        this.currentMana += dt * this.manaRegen;
        // if (typeof this.currentWeapon !== "undefined")
        // {
        // }
        if (this.currentMana > this.maxMana)
        {
            this.currentMana = this.maxMana;
        }

        // Spell Casting
        if (this.globalCDRemain > 0)
        {
            this.globalCDRemain -= dt;
        }
        else
        {
            this.globalCDRemain = 0;
        }

        if (this.isMoving == true)
        {
            // TODO: check if this can cast during moving
            this.inCasting = false;
            this.inChanneling = false;
            this.castRemain = 0;
            this.channelRemain = 0;
        }

        if (this.inCasting == true)
        {
            if (this.castRemain > 0)
            {
                this.castRemain -= dt;
            }
            else
            {
                this.inCasting = false;
                this.finishCast(mob, this.currentSpellTarget, this.currentSpell);
            }
        }

        if (this.inChanneling == true)
        {
            if (this.channelRemain > 0)
            {
                this.channelRemain -= dt;
                this.currentSpell.onChanneling(mob, this.currentSpellTarget, dt * this.channelTimeFactor);
            }
            else
            {
                this.inChanneling = false;
            }
        }

        // Now we only calc stats when needed to save computational resource, controlled by the event system.
        // calculate Stats
        // TODO: seperate calculation to 2 phase, base and battle stats.
        // this.calcStats(mob);

        // update spells
        for (let spell in this.spells)
        {
            if (this.spells.hasOwnProperty(spell))
            {
                this.spells[spell].update(mob, dt);
            }
        }
    }

    addBuff(buff: Buff): boolean
    {
        let dirty: boolean = true;
        let flag: boolean = true;
        this.addListener(buff, buff.source, (arg: MobListener): boolean =>
        {
            flag = false;
            dirty = false;
            if (arg instanceof Buff)
            {
                if (arg.stackable === true)
                {
                    flag = arg.addStack(buff.timeRemain[0]);
                    // arg.emit('added', undefined, this, arg.source);
                }

                buff.discard();
                buff.timeRemain = [];
                buff.stacks = 0;
                buff.isOver = true;
            }
            return false;
        });

        if (dirty)
        {
            this.buffList = <Buff[]>(this.listeners.query('buff'));
            this._buffListDirty = true;
        }

        return flag;
    }

    hasBuff(buff: Buff): boolean
    {
        return this.listeners.has(buff);
    }

    findBuffIncludesName(buffname: string)
    {
        return this.listeners.liveQuery((arg: MobListener) => (arg instanceof Buff && arg.name.includes(buffname)), undefined);
    }

    addListener(listener: MobListener, source?: MobData, callback?: mRTypes.FailCallback<MobListener>)
    {
        if (this.listeners.addItem(listener, callback))
        {
            this.listen(listener, 'statChange', (arg: MobListener) => this.onStatChange(arg));
            // listener.emit('add', undefined, this, source);
            listener._beAdded(this, source);
        }
    }

    removeListener(listener: MobListener, source?: MobData)
    {
        if (!listener)
        {
            return;
        }

        // TODO: Who removed this listener ?
        if (this.listeners.removeItem(listener))
        {
            if (listener.type === MobListenerType.Buff)
            {
                this.buffList = <Buff[]>(this.listeners.query('buff'));
                this._buffListDirty = true;
            }
            // listener.emit('remove', undefined, this, source);
            listener._beRemoved(this, source);
            this.unlistenAll(listener);
        }
    }

    cast(mob: Mob, target: Mob | Phaser.Math.Vector2, spell: SpellData)
    {
        // Check if ready to cast
        if (mob.mobData.canCastSpell() == false || spell.preCast(mob, target) == false)
        {
            return;
        }

        // TODO: Check mana cost, cooldown etc.
        // May combined into readyToCast().

        // Start GCD Timer
        mob.mobData.globalCDRemain = spell.globalCoolDown / mob.mobData.modifiers.spellSpeed;

        if (spell.isCast == true)
        {
            // Start casting
            mob.mobData.inCasting = true;
            mob.mobData.castTime = spell.castTime / mob.mobData.modifiers.spellSpeed;
            mob.mobData.castRemain = mob.mobData.castTime;
            mob.mobData.currentSpell = spell;
        }
        else
        {
            mob.mobData.finishCast(mob, target, spell);
        }
    }

    finishCast(mob: Mob, target: Mob | Phaser.Math.Vector2, spell: SpellData)
    {
        mob.mobData.inCasting = false;

        if (spell.isChannel == true)
        {
            // Start channeling
            mob.mobData.inChanneling = true;
            mob.mobData.channelTimeFactor = mob.mobData.modifiers.spellSpeed;
            mob.mobData.channelTime = spell.channelTime / mob.mobData.channelTimeFactor;
            mob.mobData.channelRemain = mob.mobData.channelTime;
        }

        spell.cast(mob, target);
    }

    equip(equipment: Equipable, slot: EquipSlots): boolean
    {
        if (equipment)
        {
            // TODO: Check if equippable !
            (<any>this)[slot] = equipment;
            equipment.equipper = this;

            if (equipment instanceof Weapon)
            {
                if (typeof this.currentWeapon === 'undefined')
                {
                    this.currentWeapon = equipment;
                    equipment.activated = true;
                    this.addListener(this.currentWeapon);
                }
                else if (typeof this.anotherWeapon === 'undefined')
                {
                    this.anotherWeapon = equipment;
                }
            }

            return true;
        }
        return false;
    }

    /**
     * Event 'statChange' - emitted while a listener (buff, weapon, etc.) needs to change the stat of parent mob.
     * @param listener The listener that triggered a stat change
     * @event
     */
    onStatChange(listener: MobListener)
    {
        this.calcStats(this.parentMob); // Listeners were notified inside this method.
    }

    // FIXME: Just wrote with some random calculations for testing. Please balance the calculation step !!
    calcStats(mob: Mob)
    {
        // TODO: Stats calculation:
        // 1. Calculate (get) base stats from self
        for (let stat in this.baseStats)
        {
            this.baseStats[stat] = this.baseStatsFundemental[stat];
        }

        // 2. Add equipment base stats to self by listener.calcBaseStats()
        this.updateListeners('baseStatCalculation', this);

        // 3. Reset battle stats
        this.battleStats = {
            resist: {
                physical: this.baseStats.vit,
                elemental: this.baseStats.mag,
                pure: 0, // It should always be 0

                slash: 0,
                knock: 0,
                pierce: 0,
                fire: 0,
                ice: 0,
                water: 0,
                nature: 0,
                wind: 0,
                thunder: 0,
                light: 0,
                dark: 0,

                heal: 0,
            },

            attackPower: {
                physical: this.baseStats.str,
                elemental: this.baseStats.int,
                pure: 0, // It should always be 0

                slash: 0,
                knock: 0,
                pierce: 0,
                fire: 0,
                ice: 0,
                water: 0,
                nature: 0,
                wind: 0,
                thunder: 0,
                light: 0,
                dark: 0,

                heal: 0,
            },

            // Write a helper to get hit / avoid / crit percentage from current level and parameters ?
            // Percentage
            // Those are basic about overall hit accuracy & avoid probabilities, critical hits.
            // Advanced actions (avoid specific spell) should be calculated inside onReceiveDamage() etc.
            // Same for shields, healing absorbs (Heal Pause ====...===...==...=>! SS: [ABSORB]!!! ...*&@^#), etc.
            hitAcc: 85 + this.baseStats.tec * 5,
            avoid: 0,

            // Percentage
            crit: this.baseStats.tec, // Should crit have types? e.g. physical elemental etc.
            antiCrit: 0,

            // Parry for shield should calculate inside the shield itself when onReceiveDamage().

            attackRange: 0,
            extraRange: 0,
        };

        this.tauntMul = 1.0;

        // Go back to base speed
        this.modifiers.speed = 1.0 + this.baseStats.dex * 0.05;
        this.modifiers.movingSpeed = 1.0 + this.baseStats.dex * 0.05;
        this.modifiers.attackSpeed = 1.0 + this.baseStats.dex * 0.05;
        this.modifiers.spellSpeed = 1.0 + this.baseStats.dex * 0.05;
        this.modifiers.resourceCost = 1.0 * Math.pow(0.95, this.baseStats.int);

        // Calculate health from stats
        this.healthRatio = this.currentHealth / this.maxHealth;
        this.maxHealth =
            this.baseStats.vit * 10
            + this.baseStats.str * 8
            + this.baseStats.dex * 4
            + this.baseStats.tec * 4
            + this.baseStats.int * 4
            + this.baseStats.mag * 4;

        // And mana
        let manaRatio = this.currentMana / this.maxMana;
        this.maxMana = this.baseStats.mag * 10 + this.baseStats.int * 4;
        this.maxMana = Math.ceil(this.maxMana);
        this.currentMana = Math.max(0, Math.ceil(manaRatio * this.maxMana));
        this.manaRegen = this.baseStats.mag * 0.4;

        // TODO - 4. Calculate battle (advanced) stats from base stats (e.g. atkPower = INT * 0.7 * floor( MAG * 1.4 ) ... )
        // 5. Add equipment by listener.calcStats()
        // Actually, those steps were combined in a single call,
        // as the calculation step of each class will happen in their player classes,
        // which should be the first called listener in updateListeners().
        this.updateListeners('statCalculation', this);
        this.updateListenersRev('statCalculationFinish', this);

        // 5. Finish
        this.maxHealth = Math.ceil(this.maxHealth);
        this.currentHealth = Math.max(0, Math.ceil(this.healthRatio * this.maxHealth));
    }

    receiveDamageHeal(damageInfo: mRTypes.DamageHeal_Input): mRTypes.DamageHeal_Result
    {
        let isHeal = (damageInfo.type === GameData.Elements.heal);

        if (isHeal)
        {
            this.updateListeners('receiveHeal', damageInfo);
            if (damageInfo.source)
            {
                damageInfo.source.updateListeners('dealHeal', damageInfo);
            }
        }
        else
        {
            this.updateListeners('receiveDamage', damageInfo);
            if (damageInfo.source)
            {
                damageInfo.source.updateListeners('dealDamage', damageInfo);
            }
        }

        let result: mRTypes.DamageHeal_Result = {
            source: damageInfo.source,
            target: this,
            value: damageInfo.value,
            type: damageInfo.type,
            overdeal: 0,
            isCrit: false,
            isAvoid: false,
            isBlock: false,
            spell: damageInfo.spell,
        };

        // Calculate crit based on parameters
        // Basically you don't want to avoid the hit or crit of a healing ... do you ?
        // TODO: levels?
        result.isCrit = (100 * Math.random()) < (
            damageInfo.crit - (isHeal ? 0 : this.getPercentage(this.battleStats.antiCrit))
        );

        result.isAvoid = (100 * Math.random()) > (
            damageInfo.hit - (isHeal ? 0 : this.getPercentage(this.battleStats.avoid))
        );

        // This attack was avoided, tell everyone. They may edit the result so this attack is not avoided ...
        if (result.isAvoid === true)
        {
            // Let everyone know what is happening
            if (isHeal)
            {
                this.updateListenersRev('receiveHealFinal', result);
                if (result.source)
                {
                    result.source.updateListenersRev('dealHealFinal', result);
                }
            }
            else
            {
                this.updateListenersRev('receiveDamageFinal', result);
                if (result.source)
                {
                    result.source.updateListenersRev('dealDamageFinal', result);
                }
            }
        }

        // Check if it was finally avoided
        if (result.isAvoid === false)
        {
            // N.B. if you want do something if target avoid, e.g. deal extra on avoid,
            // you should let it change the damage at onDealDamage() when isAvoid == true. (e.g. set other to 0 and add extra damage)
            // then set isAvoid to false. You can also pop some text when you add the extra damage.

            // damage% = 0.9659 ^ resist
            // This is, every 1 point of resist reduces corresponding damage by 3.41%, 
            // which will reach 50% damage reducement at 20 points.
            // TODO: it should all correspond to current level (resist based on source level, atkPower based on target level, same as healing)
            result.value = Math.ceil(result.value * this.getResist(result.type));

            // Apply criticals
            result.value = Math.ceil(
                result.value *
                (result.isCrit ? GameData.critMultiplier[result.type] : 1.0));

            // Overdeals for announcement
            if (isHeal)
            {
                let realHeal: number = Math.min(this.maxHealth - this.currentHealth, result.value);
                result.overdeal = result.value - realHeal;
                result.value = realHeal;
            }
            else
            {
                let realDmg: number = Math.min(this.currentHealth, result.value);
                result.overdeal = result.value - realDmg;
                result.value = realDmg;
            }

            // Let everyone know what is happening
            if (isHeal)
            {
                this.updateListenersRev('receiveHealFinal', result);
                if (result.source)
                {
                    result.source.updateListenersRev('dealHealFinal', result);
                }
            }
            else
            {
                this.updateListenersRev('receiveDamageFinal', result);
                if (result.source)
                {
                    result.source.updateListenersRev('dealDamageFinal', result);
                }
            }

            // Overdeals again to confirm everything is fine
            if (isHeal)
            {
                let realHeal: number = Math.min(this.maxHealth - this.currentHealth, result.value);
                result.overdeal += result.value - realHeal;
                result.value = realHeal;
            }
            else
            {
                let realDmg: number = Math.min(this.currentHealth, result.value);
                result.overdeal += result.value - realDmg;
                result.value = realDmg;
            }

            // Decrese or Increase HP
            this.currentHealth -= (isHeal ? (-result.value) : result.value);

            // Register this to BattleMonitor
            BattleMonitor.getSingleton().add(result);

            // Check if I am dead
            if (this.currentHealth <= 0)
            {
                // Let everyone know what is happening
                this.updateListenersRev('death', result);
                if (result.source)
                {
                    result.source.updateListeners('kill', result);
                }

                // If still I am dead
                if (this.currentHealth <= 0)
                {
                    // I die cuz I am killed
                    this.alive = false;
                }
            }
        }
        else
        {
            result.value = 0;
        }

        // It hits!
        return result;
    }

    // Function used to tell buffs and agents what was going on
    // when damage and heal happens. They can modify them.
    updateListeners(event: string, ...args: any[])
    {
        var flag = false;
        this.emitArray(event, (res) => { if (typeof res == "boolean") { flag = flag || res; } }, args);
        return flag;
    }

    // Same as updateListeners, but all listeners are triggered in reverse order to let them properly revert the values if they have temporally modified them.
    updateListenersRev(event: string, ...args: any[])
    {
        var flag = false;
        this.emitArrayReverted(event, (res) => { if (typeof res == 'boolean') { flag = flag || res; } }, args);
        return flag;
    }

    canCastSpell(): boolean
    {
        if (this.globalCDRemain <= 0 && this.inCasting == false && this.inChanneling == false)
        {
            return true;
        }

        return false;
    }

    useMana(mana: number): boolean
    {
        if (this.currentMana >= (mana * this.modifiers.resourceCost))
        {
            this.currentMana -= (mana * this.modifiers.resourceCost);
            return true;
        }
        return false;
    }

    hasMana(mana: number): boolean
    {
        if (this.currentMana >= (mana * this.modifiers.resourceCost))
        {
            return true;
        }
        return false;
    }

    die(lastHit: mRTypes.DamageHeal_Result)
    {
        this.beingAttack = 0;
        this.alive = false;
    }
}