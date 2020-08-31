/** @packageDocumentation @module Mobs.Allies.WindElf */

import { Mob } from "../../../Engine/GameObjects/Mob";
import { WindElfChar } from "./WindElf";
import { mRTypes } from "../../../Engine/Core/mRTypes";
import { MobData } from "../../../Engine/Core/MobData";
import { Weapon, WeaponTarget } from "../../../Engine/Core/EquipmentCore";
import { Buff } from "../../../Engine/Core/Buff";

export class Hunter extends Mob
{
    constructor(
        scene: Phaser.Scene,
        x: number, y: number,
        sprite: string,
        settings: mRTypes.Settings.Mob,
        subsprite?: string,
        frame?: string | number)
    {
        sprite = 'sheet_mHarcher';
        super(scene, x, y, sprite, settings, subsprite, frame);

        this.mobData.addListener(new HunterChar(), this.mobData);
    }

    update(dt: number)
    {
        super.update(dt);
    }
}

export class HunterChar extends WindElfChar
{
    cache_ap: { phy: number, ele: number };

    onAdded(mob: MobData, source: MobData)
    {
        this.listen(mob, 'specialAttackFinish', this.onSpecialAttackFinish);
        this.listen(mob, 'regularAttack', this.onRegularAttack);
        this.listen(mob, 'regularAttackFinish', this.onRegularAttackFinish);
        this.listen(mob, 'dealDamage', this.onDealDamage);

        this.cache_ap = { phy: mob.battleStats.attackPower.physical, ele: mob.battleStats.attackPower.elemental };
    }

    onSpecialAttackFinish(src: MobData, weapon: Weapon, targets: WeaponTarget[])
    {
        this.windPower += 1;
        this.windPower = Math.min(this.windPower, this.windPowerMax);
        src.parentMob.receiveBuff(src.parentMob, new WindHasteBuff(Buff.fromKey('windElf_windPower', { source: src })), true);
    }

    onRegularAttack(src: MobData, weapon: Weapon, targets: WeaponTarget[])
    {
        let additionals: Phaser.Math.Vector2[] = [];
        let myPos = src.parentMob.footPos().clone();
        let spread = Math.PI / 180 * 10; // 3 degrees

        for (let target of targets)
        {
            for (let i = 0; i < this.windPower; i++)
            {
                let atkVec = (target instanceof Mob ? target.footPos() : target).clone().subtract(myPos);
                let rad = atkVec.angle() + (Math.floor(i / 2) + 1) * (i % 2 == 0 ? -spread : spread);

                additionals.push(myPos.clone().add(Phaser.Math.Vector2.RIGHT.clone().rotate(rad)));
            }
        }

        this.cache_ap = { phy: src.battleStats.attackPower.physical, ele: src.battleStats.attackPower.elemental };
        src.battleStats.attackPower.physical -= this.windPower * 3;
        src.battleStats.attackPower.elemental -= this.windPower * 3;

        targets.push(...additionals);
    }

    onRegularAttackFinish(src: MobData, weapon: Weapon, targets: WeaponTarget[])
    {
        src.battleStats.attackPower.physical = this.cache_ap.phy;
        src.battleStats.attackPower.elemental = this.cache_ap.ele;
    }

    onDealDamage(damageInfo: mRTypes.DamageHeal_Input)
    {
        damageInfo.crit += 5;
        return true;
    }
}

export class WindHasteBuff extends Buff
{
    constructor(settings: mRTypes.Settings.Buff)
    {
        super(settings);
    }

    onAdded(mob: MobData, source: MobData)
    {
        this.listen(mob, 'statCalculation', this.onStatCalculation);
    }

    addStack(time: number): boolean
    {
        if (super.addStack(time))
        {
            this.emitArray('statChange', () => undefined, [this]);
            return true;
        }
        return false;
    }

    onStatCalculation(mob: MobData)
    {
        mob.modifiers.attackSpeed += this.stacks * 0.08;
    }
}
