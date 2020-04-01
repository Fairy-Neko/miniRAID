/** @module Core */

import { mRTypes } from "./mRTypes";
import * as EventSystem from "../Events/EventSystem";
import { SpellData } from "./SpellData";
import { Mob } from "../Mob";
import { Weapon, Armor, Accessory, EquipmentType, EquipmentTag } from "./EquipmentCore";
import { QuerySet } from "../Structs/QuerySet";
import { MobListener, MobListenerType } from "./MobListener";
import { DataBackend } from "./DataBackend";
import { Buff } from "./Buff";
import { GameData } from "./GameData";

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
    class: string;
    level: number;
    
    availableBP: number;
    availableSP: number;

    baseStats: mRTypes.BaseStats;
    baseStatsFundemental: mRTypes.BaseStats;

    maxHealth: number;
    currentHealth: number;
    maxMana: number;
    currentMana: number;
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

    weaponLeft: Weapon;
    weaponRight: Weapon;
    armor: Armor;
    accessory: Accessory;
    
    currentWeapon: Weapon;
    anotherWeapon: Weapon;
    shouldSwitchWeapon: boolean;
    
    isPlayer: boolean;
    
    tauntMul: number;
    beingAttack: number;
    healPriority: boolean;
    
    ID: number;
    
    listeners: QuerySet<MobListener>;
    // buffList: Set<Buff>;
    
    mobConstructor: mRTypes.MobConstructor;
    parentMob?: Mob;
    spells: mRTypes.SpellDictionary;
    healthRatio: number;

    inControl:boolean = false;
    
    constructor(settings:mRTypes.Settings.MobData)
    {
        super(DataBackend.getSingleton().eventSystem);

        this.name = settings.name || "noname";
        // this.position = {x: this.body.left, y: this.body.top};
        this.image = settings.image || "magical_girl";

        // Stats
        this.race = settings.race || "unknown";
        this.class = settings.class || "unknown";
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
    
        // speed related (1.0 means 100% (NOT a value but a ratio))
        this.modifiers = {
            speed: settings.speed || 1.0,
            movingSpeed: settings.movingSpeed || 1.0,
            attackSpeed: settings.attackSpeed || 1.0,
            spellSpeed: settings.spellSpeed || 1.0,
            resourceCost: settings.resourceCost || 1.0,
        };

        this.baseSpeed = settings.baseSpeed || 2.0;
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
        this.weaponLeft = settings.weaponLeft;// || new game.weapon(settings);
        this.weaponRight = settings.weaponRight;// || new game.weapon(settings);
        this.armor = settings.armor;// || new game.Armor(settings);
        this.accessory = settings.accessory;// || new game.Accessory(settings);

        if (this.weaponLeft) { this.weaponLeft.equipper = this; }
        if (this.weaponRight) { this.weaponRight.equipper = this; }
        if (this.armor) { this.armor.equipper = this; }
        if (this.accessory) { this.accessory.equipper = this; }

        this.currentWeapon = this.weaponLeft;
        this.anotherWeapon = this.weaponRight;

        // Should we switch the weapon now ?
        this.shouldSwitchWeapon = false;

        // Is this mob a player?
        this.isPlayer = settings.isPlayer || false;

        // How much taunt will this mob generate?
        this.tauntMul = settings.tauntMul || 1.0;
        this.beingAttack = 0;
        this.healPriority = false;

        // A Specific identify name only for this mob
        this.ID = DataBackend.getSingleton().getID();

        // ref for MobListeners (buffs, agent, weapons, armor, ...)
        /** test */
        this.listeners = new QuerySet();
        this.listeners.addQuery('buff', (arg: MobListener) => (arg.type == MobListenerType.Buff), undefined);
        this.listeners.addQuery('priority', undefined, (l: MobListener, r: MobListener) => (r.priority - l.priority));

        // buff list, only for rendering UI
        // buffs are actually plain mob listeners
        // maybe they have something different (x)
        // this.buffList = new Set();

        // spell list, only for spells with cooldowns.
        this.spells = {} as mRTypes.SpellDictionary;

        // Which class should be used when realize this mob ?
        this.mobConstructor = settings.mobConstructor; // || game.Mobs.TestMob;

        // I finally added this ... (x)
        this.parentMob = undefined;
    }

    switchWeapon():void
    {
        this.shouldSwitchWeapon = true;
    }

    getPercentage(parameter:number):number
    {
        // TODO: convert parameter to percentage from level
        return parameter;
    }

    getMovingSpeed():number
    {
        return this.modifiers.speed * this.modifiers.movingSpeed * this.baseSpeed;
    }

    getAttackSpeed():number
    {
        if(this.currentWeapon)
        {
            return (1 / this.modifiers.speed) * (1 / this.modifiers.attackSpeed) * this.currentWeapon.baseAttackSpeed;
        }
        else
        {
            return (1 / this.modifiers.speed) * (1 / this.modifiers.attackSpeed);
        }
    }

    getEquipableTags(equipmentType:EquipmentType):EquipmentTag[]
    {
        if(this.parentMob)
        {
            return this.parentMob.getEquipableTags(equipmentType);
        }
        return [EquipmentTag.Equipment];
    }

    // To be continued - dataBackend.js:301
    updateMobBackend(mob:Mob, dt:number)
    {
        // Register parent mob
        if(typeof this.parentMob == undefined)
        {
            this.parentMob = mob;
        }

        // Switch weapon ?
        if(this.shouldSwitchWeapon === true)
        {
            this.shouldSwitchWeapon = false;
            
            if(typeof this.anotherWeapon !== "undefined")
            {
                var tmp = this.currentWeapon;
                this.currentWeapon = this.anotherWeapon;
                this.anotherWeapon = tmp;
            }

            this.removeListener(this.anotherWeapon);
            this.addListener(this.currentWeapon);
    
            // I switched my weapon !!!
            this.updateListeners(this, 'switchWeapon', this, this.currentWeapon);
        }

        // Update all listeners
        this.updateListeners(this, 'onUpdate', this, dt);
        for (let listener of this.listeners.getAll())
        {
            if(listener.isOver == true)
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
        if(typeof this.currentWeapon !== "undefined")
        {
            this.currentMana += dt * this.currentWeapon.manaRegen * 0.001; // change to this.manaRegen plz
        }
        if(this.currentMana > this.maxMana)
        {
            this.currentMana = this.maxMana;
        }

        // Spell Casting
        if(this.globalCDRemain > 0)
        {
            this.globalCDRemain -= dt * 0.001;
        }
        else
        {
            this.globalCDRemain = 0;
        }

        if(this.isMoving == true)
        {
            // TODO: check if this can cast during moving
            this.inCasting = false;
            this.inChanneling = false;
            this.castRemain = 0;
            this.channelRemain = 0;
        }

        if(this.inCasting == true)
        {
            if(this.castRemain > 0)
            {
                this.castRemain -= dt * 0.001;
            }
            else
            {
                this.inCasting = false;
                this.finishCast(mob, this.currentSpellTarget, this.currentSpell);
            }
        }

        if(this.inChanneling == true)
        {
            if(this.channelRemain > 0)
            {
                this.channelRemain -= dt * 0.001;
                this.currentSpell.onChanneling(mob, this.currentSpellTarget, dt * 0.001 * this.channelTimeFactor);
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
            if(this.spells.hasOwnProperty(spell))
            {
                this.spells[spell].update(mob, dt);
            }
        }
    }

    addBuff(buff:Buff)
    {
        this.addListener(buff, buff.source, (arg: MobListener) : boolean => {
            if(arg instanceof Buff)
            {
                if(arg.stackable === true)
                {
                    arg.addStack();
                    // arg.emit('added', undefined, this, arg.source);
                }
            }
            return false;
        });
    }

    hasBuff(buff:Buff) : boolean
    {
        return this.listeners.has(buff);
    }

    findBuffIncludesName(buffname:string)
    {
        return this.listeners.liveQuery((arg:MobListener) => (arg instanceof Buff && arg.name.includes(buffname)), undefined);
    }

    addListener(listener: MobListener, source?: MobData, callback?: mRTypes.FailCallback<MobListener>)
    {
        if(this.listeners.addItem(listener, callback))
        {
            this.listen(listener, 'statChange', (arg:MobListener) => this.onStatChange(arg));
            listener.emit('add', undefined, this, source);
        }
    }

    removeListener(listener: MobListener, source?: MobData)
    {
        if(!listener)
        {
            return;
        }

        // TODO: Who removed this listener ?
        if(this.listeners.removeItem(listener))
        {
            listener.emit('remove', undefined, this, source);
            this.unlistenAll(listener);
        }
    }

    cast(mob: Mob, target: Mob | Phaser.Math.Vector2, spell: SpellData)
    {
        // Check if ready to cast
        if(mob.mobData.canCastSpell() == false || spell.preCast(mob, target) == false)
        {
            return;
        }

        // TODO: Check mana cost, cooldown etc.
        // May combined into readyToCast().

        // Start GCD Timer
        mob.mobData.globalCDRemain = spell.globalCoolDown / mob.mobData.modifiers.spellSpeed;

        if(spell.isCast == true)
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

        if(spell.isChannel == true)
        {
            // Start channeling
            mob.mobData.inChanneling = true;
            mob.mobData.channelTimeFactor = mob.mobData.modifiers.spellSpeed;
            mob.mobData.channelTime = spell.channelTime / mob.mobData.channelTimeFactor;
            mob.mobData.channelRemain = mob.mobData.channelTime;
        }

        spell.cast(mob, target);
    }

    /**
     * Event 'statChange' - emitted while a listener (buff, weapon, etc.) needs to change the stat of parent mob.
     * @param listener The listener that triggered a stat change
     * @event
     */
    onStatChange(listener: MobListener)
    {
        this.calcStats(this.parentMob);
        this.currentWeapon.cooldownMax = this.getAttackSpeed(); // Set attack speed
    }

    calcStats(mob: Mob)
    {
        // TODO: Stats calculation:
        // 1. Calculate (get) base stats from self
        for(let stat in this.baseStats)
        {
            this.baseStats[stat] = this.baseStatsFundemental[stat];
        }

        // 2. Add equipment base stats to self by listener.calcBaseStats()
        this.updateListeners(this, 'onBaseStatCalculation', this);        

        // 3. Reset battle stats
        this.battleStats = {
            resist: {
                physical: 0,
                elemental: 10,
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

                heal: 0,
            },

            attackPower: {
                physical: 0,
                elemental: 0,
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
            crit: 20, // Should crit have types? e.g. physical elemental etc.
            antiCrit: 0,

            // Parry for shield should calculate inside the shield itself when onReceiveDamage().

            attackRange: 0,
            extraRange: 0,
        };

        this.tauntMul = 1.0;

        // Go back to base speed
        this.modifiers.speed = 1.0;
        this.modifiers.movingSpeed = 1.0;
        this.modifiers.attackSpeed = 1.0;
        this.modifiers.spellSpeed = 1.0;
        this.modifiers.resourceCost = 1.0;

        // Calculate health from stats
        this.healthRatio = this.currentHealth / this.maxHealth;
        this.maxHealth = 
            this.baseStats.vit * 10
          + this.baseStats.str * 8
          + this.baseStats.dex * 4
          + this.baseStats.tec * 4
          + this.baseStats.int * 4
          + this.baseStats.mag * 4;

        // 4. Calculate battle (advanced) stats from base stats (e.g. atkPower = INT * 0.7 * floor( MAG * 1.4 ) ... )
        // 5. Add equipment by listener.calcStats()
        // Actually, those steps were combined in a single call,
        // as the calculation step of each class will happen in their player classes,
        // which should be the first called listener in updateListeners().
        this.updateListeners(this, 'onStatCalculation', this);
        this.updateListeners(this, 'onStatCalculationFinish', this);

        // 5. Finish
        this.maxHealth = Math.ceil(this.maxHealth);
        this.currentHealth = Math.max(0, Math.ceil(this.healthRatio * this.maxHealth));
    }

    receiveDamage(damageInfo: mRTypes.DamageHeal)
    {
        // Calculate crit based on parameters
        if(!damageInfo.isCrit)
        {
            damageInfo.isCrit = (100 * Math.random()) < (
                damageInfo.source.getPercentage(damageInfo.source.battleStats.crit) - 
                damageInfo.target.getPercentage(damageInfo.target.battleStats.antiCrit));

            damageInfo.isAvoid = (100 * Math.random()) > (
                damageInfo.source.getPercentage(damageInfo.source.battleStats.hitAcc) - 
                damageInfo.target.getPercentage(damageInfo.target.battleStats.avoid));
        }

        this.updateListeners(damageInfo.target, 'receiveDamage', damageInfo);
        if (damageInfo.source)
        {
            damageInfo.source.updateListeners(damageInfo.source, 'dealDamage', damageInfo);
        }

        // Check if it was avoided (we check it before final calculation, so when onReceiveDamageFinal(), damage are guaranteed not avoided)
        if (damageInfo.isAvoid === true)
        {
            // Tell mob this attack was avoided
            return {isAvoid: true};
        }
        // N.B. if you want do something if target avoid, e.g. deal extra on avoid,
        // you should let it change the damage at onDealDamage() when isAvoid == true. (e.g. set other to 0 and add extra damage)
        // then set isAvoid to false. You can also pop some text when you add the extra damage.

        // Do the calculation
        for(var dmgType in damageInfo.value)
        {
            // damage% = 1.0353 ^ power
            // 20pts of power = 100% more damage
            if(damageInfo.source)
            {
                damageInfo.value[dmgType] = Math.ceil(
                    damageInfo.value[dmgType] * 
                    (Math.pow(
                        1.0353,
                        damageInfo.source.battleStats.attackPower[GameData.damageType[dmgType]] +
                        damageInfo.source.battleStats.attackPower[dmgType])));
            }

            // damage% = 0.9659 ^ resist
            // This is, every 1 point of resist reduces corresponding damage by 3.41%, 
            // which will reach 50% damage reducement at 20 points.
            // TODO: it should all correspond to current level (resist based on source level, atkPower based on target level, same as healing)
            damageInfo.value[dmgType] = Math.ceil(
                damageInfo.value[dmgType] * 
                (Math.pow(
                    0.9659, 
                    this.battleStats.resist[GameData.damageType[dmgType]] + 
                    this.battleStats.resist[dmgType])));

            // Apply criticals
            damageInfo.value[dmgType] = Math.ceil( 
                damageInfo.value[dmgType] * 
                (damageInfo.isCrit ? GameData.critMultiplier[dmgType] : 1.0));
        }

        // Let everyone know what is happening
        // damageObj.damage = finalDmg;

        this.updateListeners(damageInfo.target, 'receiveDamageFinal', damageInfo);
        if(damageInfo.source)
        {
            damageInfo.source.updateListeners(damageInfo.source, 'dealDamageFinal', damageInfo);
        }

        // Decrese HP
        // Check if I am dead
        let realDmg : mRTypes.LeafTypes<number> = mRTypes.LeafTypesZERO;
        for(let dmg in damageInfo.value)
        {
            realDmg[dmg] += Math.min(this.currentHealth, damageInfo.value[dmg]);
            this.currentHealth -= realDmg[dmg];
            damageInfo.overdeal[dmg] = damageInfo.value[dmg] - realDmg[dmg];
            damageInfo.value[dmg] = realDmg[dmg];
            // game.data.monitor.addDamage(damageInfo.value[dmg], dmg, damageInfo.source, damageInfo.target, damageInfo.isCrit, damageInfo.spell);
        }

        if(this.currentHealth <= 0)
        {
            // Let everyone know what is happening
            this.updateListeners(damageInfo.target, 'death', damageInfo);
            if(damageInfo.source)
            {
                damageInfo.source.updateListeners(damageInfo.source, 'kill', damageInfo);
            }

            // If still I am dead
            if(this.currentHealth <= 0)
            {
                // I die cuz I am killed
                this.alive = false;
            }
        }

        // It hits!
        return damageInfo.value;
    }

    receiveHeal(healInfo: mRTypes.DamageHeal)
    {
        // Calculate crit based on parameters
        if(!healInfo.isCrit)
        {
            healInfo.isCrit = (100 * Math.random()) < (
                healInfo.source.getPercentage(healInfo.source.battleStats.crit) - 
                healInfo.target.getPercentage(healInfo.target.battleStats.antiCrit));
        }

        // Let everyone know what is happening
        this.updateListeners(healInfo.target, 'receiveHeal', healInfo);
        if(healInfo.source)
        {
            healInfo.source.updateListeners(healInfo.source, 'dealHeal', healInfo);
        }

        // Do the calculation
        // _finalHeal: total amount of healing (real + over)
        // healInfo.value = healInfo.heal.real;

        if(healInfo.source)
        {
            healInfo.value.heal = Math.ceil(
                healInfo.value.heal * 
                (Math.pow(
                    1.0353,
                    healInfo.source.battleStats.attackPower.heal)));
        }

        // damage% = 0.9659 ^ resist
        // This is, every 1 point of resist reduces corresponding damage by 3.41%, 
        // which will reach 50% damage reducement at 20 points.
        healInfo.value.heal = Math.ceil(
            healInfo.value.heal * 
            (Math.pow(
                0.9659,
                this.battleStats.resist.heal)));
        
        healInfo.value.heal = Math.ceil(
            healInfo.value.heal 
            * ( healInfo.isCrit ? GameData.critMultiplier.heal : 1.0 )
        );

        // calculate overHealing using current HP and max HP.
        let realHeal = Math.min(healInfo.target.maxHealth - healInfo.target.currentHealth, healInfo.value.heal);
        healInfo.overdeal.heal = healInfo.value.heal - realHeal;
        healInfo.value.heal = realHeal;

        // Let buffs and agents know what is happening
        this.updateListeners(healInfo.target, 'receiveHealFinal', healInfo);
        if(healInfo.source)
        {
            healInfo.source.updateListeners(healInfo.source, 'dealHealFinal', healInfo);
        }

        // Increase the HP.
        this.currentHealth += healInfo.value.heal;
        // game.data.monitor.addHeal(healInfo.value.heal, healInfo.overdeal.heal, healInfo.source, healInfo.target, healInfo.isCrit, healInfo.spell);

        return healInfo.value.heal;
    }

    // Function used to tell buffs and agents what was going on
    // when damage and heal happens. They can modify them.
    updateListeners(mobData:MobData, event:string, ...args: any[])
    {
        var flag = false;

        this.emitArray(event, (res) => {if(typeof res == "boolean") {flag = flag || res;}}, args);

        return flag;
    }

    canCastSpell():boolean
    {
        if(this.globalCDRemain <= 0 && this.inCasting == false && this.inChanneling == false)
        {
            return true;
        }

        return false;
    }

    useMana(mana:number):boolean
    {
        if(this.currentMana >= mana)
        {
            this.currentMana -= mana;
            return true;
        }
        return false;
    }

    hasMana(mana:number):boolean
    {
        if(this.currentMana >= mana)
        {
            return true;
        }
        return false;
    }

    die(lastHit:mRTypes.DamageHeal)
    {
        this.beingAttack = 0;
        this.alive = false;
    }
}