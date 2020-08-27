/** @packageDocumentation @module Weapons */

import { Weapon, WeaponType, WeaponSubType } from '../Engine/Core/EquipmentCore'
import { MobData } from '../Engine/Core/MobData';
import { Mob } from '../Engine/GameObjects/Mob';
import { UnitManager } from '../Engine/Core/UnitManager';
import { Spell, SpellFlags, Targeting } from '../Engine/GameObjects/Spell';
import { Projectile } from '../Engine/GameObjects/Projectile';
import { getRandomInt, AoE, Helper } from '../Engine/Core/Helper';
import { GameData } from '../Engine/Core/GameData';
import { HDOT } from '../Buffs/HDOT';
import { Buff } from '../Engine/Core/Buff';
import { _, Localization } from '../Engine/UI/Localization';

export class CometWand extends Weapon
{
    constructor(itemID: string = 'cometWand')
    {
        super(itemID);

        this.mainElement = 'ice';

        this.baseAttackMin = 6;
        this.baseAttackMax = 18;
        this.baseAttackSpeed = 1.5;

        this.targetCount = 4;
        this.activeRange = 2000;

        this.manaCost = 10;

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
                    每颗火焰弹会${Helper.toolTip.colored('点燃', GameData.ElementColorsStr['fire'])}目标 100px 范围内的所有敌人，令它们每 0.5s 受到 ${this.getDamage(mob, 20, GameData.Elements.fire).value.toFixed(0)} - ${this.getDamage(mob, 30, GameData.Elements.fire).value.toFixed(0)} 点火属性伤害，持续15秒。${Helper.toolTip.colored('点燃', GameData.ElementColorsStr['fire'])}最多叠加10次。
                </span>
                <span style = "color: #90d7ec;">同时还会影响自身周围 200px 单位内的队友，使其<strong style='color:${GameData.ElementColorsStr['nature']}'>再生</strong>或<strong style='color:${GameData.ElementColorsStr['light']}'>被光刺穿</strong>。</span>`,

                "en-us": `
                <span>Releases maximum ${this.targetCount} flame orbs to target(s).</span>
                <span>
                    Each orb will ${Helper.toolTip.colored('burn', GameData.ElementColorsStr['fire'])} every enemy within 100px from the target, dealing ${this.getDamage(mob, 20, GameData.Elements.fire).value.toFixed(0)} - ${this.getDamage(mob, 30, GameData.Elements.fire).value.toFixed(0)} fire damage every 0.5s for 15sec. ${Helper.toolTip.colored('Burn', GameData.ElementColorsStr['fire'])} can be stacked up to 10 times.
                </span>
                <span style = "color: #90d7ec;">Meanwhile, affect team members within 200px from you, let them <strong style='color:${GameData.ElementColorsStr['nature']}'>Regenerate</strong> or <strong style='color:${GameData.ElementColorsStr['light']}'>Enlighttened</strong>.</span>`,

                "ja-jp": `
                <span>最大 ${this.targetCount} 枚の星炎弾を撃つ。</span>
                <span>
                    弾ことに、あったものの周り 100px 以内の全ての敵を${Helper.toolTip.colored('炎上', GameData.ElementColorsStr['fire'])}の効果を与える。燃えた敵は 15秒 内、0.5秒 ことに ${this.getDamage(mob, 20, GameData.Elements.fire).value.toFixed(0)} - ${this.getDamage(mob, 30, GameData.Elements.fire).value.toFixed(0)} 点の炎属性ダメージを受ける。${Helper.toolTip.colored('炎上', GameData.ElementColorsStr['fire'])}は最大10回に積みます。
                </span>
                <span style = "color: #90d7ec;">その上、自身の周り 200px 以内のメンバーに<strong style='color:${GameData.ElementColorsStr['nature']}'>再生</strong>または<strong style='color:${GameData.ElementColorsStr['light']}'>刺し光</strong>を与える。</span>`,
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
            new Projectile(source.x, source.y, 'img_iced_fx', {
                'info': { 'name': this.atkName, 'flags': new Set<SpellFlags>([SpellFlags.isDamage, SpellFlags.hasTarget]) },
                'source': source,
                'target': targetMob,
                'speed': 450,
                'onMobHit': (self: Spell, mob: Mob) => { self.dieAfter(self.HealDmg, [mob, getRandomInt(6, 18), GameData.Elements.ice], mob); },
                'color': Phaser.Display.Color.HexStringToColor("#77ffff"),
                'chasingRange': 400,
                'chasingPower': 1.0,
            });
    }

    doSpecialAttack(source: Mob, target: Array<Mob>)
    {
        for (let targetMob of target)
            new Projectile(source.x, source.y, 'img_iced_fx', {
                'info': { 'name': this.spName, 'flags': new Set<SpellFlags>([SpellFlags.isDamage, SpellFlags.hasTarget]) },
                'source': source,
                'target': targetMob,
                'speed': 600,
                'onMobHit': (self: Spell, mob: Mob) =>
                {
                    self.dieAfter(
                        () => AoE((m: Mob) =>
                        {
                            // self.HealDmg(m, getRandomInt(30, 50), GameData.Elements.fire);
                            m.receiveBuff(source, new HDOT(Buff.fromKey('test_Burn', { source: source.mobData, time: 15.0, maxStack: 10, name: self.name }), GameData.Elements.fire, 20, 30, 0.5));
                        }, self.getPosition(), 100, self.targeting), [], mob);
                },
                'color': Phaser.Display.Color.HexStringToColor("#ff3333"),
                'chasingRange': 400,
                'chasingPower': 5.0,
            });

        AoE((m: Mob) =>
        {
            // self.HealDmg(m, getRandomInt(30, 50), GameData.Elements.fire);
            if (getRandomInt(0, 3) < 0)
            {
                m.receiveBuff(source, new HDOT(Buff.fromKey('test_HOT', { source: source.mobData, time: 12.0, maxStack: 10 }), GameData.Elements.heal, 5, 8, 1.0));
            }
            else
            {
                m.receiveBuff(source, new HDOT(Buff.fromKey('test_Light', { source: source.mobData, time: 5.0 }), GameData.Elements.light, 2, 3, 1.0));
            }
        }, source.footPos(), 200, Targeting.Player);
    }

    grabTargets(mob: Mob): Array<Mob> 
    {
        return UnitManager.getCurrent().getNearest(mob.footPos(), !mob.mobData.isPlayer, this.targetCount);
    }
}
