/** @packageDocumentation @module Weapons */

import { Weapon, WeaponType, WeaponSubType } from '../Engine/Core/EquipmentCore'
import { MobData } from '../Engine/Core/MobData';
import { Mob } from '../Engine/GameObjects/Mob';
import { UnitManager } from '../Engine/Core/UnitManager';
import { Spell, SpellFlags, Targeting } from '../Engine/GameObjects/Spell';
import { Projectile } from '../Engine/GameObjects/Projectile';
import { getRandomInt, AoE } from '../Engine/Core/Helper';
import { GameData } from '../Engine/Core/GameData';
import { HDOT } from '../Buffs/HDOT';
import { Buff } from '../Engine/Core/Buff';
import { _ } from '../Engine/UI/Localization';

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
            if (getRandomInt(0, 3) <= 1)
            {
                m.receiveBuff(source, new HDOT(Buff.fromKey('test_HOT', { source: source.mobData, time: 12.0, maxStack: 10 }), GameData.Elements.heal, 5, 8, 1.0));
            }
            else
            {
                m.receiveBuff(source, new HDOT(Buff.fromKey('test_Light', { source: source.mobData, time: 12.0 }), GameData.Elements.light, 5, 8, 1.0));
            }
        }, source.footPos(), 200, Targeting.Player);
    }

    grabTargets(mob: Mob): Array<Mob> 
    {
        return UnitManager.getCurrent().getNearest(mob.footPos(), !mob.mobData.isPlayer, this.targetCount);
    }
}
