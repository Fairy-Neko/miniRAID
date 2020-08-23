/** @packageDocumentation @module Core */

import { mRTypes } from "./mRTypes";
import { MobData } from "./MobData";
import { Weapon } from "./EquipmentCore";
import { Mob } from "../GameObjects/Mob";
import { DataBackend } from "./DataBackend";
import * as EventSystem from "../Events/EventSystem";

export enum MobListenerType
{
    Buff,
    Weapon,
    Armor,
    Accessory,
    /** Attachable things on top of weapon / armor etc. (e.g. Gems, ...) */
    Attachment,
    /** Mob Agent (The action controller of the actual mob, both for player and enemies) */
    Agent,
    /** Job characteristics modifier, e.g. ForestElfMyth, FloraFairy, etc. */
    Characteristics,
}

// onXXX event functions are optional - just register them and use if necessary. By default events will not be connected with the onXXX methods.
export class MobListener extends EventSystem.EventElement
{
    focusList: Set<MobData>;
    priority: number;
    enabled: boolean = true;
    isOver: boolean = false;
    type: MobListenerType;
    cooldownMax: number;
    cooldown: number;
    isReady: boolean;
    parentMob: MobData;

    constructor()
    {
        super(DataBackend.getSingleton().eventSystem);
        this.focusList = new Set();
        this.priority = 0;
        this.enabled = true;

        this.cooldownMax = 0.0;
        this.cooldown = 0.0;
        this.isReady = true;

        // let tst = new MobData({'name': 'test'});
        // this.listen(tst, 'dealDamage', this.isReadyWrapper(this.onDealDamage));
    }

    isReadyWrapper(func: (...args: any[]) => any): (...args: any[]) => any
    {
        return (...args: any[]) => // In order to catch the correct "this" (really?) ref: https://github.com/Microsoft/TypeScript/wiki/'this'-in-TypeScript
        {
            if (this.enabled && (!this.isOver))
            {
                func.apply(this, args);
            }
        };
    }

    focus(mob: MobData)
    {

    }

    unfocus(mob: MobData)
    {

    }

    // Will only be triggered by parent mob.
    update(self: MobData, dt: number)
    {
        for (let mob of this.focusList)
        {
            // if(!Mob.checkExist(mob))
            // {
            // this.focusList.delete(mob);
            // }
        }

        if (this.isReady == false)
        {
            this.cooldown += dt;
        }

        if (this.cooldown >= (this.cooldownMax))
        {
            // this.cooldown = 0;
            // this.isReady = false; // <-- This is the original version. Why did I wrote this ?

            this.isReady = true;
        }
    }

    // N.B.
    // In javascript, parameters were passed via "call-by-sharing".
    // In this case, if you change the parameter itself in a function, it will not make sense;
    // However, if you change a member of the parameter in a function, it will make sense.
    // e.g. func(x) { x = {sth}; } => DOES NOT change x
    //      func(x) { x.y = sth; } => DOES change x.y

    // Be triggered when the mob is calculating its stats.
    // Typically, this will trigged on start of each frame.
    // On every frame, the stats of the mob will be recalculated from its base value.
    onBaseStatCalculation(mob: MobData) { }
    onStatCalculation(mob: MobData) { }
    onStatCalculationFinish(mob: MobData) { }

    // When this listener was added to the mob by source
    // Buffs will also be triggered when new stack comes.
    _beAdded(mob: MobData, source: MobData) 
    {
        this.parentMob = mob;
        this.onAdded(mob, source)
    }

    onAdded(mob: MobData, source: MobData) { }

    // When this listener was removed from the mob by source. By default this will remove the listener from the eventsystem.
    _beRemoved(mob: MobData, source: MobData) 
    {
        this.discard();
        this.onRemoved(mob, source);
    }

    onRemoved(mob: MobData, source: MobData) { }

    // Be triggered when the mob is attacking.
    // This is triggered before the mob's attack.
    onAttack(mob: MobData) { }

    // Be triggered when the mob has finished an attack.
    onAfterAttack(mob: MobData) { }

    // Be triggered when the mob is making a special attack.
    // This is triggered before the attack.
    onSpecialAttack(mob: MobData) { }

    // Be triggered when the mob has finished a special attack.
    onAfterSpecialAttack(mob: MobData) { }

    // Be triggered when the mob is going to be rendered.
    // e.g. change sprite color here etc.
    onCreate(mob: Mob, scene: Phaser.Scene) { }
    onFrontEndUpdate(mob: Mob, dt: number) { }
    onRender(mob: Mob, scene: Phaser.Scene) { }
    onFrontEndDestroy(mob: Mob, scene: Phaser.Scene) { }

    /**
     * Be triggered when the mob is updating, not to be confused with "MobListener.update()".
     * This will be triggered before "onStatCalculation".
     * @param mob the mob that updates
     * @param dt deltaTime in secs
     * @event
     */
    onUpdate(mob: MobData, dt: number) { }

    /** 
     * 'switchWeapon', be triggered when the mob switches its weapon.
     * @param mobData the mob data 
     * @param weapon the weapon that the mob currently holds (after switching).
     * @event 
     */
    onSwitchWeapon(mob: MobData, weapon: Weapon) { }

    // Following functions return a boolean.
    // True:    the damage / heal was modified.
    // False:   the damage / heal was not modified.

    // XXFinal will happen after resist calculation, and vice versa.
    // You can modify the values in damage / heal in order to change the final result.

    // Damage/Heal Info: { source, target, value, overdeal, isCrit, isAvoid, isBlock, spell } = {}

    onDealDamage(damageInfo: mRTypes.DamageHeal) { return false; }
    onDealDamageFinal(damageInfo: mRTypes.DamageHeal) { return false; }

    onDealHeal(healInfo: mRTypes.DamageHeal) { return false; }
    onDealHealFinal(healInfo: mRTypes.DamageHeal) { return false; }

    onReceiveDamage(damageInfo: mRTypes.DamageHeal) { return false; }
    onReceiveDamageFinal(damageInfo: mRTypes.DamageHeal) { return false; }

    onReceiveHeal(healInfo: mRTypes.DamageHeal) { return false; }
    onReceiveHealFinal(healInfo: mRTypes.DamageHeal) { return false; }

    onKill(damageInfo: mRTypes.DamageHeal) { return false; }
    onDeath(damageInfo: mRTypes.DamageHeal) { return false; }
}