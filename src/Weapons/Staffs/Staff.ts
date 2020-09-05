/** @packageDocumentation @module Weapons.Staffs */

import { Weapon, WeaponType, WeaponSubType } from '../../Engine/Core/EquipmentCore'
import { MobData } from '../../Engine/Core/MobData';
import { Mob } from '../../Engine/GameObjects/Mob';
import { UnitManager } from '../../Engine/Core/UnitManager';
import { Spell, SpellFlags, Targeting } from '../../Engine/GameObjects/Spell';
import { Projectile } from '../../Engine/GameObjects/Projectile';
import { getRandomInt, AoE, Helper, reverseTarget } from '../../Engine/Core/Helper';
import { GameData } from '../../Engine/Core/GameData';
import * as Buffs from '../../Buffs';
import { Buff } from '../../Engine/Core/Buff';
import { _, Localization } from '../../Engine/UI/Localization';

export class CometWand extends Weapon
{
    constructor(itemID: string = 'cometWand')
    {
        super(itemID);

        this.mainElement = GameData.Elements.ice;

        this.baseAttackMin = 6;
        this.baseAttackMax = 18;
        this.baseAttackSpeed = 1.5;

        this.targetCount = 1;
        this.activeRange = 350;

        this.manaCost = 3;

        this.weaponGaugeMax = 25;
        this.weaponGaugeIncreasement = function (mob: Mob) { return mob.mobData.baseStats.mag; };

        // ToolTips
        this.weaponGaugeTooltip = `wp_${this.rawName}`;
        Localization.setOneData(this.weaponGaugeTooltip, {
            "zh-cn": "1x 魔力",
            "en-us": "1x MAG",
            "ja-jp": "1x 魔力"
        });

        this.getBaseAttackDesc = (mob: MobData) =>
        {
            return {
                "zh-cn": `
                <span>放出至多 ${this.targetCount} 颗彗星弹进行攻击。</span>
                <span>每颗造成 ${this.getDamage(mob, this.baseAttackMin, GameData.Elements.ice).value.toFixed(0)} - ${this.getDamage(mob, this.baseAttackMax, GameData.Elements.ice).value.toFixed(0)} 点冰属性伤害。</span>`,

                "en-us": `
                <span>Releases maximum ${this.targetCount} comet orbs to target(s).</span>
                <span>Every orb deals ${this.getDamage(mob, this.baseAttackMin, GameData.Elements.ice).value.toFixed(0)} - ${this.getDamage(mob, this.baseAttackMax, GameData.Elements.ice).value.toFixed(0)} ice damage.</span>`,

                "ja-jp": `
                <span>最大 ${this.targetCount} 枚の彗星弾を撃つ。</span>
                <span>弾ことに、あったものに ${this.getDamage(mob, this.baseAttackMin, GameData.Elements.ice).value.toFixed(0)} - ${this.getDamage(mob, this.baseAttackMax, GameData.Elements.ice).value.toFixed(0)} 点の氷属性ダメージを与える。</span>`,
            }
        }

        this.getSpecialAttackDesc = (mob: MobData) =>
        {
            return {

                "zh-cn": `
                <span>放出至多 ${this.targetCount} 颗火焰弹进行攻击。</span>
                <span>
                    每颗火焰弹会${Helper.toolTip.colored('点燃', GameData.ElementColorsStr['fire'])}目标 50px 范围内的所有敌人，令它们每 1.2秒受到 ${this.getDamage(mob, 3, GameData.Elements.fire).value.toFixed(0)} - ${this.getDamage(mob, 4, GameData.Elements.fire).value.toFixed(0)} 点火属性伤害，持续6.0秒。${Helper.toolTip.colored('点燃', GameData.ElementColorsStr['fire'])}最多叠加10次。
                </span>`,
                // <span style = "color: #90d7ec;">同时还会影响自身周围 200px 单位内的队友，使其<strong style='color:${GameData.ElementColorsStr['nature']}'>再生</strong>或<strong style='color:${GameData.ElementColorsStr['light']}'>被光刺穿</strong>。</span>`,

                "en-us": `
                <span>Releases maximum ${this.targetCount} flame orbs to target(s).</span>
                <span>
                    Each orb will ${Helper.toolTip.colored('burn', GameData.ElementColorsStr['fire'])} every enemy within 50px from the target, dealing ${this.getDamage(mob, 3, GameData.Elements.fire).value.toFixed(0)} - ${this.getDamage(mob, 4, GameData.Elements.fire).value.toFixed(0)} fire damage every 1.2s for 6 seconds. ${Helper.toolTip.colored('Burn', GameData.ElementColorsStr['fire'])} can be stacked up to 10 times.
                </span>`,
                // <span style = "color: #90d7ec;">Meanwhile, affect team members within 200px from you, let them <strong style='color:${GameData.ElementColorsStr['nature']}'>Regenerate</strong> or <strong style='color:${GameData.ElementColorsStr['light']}'>Enlighttened</strong>.</span>`,

                "ja-jp": `
                <span>最大 ${this.targetCount} 枚の星炎弾を撃つ。</span>
                <span>
                    弾ことに、あったものの周り 50px 以内の全ての敵を${Helper.toolTip.colored('炎上', GameData.ElementColorsStr['fire'])}の効果を与える。燃えた敵は 6秒 内、1.2秒 ことに ${this.getDamage(mob, 3, GameData.Elements.fire).value.toFixed(0)} - ${this.getDamage(mob, 4, GameData.Elements.fire).value.toFixed(0)} 点の炎属性ダメージを受ける。${Helper.toolTip.colored('炎上', GameData.ElementColorsStr['fire'])}は最大10回に積みます。
                </span>`
                // <span style = "color: #90d7ec;">その上、自身の周り 200px 以内のメンバーに<strong style='color:${GameData.ElementColorsStr['nature']}'>再生</strong>または<strong style='color:${GameData.ElementColorsStr['light']}'>刺し光</strong>を与える。</span>`,
            }
        }
    }

