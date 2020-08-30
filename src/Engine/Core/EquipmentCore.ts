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
import { Helper, ColorToStr } from './Helper';
import { GameData } from './GameData';
import { Game } from 'phaser';
import { _ } from '../UI/Localization';

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
    get equipper() { return this.user; }
    set equipper(r: MobData) { this.user = r; }

    name: string;
    eqType: EquipmentType;

    statRequirements: mRTypes.BaseStats;

    stackable: boolean;
    stacks: number;
    user: MobData;
    itemID: string;
    itemData: mRTypes.ItemData;

    activated: boolean;

    constructor(itemID: string)
    {
        super();

        this.itemID = itemID;
        this.itemData = ItemManager.getData(this.itemID);
        this.name = this.itemData.showName;

        this.assignTags();
    }

    get rawName(): string
    {
        return this.itemData.rawName;
    }

    syncStats(mob: MobData) { }

    _beAdded(mob: MobData, source: MobData)
    {
        this.syncStats(mob);
        this.listen(mob, 'statCalculationFinish', this.onStatCalculationFinish);

        super._beAdded(mob, source);

        this.emitArray('statChange', (res) => { }, [this]);
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
        if (this.itemData.eClass in EquipmentType)
        {
            this.eqType = (<any>EquipmentType)[this.itemData.eClass];
        }
    }
}

export class Armor extends Equipable
{

}

export type WeaponCheckResult = { canAttack: boolean, isSpecial: boolean, target: WeaponTarget[] };
export type WeaponTarget = Mob | Phaser.Math.Vector2;

export class Weapon extends Equipable
{
    wpType: WeaponType;
    wpsubType: WeaponSubType;
    mainElement: string;

    baseAttackSpeed: number;
    baseAttackMin: number;
    baseAttackMax: number;
    energyType: string;

    manaCost: number;
    // manaRegen: number;

    activeRange: number;
    targetCount: number;

    weaponGauge: number;
    weaponGaugeMax: number;
    weaponGaugeIncreasement: mRTypes.weaponGaugeFunc<Mob>;
    weaponGaugeTooltip: string;

    _atkName: string;
    _spName: string;

    get atkName(): string
    {
        return _(this.name) + _(':') + _(this._atkName);
    }

    get spName(): string
    {
        return _(this.name) + _(':') + _(this._spName);
    }

    constructor(itemID: string)
    {
        super(itemID);

        this.weaponGauge = 0;
        this.weaponGaugeMax = -1;

        this._atkName = this.itemData.atkName;
        this._spName = this.itemData.spName;
    }

    isInRange(mob: Mob, target: WeaponTarget): boolean
    {
        if (target instanceof Mob)
        {
            return (mob.footPos().distance(target.footPos()) < (this.activeRange + mob.mobData.battleStats.attackRange));
        }
        else
        {
            return (mob.footPos().distance(target) < (this.activeRange + mob.mobData.battleStats.attackRange));
        }
    }

