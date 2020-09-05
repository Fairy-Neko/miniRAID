/** @packageDocumentation @module Mobs.Allies.MountainElf */

import { Mob } from "../../../Engine/GameObjects/Mob";
import { mRTypes } from "../../../Engine/Core/mRTypes";
import { MountainElfChar } from "./MountainElf";
import { MobData } from "../../../Engine/Core/MobData";
import { SpellFlags, Targeting, Spell } from "../../../Engine/GameObjects/Spell";
import { GameData } from "../../../Engine/Core/GameData";
import { AoE_general, AoE, getRandomInt } from "../../../Engine/Core/Helper";
import { _ } from "../../../Engine/UI/Localization";
import { SpellData } from "../../../Engine/Core/SpellData";
import { Projectile } from "../../../Engine/GameObjects/Projectile";

export class Mage extends Mob
{
    constructor(
        scene: Phaser.Scene,
        x: number, y: number,
        sprite: string,
        settings: mRTypes.Settings.Mob,
        subsprite?: string,
        frame?: string | number)
    {
        sprite = 'sheet_mHmage';
        super(scene, x, y, sprite, settings, subsprite, frame);

        this.mobData.addListener(new MageChar(), this.mobData);
        this.mobData.spells['magicBullet'] = new MagicBullet();
        this.mobData.race = _('MountainElf');
        this.mobData.job = _('Mage');
    }

    update(dt: number)
    {
        super.update(dt);
    }
}

export class MageChar extends MountainElfChar
{
    onAdded(mob: MobData, source: MobData)
    {
        this.listen(mob, 'dealDamageFinal', this.onDealDamageFinal);
        this.listen(mob, 'statCalculation', this.onStatCalculation);
    }

    onStatCalculation(mob: MobData)
    {
        mob.battleStats.crit += 20;
    }

    onDealDamageFinal(damageInfo: mRTypes.DamageHeal_Result)
    {
        if (!(damageInfo.spell.flags.has(SpellFlags.isSub) || damageInfo.spell.flags.has(SpellFlags.overTime)) && damageInfo.isCrit)
        {
            (<MagicBullet>(damageInfo.source.spells['magicBullet'])).triggerInstant();
            switch (damageInfo.type)
            {
                case GameData.Elements.ice:

                    // Visual Fx
                    let pos = damageInfo.target.parentMob.footPos();
                    let len = 100;
                    let spread = 120 / 180 * Math.PI;
                    let angle = pos.clone().subtract(damageInfo.source.parentMob.footPos()).angle();
                    let tri = new Phaser.GameObjects.Triangle(
                        damageInfo.target.parentMob.scene,
                        pos.x,
                        pos.y,
                        0,
                        0,
                        Math.cos(angle + spread / 2) * len,
                        Math.sin(angle + spread / 2) * len,
                        Math.cos(angle - spread / 2) * len,
                        Math.sin(angle - spread / 2) * len,
                        0x0000ff,
                        0.0
                    );
                    tri.setOrigin(0, 0);
                    tri.depth = -1;
                    damageInfo.target.parentMob.scene.add.existing(tri);
                    damageInfo.source.parentMob.scene.tweens.add({
                        targets: tri,
                        fillAlpha: { from: 0, to: 0.3 },
                        duration: 150,
                    });
                    damageInfo.source.parentMob.scene.tweens.add({
                        targets: tri,
                        fillAlpha: { from: 0.3, to: 0 },
                        duration: 150,
                        delay: 350,
                    });

                    // Actual effect
                    AoE_general(
                        (mob: Mob) =>
                        {
                            damageInfo.source.parentMob.dealDamageHeal(mob, {
                                value: 10,
                                type: GameData.Elements.ice,
                                spell: { name: _('ElementalBurst') + _(':') + _('ice'), flags: new Set<SpellFlags>([SpellFlags.isSub]) }
                            });
                        },
                        (m) =>
                        {
                            let mPos = m.footPos().clone().subtract(pos);
                            return (<Phaser.Geom.Triangle>(tri.geom)).contains(mPos.x, mPos.y) || (mPos.length() < 25);
                        },
                        damageInfo.target.isPlayer ? Targeting.Player : Targeting.Enemy
                    );

                    break;

                case GameData.Elements.fire:

                    // TODO: Visual Fx

                    // Actual effect
                    AoE(
                        (mob: Mob) =>
                        {
                            mob.receiveDamageHeal({
                                source: damageInfo.source.parentMob,
                                level: damageInfo.source.level,
                                hit: 100,
                                popUp: true,
                                value: damageInfo.value * 0.4,
                                type: GameData.Elements.fire,
                                spell: { name: _('ElementalBurst') + _(':') + _('fire'), flags: new Set<SpellFlags>([SpellFlags.isSub]) }
                            });
                        }, damageInfo.target.parentMob.footPos(), 64,
                        damageInfo.target.isPlayer ? Targeting.Player : Targeting.Enemy
                    );

                    break;

                case GameData.Elements.wind:
                    break;
            }
        }

        return false;
    }
}

export class MagicBullet extends SpellData
{
    constructor()
    {
        super({
            name: 'MagicBullet',
            coolDown: 5.0,
            manaCost: 4,
            requireTarget: true
        });

        this.isCast = true;
        this.isChannel = false;
        this.castTime = 1.0;
    }

    triggerInstant()
    {
        this.isCast = false;
        this.coolDownRemain -= 0.8;
    }

    onCast(mob: Mob, target: Mob | Phaser.Math.Vector2)
    {
        this.isCast = true;

        let type = mob.mobData.currentWeapon.mainElement;
        if (mob.mobData.anotherWeapon)
        {
            type = mob.mobData.anotherWeapon.mainElement;
        }

        new Projectile(mob.x, mob.y, 'sheet_mHproj', {
            'info': { 'name': _(this.name), 'flags': new Set<SpellFlags>([SpellFlags.hasTarget]) },
            'source': mob,
            'target': target,
            'speed': 250,
            'mainType': [type],
            'onMobHit': (self: Spell, mob: Mob) => { self.dieAfter(self.HealDmg, [mob, getRandomInt(20, 35), type], mob); },
            // 'color': Phaser.Display.Color.HexStringToColor("#77ffff"),
            'chasingRange': 400,
            'chasingPower': 1.0,
        }, 0);
    }
}
