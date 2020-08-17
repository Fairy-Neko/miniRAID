/** @module Weapons */

import { Weapon, WeaponType, WeaponSubType } from '../core/EquipmentCore'
import { mRTypes } from '../core/mRTypes'
import { MobData } from '../core/MobData';
import { Mob } from '../Mob';
import { UnitManager } from '../core/UnitManager';

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
        this.weaponGaugeIncreasement = function( mob: MobData ) { return mob.baseStats.mag; };
    }

    _weaponAttack(source: Mob, target: Array<Mob>)
    {
        let targetMob = target[0];
        targetMob.receiveDamage({
            'source': source,
            'target': targetMob,
            'value' : 1,
            'type'  : 'ice',
        });
    }

    grabTargets(mob: Mob) : Array<Mob> 
    {
        return UnitManager.getCurrent().getNearest(mob.footPos(), !mob.mobData.isPlayer, this.targetCount);
    }
}
