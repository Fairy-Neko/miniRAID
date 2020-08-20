/** @packageDocumentation @module Weapons */

import { Weapon, WeaponType, WeaponSubType } from '../Engine/Core/EquipmentCore'
import { MobData } from '../Engine/Core/MobData';
import { Mob } from '../Engine/GameObjects/Mob';
import { UnitManager } from '../Engine/Core/UnitManager';
import { Spell, SpellFlags, Targeting } from '../Engine/GameObjects/Spell';
import { Projectile } from '../Engine/GameObjects/Projectile';
import { getRandomInt, AoE } from '../Engine/Core/Helper';

export class CometWand extends Weapon
{
    constructor()
    {
        super();

        this.name = "Comet Wand";

        this.wpType = WeaponType.Stuff;
        this.wpsubType = WeaponSubType.Common;
        this.mainElement = 'ice';

        this.baseAttackMin = 6;
        this.baseAttackMax = 18;
        this.baseAttackSpeed = 1.5;

        this.targetCount = 1;
        this.activeRange = 200;

        this.manaCost = 0;
        this.manaRegen = 0;

        this.weaponGaugeMax = 25;
        this.weaponGaugeIncreasement = function (mob: MobData) { return mob.baseStats.mag; };
    }

    doRegularAttack(source: Mob, target: Array<Mob>)
    {
        let targetMob = target[0];
        new Projectile(source.x, source.y, 'img_iced_fx', {
            'info': { 'name': this.name, 'flags': new Set<SpellFlags>([SpellFlags.isDamage, SpellFlags.hasTarget]) },
            'source': source,
            'target': targetMob,
            'speed': 150,
            'onMobHit': (self: Spell, mob: Mob) => { self.dieAfter(self.HealDmg, [mob, getRandomInt(6, 18), 'ice'], mob); },
            // 'onMobHit': (self: Spell, mob: Mob) =>
            // {
            //     self.dieAfter(
            //         () => AoE((m: Mob) =>
            //         {
            //             self.HealDmg(m, getRandomInt(6, 18), 'ice')
            //         }, self.getPosition(), 100, self.targeting), [], mob);
            // },
            'color': Phaser.Display.Color.HexStringToColor("#77ffff"),
            'chasingRange': 400,
            'chasingPower': 1.0,
        })
    }

    grabTargets(mob: Mob): Array<Mob> 
    {
        return UnitManager.getCurrent().getNearest(mob.footPos(), !mob.mobData.isPlayer, this.targetCount);
    }
}