    onAdded(mob: MobData, source: MobData)
    {
        this.listen(mob, 'baseStatCalculation', this.onBaseStatCalculation);
    }

    onBaseStatCalculation(mob: MobData)
    {
        // Add stats to the mob
        // mob.baseStats.mag += 200;
    }

    doRegularAttack(source: Mob, target: Array<Mob>)
    {
        for (let targetMob of target)
            new Projectile(source.x, source.y, 'sheet_test_projectiles', {
                'info': { 'name': this.atkName, 'flags': new Set<SpellFlags>([SpellFlags.hasTarget]) },
                'source': source,
                'target': targetMob,
                'speed': 250,
                'mainType': [GameData.Elements.ice, GameData.Elements.fire],
                'onMobHit': (self: Spell, mob: Mob) => { self.dieAfter(self.HealDmg, [mob, getRandomInt(6, 18), GameData.Elements.ice], mob); },
                // 'color': Phaser.Display.Color.HexStringToColor("#77ffff"),
                'chasingRange': 400,
                'chasingPower': 1.0,
            }, 1);
    }

    doSpecialAttack(source: Mob, target: Array<Mob>)
    {
        for (let targetMob of target)
            new Projectile(source.x, source.y, 'sheet_test_projectiles', {
                'info': { 'name': this.spName, 'flags': new Set<SpellFlags>([SpellFlags.hasTarget]) },
                'source': source,
                'target': targetMob,
                'speed': 400,
                'onMobHit': (self: Spell, mob: Mob) =>
                {
                    self.dieAfter(
                        () => AoE((m: Mob) =>
                        {
                            // self.HealDmg(m, getRandomInt(30, 50), GameData.Elements.fire);
                            m.receiveBuff(source, new Buffs.HDOT(Buff.fromKey('test_Burn', { source: source.mobData, time: 6.0, maxStack: 10, name: self.name }), GameData.Elements.fire, 3, 4, 1.2));
                        }, self.getPosition(), 50, self.targeting), [], mob);
                },
                'chasingRange': 400,
                'chasingPower': 5.0,
            }, 2);

        AoE((m: Mob) =>
        {
            // self.HealDmg(m, getRandomInt(30, 50), GameData.Elements.fire);
            if (getRandomInt(0, 3) < 1)
            {
                m.receiveBuff(source, new Buffs.HDOT(Buff.fromKey('test_HOT', { source: source.mobData, time: 8.0, maxStack: 3 }), GameData.Elements.heal, 1, 3, 1.2));
            }
            else
            {
                // m.receiveBuff(source, new Buffs.HDOT(Buff.fromKey('test_Light', { source: source.mobData, time: 5.0 }), GameData.Elements.light, 2, 3, 1.0));
            }
        }, source.footPos(), 200, source.mobData.isPlayer ? Targeting.Player : Targeting.Enemy);
    }

    grabTargets(mob: Mob): Array<Mob> 
    {
        return UnitManager.getCurrent().getNearest(mob.footPos(), !mob.mobData.isPlayer, this.targetCount);
    }
}

export class FlameWand extends CometWand
{
    constructor(itemID: string = 'cometWand')
    {
        super(itemID);

        this.mainElement = GameData.Elements.fire;
    }

    doRegularAttack(source: Mob, target: Array<Mob>)
    {
        for (let targetMob of target)
            new Projectile(source.x, source.y, 'sheet_test_projectiles', {
                'info': { 'name': this.atkName, 'flags': new Set<SpellFlags>([SpellFlags.hasTarget]) },
                'source': source,
                'target': targetMob,
                'speed': 250,
                'mainType': [GameData.Elements.fire],
                'onMobHit': (self: Spell, mob: Mob) => { self.dieAfter(self.HealDmg, [mob, getRandomInt(6, 18), GameData.Elements.fire], mob); },
                // 'color': Phaser.Display.Color.HexStringToColor("#77ffff"),
                'chasingRange': 400,
                'chasingPower': 1.0,
            }, 1);
    }
}
