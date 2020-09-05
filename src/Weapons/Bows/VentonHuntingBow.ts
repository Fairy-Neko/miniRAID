/** @packageDocumentation @module Weapons.Bows */

import { Weapon } from "../../Engine/Core/EquipmentCore";
import { Mob } from "../../Engine/GameObjects/Mob";
import { Localization } from "../../Engine/UI/Localization";
import { MobData } from "../../Engine/Core/MobData";
import { Projectile } from "../../Engine/GameObjects/Projectile";
import { SpellFlags, Spell } from "../../Engine/GameObjects/Spell";
import { GameData } from "../../Engine/Core/GameData";
import { getRandomInt } from "../../Engine/Core/Helper";
import { UnitManager } from "../../Engine/Core/UnitManager";

export class VentonHuntingBow extends Weapon
{
    constructor(itemID: string = 'ventonBow')
    {
        super(itemID);

        this.mainElement = GameData.Elements.pierce;

        this.baseAttackMin = 4;
        this.baseAttackMax = 14;
        this.baseAttackSpeed = 2.8;

        this.targetCount = 1;
        this.activeRange = 485;

        this.manaCost = 5;

        this.weaponGaugeMax = 10;
        this.weaponGaugeIncreasement = function (mob: Mob) { return mob.mobData.baseStats.dex; };

        // ToolTips
        this.weaponGaugeTooltip = `wp_${this.rawName}`;
        Localization.setOneData(this.weaponGaugeTooltip, {
            "zh-cn": "1x 敏捷",
            "en-us": "1x DEX",
            "ja-jp": "1x 敏捷"
        });

        this.getBaseAttackDesc = (mob: MobData) =>
        {
            return {
                "zh-cn": ``,
                "en-us": ``,
                "ja-jp": ``,
            }
        }

        this.getSpecialAttackDesc = (mob: MobData) =>
        {
            return {
                "zh-cn": ``,
                "en-us": ``,
                "ja-jp": ``,
            }
        }
    }

    doRegularAttack(source: Mob, target: Array<Mob>)
    {
        for (let targetMob of target)
            new Projectile(source.x, source.y, 'sheet_test_projectiles', {
                'info': { 'name': this.atkName, 'flags': new Set<SpellFlags>([SpellFlags.hasTarget]) },
                'source': source,
                'target': targetMob,
                'color': Phaser.Display.Color.HexStringToColor('#bd8c3c'),
                'speed': 450,
                'mainType': [GameData.Elements.pierce],
                'onMobHit': (self: Spell, mob: Mob) => { self.dieAfter(self.HealDmg, [mob, getRandomInt(this.baseAttackMin, this.baseAttackMax), GameData.Elements.pierce], mob); },
                'chasingRange': 0,
                'chasingPower': 0.0,
            }, 0);
    }

    doSpecialAttack(source: Mob, target: Array<Mob>)
    {
        for (let targetMob of target)
            new Projectile(source.x, source.y, 'sheet_test_projectiles', {
                'info': { 'name': this.spName, 'flags': new Set<SpellFlags>([SpellFlags.hasTarget]) },
                'source': source,
                'target': targetMob,
                'color': Phaser.Display.Color.HexStringToColor('#96d474'),
                'speed': 450,
                'mainType': [GameData.Elements.pierce],
                'onMobHit': (self: Spell, mob: Mob) => { self.dieAfter(self.HealDmg, [mob, getRandomInt(this.baseAttackMin * 3, this.baseAttackMax * 3), GameData.Elements.pierce], mob); },
                'chasingRange': 200,
                'chasingPower': 5.0,
            }, 0);
    }

    grabTargets(mob: Mob): Array<Mob> 
    {
        return UnitManager.getCurrent().getNearest(mob.footPos(), !mob.mobData.isPlayer, this.targetCount);
    }
}