    isInOrMoveInRange(mob: Mob, target: WeaponTarget): boolean
    {
        if (target instanceof Mob)
        {
            return (mob.footPos().distance(target.footPos()) < (this.activeRange + mob.mobData.battleStats.attackRange));
        }
        else
        {
            // Modify target position so that it is inside our range
            let range = this.activeRange + mob.mobData.battleStats.attackRange;
            if (mob.footPos().distance(target) > range) { target.normalize().scale(range); }
            return true;
        }
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

    attack(source: Mob, target: WeaponTarget[], triggerCD: boolean = true, tempSettings: any = {}): WeaponCheckResult
    {
        let checkResult = this.checkAttack(source, target);
        if (checkResult.canAttack)
        {
            if (checkResult.isSpecial)
            {
                this.specialAttack(source, checkResult.target, true, true);
            }
            else
            {
                this.regularAttack(source, checkResult.target, true, true);
            }
        }

        return checkResult;
    }

    checkAttack(source: Mob, target: WeaponTarget[]): WeaponCheckResult
    {
        let flag: WeaponCheckResult = { 'canAttack': false, 'isSpecial': false, 'target': target };
        this.isReadyWrapper(() =>
        {
            flag.target = target.filter((v: Mob | Phaser.Math.Vector2) => this.isInOrMoveInRange(source, v));
            if (target.length <= 0) { flag.canAttack = false; }
            else { flag.canAttack = true; }

            if (this.weaponGaugeMax > 0 && this.weaponGauge > this.weaponGaugeMax)
            {
                flag.isSpecial = true;
            }
        })();

        return flag;
    }

    regularAttack(source: Mob, target: WeaponTarget[], triggerCD: boolean = true, increaseGauge: boolean = true)
    {
        this.doRegularAttack(source, target);
        if (triggerCD)
        {
            this.triggerCD();
        }

        if (this.weaponGaugeMax > 0 && increaseGauge)
        {
            this.weaponGauge += this.weaponGaugeIncreasement(source);
        }
    }

    specialAttack(source: Mob, target: WeaponTarget[], triggerCD: boolean = true, useGauge: boolean = true)
    {
        if (useGauge)
        {
            this.weaponGauge -= this.weaponGaugeMax;
            this.weaponGauge = Math.max(0, this.weaponGauge);
        }
        this.doSpecialAttack(source, target);
    }

    syncStats(mob: MobData)
    {
        this.cooldownMax = mob.getAttackSpeed();
    }

    // onAdded(mob: MobData, source: MobData)
    // {
    //     super.onAdded(mob, source);
    //     // console.log("be added to " + mob.name);
    // }

    doRegularAttack(source: Mob, target: WeaponTarget[])
    {
        throw new Error("Method not implemented.");
    }

    doSpecialAttack(source: Mob, target: WeaponTarget[]) { }

    getDamage(mobData: MobData, dmg: number, dmgType: GameData.Elements): { modified: boolean, value: number }
    {
        if (!mobData)
        {
            return { modified: false, value: dmg };
        }

        let modified = false;
        let pwrCorrect = 1.0;
        pwrCorrect *= mobData.getAtkPower(dmgType);

        if (pwrCorrect > 1.01 || pwrCorrect < 0.99)
        {
            modified = true;
        }

        return { modified: modified, value: dmg * pwrCorrect };
    }

    getAttackTime(mobData: MobData, time: number): { modified: boolean, value: number }
    {
        if (!mobData)
        {
            return { modified: false, value: time };
        }

        let modified = false;
        let mobSpd = (1 / mobData.modifiers.speed) * (1 / mobData.modifiers.attackSpeed);
        if (mobSpd < 0.99 || mobSpd > 1.01)
        {
            modified = true;
        }

        return { modified: modified, value: mobSpd * time };
    }

    getAttackRange(mobData: MobData, range: number): { modified: boolean, value: number }
    {
        if (!mobData)
        {
            return { modified: false, value: range };
        }

        let modified = false;
        if (mobData.battleStats.attackRange > 0)
        {
            modified = true;
        }

        return { modified: modified, value: mobData.battleStats.attackRange + range };
    }

    getResourceCost(mobData: MobData, cost: number): { modified: boolean, value: number }
    {
        if (!mobData)
        {
            return { modified: false, value: cost };
        }

        let modified = false;
        if (mobData.modifiers.resourceCost < 0.99 || mobData.modifiers.resourceCost > 1.01)
        {
            modified = true;
        }

        return { modified: modified, value: mobData.modifiers.resourceCost * cost };
    }

    getBaseAttackDesc(mobData: MobData): string | { [index: string]: string }
    {
        return "";
    }

    getSpecialAttackDesc(mobData: MobData): string | { [index: string]: string }
    {
        return "";
    }

    getToolTip(): mRTypes.HTMLToolTip
    {
        // Weapon properties:
        // Item Level - Rarity / Primary class - Sub class
        // Attack power (type) / Attack time (DPS)
        // Attack range
        // Energy statement 0 / Max value (Energy type)

        // Equip requirement

        // Weapon special properties (if any)

        // Base attack      cost / (Cost per sec)
        // base attack description

        // Special attack   energy cost
        // Special attack description

        // Weapon description (italic)

        let ttBody = "<div style = 'max-width: 300px; margin: 0;'>";

        //
        // ─── BASIC PROPERTIES ────────────────────────────────────────────
        //

        let th = Helper.toolTip;

        ttBody += th.beginSection();

        // Item Level - Rarity / Primary class - Sub class
        ttBody += th.row(
            th.column(
                th.colored(
                    _(GameData.rarityName[this.itemData.rarity]),
                    GameData.rarityColor[this.itemData.rarity],
                    'width: 4.5em;'
                ) +
                _('itemLevel') + " " + this.itemData.level
                , 'display:flex;') +
            th.column(
                _(this.itemData.pClass) +
                (
                    this.itemData.sClass !== "" ?
                        (" - " + _(this.itemData.sClass)) :
                        ("")
                )
            )
        );

        // Attack power (type) & Attack time
        let attackType = <GameData.Elements>(<any>GameData.Elements)[this.mainElement];
        let dmgMin = this.getDamage(this.equipper, this.baseAttackMin, attackType);
        let dmgMax = this.getDamage(this.equipper, this.baseAttackMax, attackType);
        let atkTime = this.getAttackTime(this.equipper, this.baseAttackSpeed);

        ttBody += th.row(
            th.column(
                "<strong style = 'width: 4.5em'>" + _("atkDmg") + "</strong>" +
                th.colored(
                    `${dmgMin.value.toFixed(1)} - ${dmgMax.value.toFixed(1)} `,
                    dmgMin.modified ? 'aqua' : GameData.ElementColorsStr[attackType]
                ) + " " +
                th.colored(
                    _(attackType),
                    GameData.ElementColorsStr[attackType],
                    'margin-left: 0.45em;'
                ), 'display: flex;'
            ) +
            th.column(
                th.colored(
                    atkTime.value.toFixed(1),
                    atkTime.modified ? 'aqua' : 'white'
                ) + " " + _("sec")
            )
        );

        // DPS
        let dpsR = [dmgMin.value / atkTime.value, dmgMax.value / atkTime.value];
        ttBody += th.row(`<strong style = 'width: 4.5em'>${_('wpDPS')}</strong>${((dpsR[0] + dpsR[1]) / 2.0).toFixed(1)}`, 'display: flex;');

        // Attack range
        let actRange = this.getAttackRange(this.equipper, this.activeRange);
        ttBody += th.row(th.column(
            `<strong style = 'width: 4.5em'>${_('wpRange')}</strong>` +
            th.colored(
                actRange.value.toFixed(0),
                actRange.modified ? 'aqua' : 'white'
            ) + " px", 'display: flex;'
        ));

        // Energy statement
        ttBody += th.row(
            th.column(
                `<strong style = 'width: 4.5em'>${_('wpGauge')}</strong>${this.weaponGauge.toFixed(0)} / ${this.weaponGaugeMax.toFixed(0)}`, 'display: flex;'
            ) +
            th.column(
                this.equipper ?
                    (
                        th.colored("+ " + this.weaponGaugeIncreasement(this.equipper.parentMob), 'aqua') +
                        ` (${_(this.weaponGaugeTooltip)})`
                    ) :
                    (
                        _(this.weaponGaugeTooltip)
                    )
            )
        );

        ttBody += th.switchSection();

        // Equip requirement
        let isFirst = true;

        for (let stat in this.statRequirements)
        {
            if (this.statRequirements[stat] <= 0) { continue; }
            if (isFirst)
            {
                isFirst = false;
                ttBody += th.row(`<strong style = ''>${_('wpReq')}</strong>${this.statRequirements[stat].toFixed(0)} ${_(stat)}`);
            }
            else
            {
                ttBody += th.row(th.column(`${this.statRequirements[stat].toFixed(0)} ${_(stat)}`, 'padding-left:4.5em'));
            }
        }

        if (isFirst)
        {
            ttBody += th.row(_('wpNoReq'));

        }

        // Weapon special properties (if any)
        if (false)
        {
            ttBody += th.switchSection();
        }

        ttBody += th.switchSection();

        // Base attack
        let baseDesc = this.getBaseAttackDesc(this.equipper);
        let rCost = this.getResourceCost(this.equipper, this.manaCost);

        let thisColor = ColorToStr(this.itemData.color);

        ttBody += th.row(
            th.column(
                _('normalAttack') + " " +
                th.colored(
                    _(this._atkName),
                    thisColor
                )
            ) +
            th.column(
                th.colored(
                    rCost.value.toFixed(0),
                    (rCost.modified) ? 'aqua' : 'white'
                ) +
                ` ${_('mana')} (` +
                (rCost.value / atkTime.value).toFixed(1) + ` ${_('per sec')})`
            )
        )
        ttBody += th.row(
            (baseDesc && baseDesc.hasOwnProperty(GameData.mainLanguage)) ? (<any>baseDesc)[GameData.mainLanguage] : baseDesc,
            '',
            'weaponAtkDesc'
        );

        ttBody += th.switchSection();

        let spDesc = this.getSpecialAttackDesc(this.equipper);

        ttBody += th.row(
            th.column(
                _('specialAttack') + " " +
                th.colored(
                    _(this._spName),
                    thisColor
                )
            ) +
            th.column(
                `${this.weaponGaugeMax.toFixed(0)} ${_('energy')}`
            )
        )

        ttBody += th.row(
            (spDesc && spDesc.hasOwnProperty(GameData.mainLanguage)) ? (<any>spDesc)[GameData.mainLanguage] : spDesc,
            '',
            'weaponAtkDesc'
        );

        ttBody += th.switchSection();

        ttBody += "<p style='color: gold;'>" +
            _(this.itemData.toolTipText) + "</p>"

        ttBody += th.endSection();

        ttBody += th.endSection();

        return {
            title: _(this.itemData.showName),
            text: ttBody,
            color: thisColor,
            bodyStyle: "margin-left: 0; margin-right: 0;",
        };
    }
}

export class Accessory extends Equipable
{

}