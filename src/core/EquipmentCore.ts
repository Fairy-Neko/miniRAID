/** @module Core */

// import * as Modules from './ModuleProxy'
// import { MobListener, MobData } from './Modules'
// import { MobListener, MobData } from './DataBackend'
import { Mob } from '../Mob';
import { MobListener } from './MobListener';
import { MobData } from './MobData';
import { mRTypes } from './mRTypes';

export enum EquipmentType
{
    All,
    Accessory,
    Armor,
    Weapon,
    Unknown,
}

export enum WeaponType
{
    Stuff,
    Unknown,
}

export enum WeaponSubType
{
    Common,
}

export enum EquipmentTag
{
    Equipment,
}

export class Equipable extends MobListener
{
    equipper: MobData;
    name: string;
    eqType: EquipmentType;

    statRequirements: mRTypes.BaseStats;

    constructor(eqType = EquipmentType.Unknown)
    {
        super();
        this.eqType = eqType;
    }

    syncStats(mob:MobData) {}
    
    onAdded(mob:MobData, source:MobData)
    {
        super.onAdded(mob, source);
        this.syncStats(mob);

        this.listen(mob, 'statCalculationFinish', this.onStatCalculationFinish);
    }

    onStatCalculationFinish(mob:MobData)
    {
        super.onStatCalculationFinish(mob);
        this.syncStats(mob);
    }
}

export class Armor extends Equipable
{

}

export class Weapon extends Equipable
{
    wpType: WeaponType;
    wpsubType: WeaponSubType;
    mainElement: string;

    baseAttackSpeed: number;
    baseAttackMin: number;
    baseAttackMax: number;

    manaCost: number;
    manaRegen: number;

    activeRange: number;
    targetCount: number;

    weaponGauge: number;
    weaponGaugeMax: number;
    weaponGaugeIncreasement: mRTypes.weaponGaugeFunc<MobData>;
    weaponGaugeTooltip: string;

    constructor()
    {
        super(EquipmentType.Weapon);

        this.wpType = WeaponType.Unknown;
        this.wpsubType = WeaponSubType.Common;

        this.weaponGauge = 0;
    }

    isInRange(mob: Mob, target: Mob) : boolean
    {
        throw new Error("Method not implemented.");
    }

    grabTargets(mob: Mob):Array<Mob> 
    {
        return [];
    }

    triggerCD()
    {
        this.isReady = false;
        this.cooldown = 0;
    }

    attack(source: Mob, target: Array<Mob>, triggerCD: boolean = true)
    {
        this.isReadyWrapper(()=>{
            this._weaponAttack(source, target);
            if(triggerCD)
            {
                this.triggerCD();
            }
        })();
    }

    syncStats(mob:MobData)
    {
        this.cooldownMax = mob.getAttackSpeed();
    }

    onAdded(mob:MobData, source:MobData)
    {
        super.onAdded(mob, source);
        console.log("be added to " + mob.name);
    }

    _weaponAttack(source: Mob, target: Array<Mob>)
    {
        throw new Error("Method not implemented.");
    }
}

export class Accessory extends Equipable
{

}