/** @packageDocumentation @module Core */

// import * as Modules from './ModuleProxy'
// import { MobListener, MobData } from './Modules'
// import { MobListener, MobData } from './DataBackend'
import { Mob } from '../GameObjects/Mob';
import { MobListener } from './MobListener';
import { MobData } from './MobData';
import { mRTypes } from './mRTypes';
import { Item, ItemManager } from './InventoryCore';
import { Targeting } from '../GameObjects/Spell';

export enum EquipmentType
{
    All = "EQTYPE_ALL",
    Accessory = "accessory",
    Armor = "armor",
    Weapon = "weapon",
    Unknown = "EQTYPE_UNKNOWN",
}

export enum WeaponType
{
    Staff = "staff",
    Unknown = "WPTYPE_UNKNOWN",
}

export enum WeaponSubType
{
    Unknown = "WPTYPE_UNKNOWN",
}

export enum EquipmentTag
{
    Equipment = "equipment",
}

export class Equipable extends MobListener implements Item
{
    equipper: MobData;
    name: string;
    eqType: EquipmentType;

    statRequirements: mRTypes.BaseStats;

    stackable: boolean;
    stacks: number;
    user: MobData;
    itemID: string;
    itemData: mRTypes.ItemData;

    constructor(itemID: string)
    {
        super();

        this.itemID = itemID;
        this.itemData = ItemManager.getData(this.itemID);
        this.name = this.itemData.showName;

        this.assignTags();
    }

    syncStats(mob: MobData) { }

    onAdded(mob: MobData, source: MobData)
    {
        super.onAdded(mob, source);
        this.syncStats(mob);

        this.listen(mob, 'statCalculationFinish', this.onStatCalculationFinish);
    }

    onStatCalculationFinish(mob: MobData)
    {
        super.onStatCalculationFinish(mob);
        this.syncStats(mob);
    }

    showToolTip(): mRTypes.HTMLToolTip
    {
        return {
            'title': 'Equipment',
            'text': 'Tooltip',
        }
    }

    assignTags()
    {
        let tags = this.itemData.tags;
        tags.forEach(t =>
        {
            if (t in EquipmentType)
            {
                this.eqType = (<any>EquipmentType)[t];
            }
        });
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
    // manaRegen: number;

    activeRange: number;
    targetCount: number;

    weaponGauge: number;
    weaponGaugeMax: number;
    weaponGaugeIncreasement: mRTypes.weaponGaugeFunc<Mob>;
    weaponGaugeTooltip: string;

    constructor(itemID: string)
    {
        super(itemID);

        this.weaponGauge = 0;
        this.weaponGaugeMax = -1;
    }

    isInRange(mob: Mob, target: Mob): boolean
    {
        throw new Error("Method not implemented.");
    }

    grabTargets(mob: Mob): Array<Mob> 
    {
        return [];
    }

    triggerCD()
    {
        this.isReady = false;
        this.cooldown = 0;
    }

    assignTags()
    {
        super.assignTags();
        this.wpType = (<any>WeaponType)[this.itemData.pClass];
        this.wpsubType = (<any>WeaponType)[this.itemData.sClass];
    }

    attack(source: Mob, target: Array<Mob>, triggerCD: boolean = true)
    {
        this.isReadyWrapper(() =>
        {
            this.doRegularAttack(source, target);
            if (triggerCD)
            {
                this.triggerCD();
            }

            if (this.weaponGaugeMax > 0)
            {
                this.weaponGauge += this.weaponGaugeIncreasement(source);
                if (this.weaponGauge > this.weaponGaugeMax)
                {
                    this.weaponGauge -= this.weaponGaugeMax;
                    this.doSpecialAttack(source, target);
                }
            }
        })();
    }

    syncStats(mob: MobData)
    {
        this.cooldownMax = mob.getAttackSpeed();
    }

    onAdded(mob: MobData, source: MobData)
    {
        super.onAdded(mob, source);
        // console.log("be added to " + mob.name);
    }

    doRegularAttack(source: Mob, target: Array<Mob>)
    {
        throw new Error("Method not implemented.");
    }

    doSpecialAttack(source: Mob, target: Array<Mob>)
    {
        // throw new Error("Method not implemented.")
    }
}

export class Accessory extends Equipable
{

}