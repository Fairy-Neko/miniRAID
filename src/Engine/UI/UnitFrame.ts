/**
 * @packageDocumentation
 * @module UI
 */

import { ProgressBar, TextAlignment } from "./ProgressBar";
import { UnitManager } from "../Core/UnitManager";
import { Mob } from "../GameObjects/Mob";
import { dSprite } from "../DynamicLoader/dSprite";
import { Weapon } from "../Core/EquipmentCore";
import { mRTypes } from "../Core/mRTypes";
import { _ } from "./Localization";

export class WeaponFrame extends Phaser.GameObjects.Container
{
    targetWeapon: Weapon;
    wpIcon: dSprite;
    hitBox: Phaser.Geom.Rectangle;

    constructor(scene: Phaser.Scene, x: number, y: number, target: Weapon)
    {
        super(scene, x, y);
        this.targetWeapon = target;

        this.wpIcon = new dSprite(this.scene, 0, 4, 'img_weapon_icon_test');
        this.wpIcon.setOrigin(0);
        this.wpIcon.setTint((this.targetWeapon && this.targetWeapon.activated) ? 0xffffff : 0x888888);
        this.add(this.wpIcon);

        this.add(new ProgressBar(this.scene, 0, 0,
            () =>
            {
                if (this.targetWeapon)
                {
                    return [this.targetWeapon.weaponGauge, this.targetWeapon.weaponGaugeMax];
                }
                else
                {
                    return [0, 0];
                }
            }, 24, 2, 0, true, 0x000000, 0x333333, 0x659ad2, true, 'smallPx', TextAlignment.Center, 12, -10, 0x659ad2,
            () => 
            {
                if (this.targetWeapon && this.targetWeapon.weaponGauge >= this.targetWeapon.weaponGaugeMax)
                {
                    return "MAX";
                }
                else if (this.targetWeapon && this.targetWeapon.weaponGauge < 0)
                {
                    return "<0?!";
                }
                else
                {
                    return "";
                }
            }));
    }

    setWeapon(target: Weapon)
    {
        this.targetWeapon = target;
        this.wpIcon.setTexture('img_weapon_icon_test');
        this.wpIcon.setTint((this.targetWeapon && this.targetWeapon.activated) ? 0xffffff : 0x888888);
    }

    update(time: number, dt: number)
    {
        this.each((obj: Phaser.GameObjects.GameObject) => { obj.update(); });
    }
}

export class UnitFrame extends Phaser.GameObjects.Container
{
    wpCurrent: WeaponFrame;
    wpAlter: WeaponFrame;
    castingBar: ProgressBar;
    targetMob: Mob;

    constructor(scene: Phaser.Scene, x: number, y: number, target: Mob)
    {
        super(scene, x, y);
        this.targetMob = target;

        // this.add(new Phaser.GameObjects.BitmapText(this.scene, 0, 0, 'simsun_o', target.mobData.name + ": 魔法值"));
        // this.add(new Phaser.GameObjects.BitmapText(this.scene, 0, 3, 'smallPx', "Mana of testGirl0"));

        // Name
        let txt = new Phaser.GameObjects.BitmapText(this.scene, 0, 9, _('UIFont'), target.mobData.name);
        txt.setOrigin(0, 1);
        this.add(txt);

        // Avatar
        let avatar = new Phaser.GameObjects.Image(this.scene, 0, 3, 'elf', 0);
        avatar.setOrigin(1, 0);
        this.add(avatar);

        // Weapon, TODO: switch weapons on click
        this.wpCurrent = new WeaponFrame(this.scene, 75, 7, this.targetMob.mobData.currentWeapon);
        this.wpAlter = new WeaponFrame(this.scene, 105, 7, this.targetMob.mobData.anotherWeapon);

        this.wpCurrent.wpIcon.setInteractive();
        this.wpCurrent.wpIcon.on('pointerdown', () => { this.switchWeapon(); });

        this.wpAlter.wpIcon.setInteractive();
        this.wpAlter.wpIcon.on('pointerdown', () => { this.switchWeapon(); });

        this.add(this.wpCurrent);
        this.add(this.wpAlter);

        // Health
        this.add(new ProgressBar(this.scene, 0, 10, () =>
        {
            return [target.mobData.currentHealth, target.mobData.maxHealth];
        }, 70, 16, 1, true, 0x222222, 0x20604F, 0x1B813E, true, 'smallPx_HUD', TextAlignment.Left, 5, 6, 0xffffff));

        // Mana
        this.add(new ProgressBar(this.scene, 0, 25, () =>
        {
            return [target.mobData.currentMana, target.mobData.maxMana];
        }, 70, 11, 1, true, 0x222222, 0x20604F, 0x33A6B8, true, 'smallPx_HUD', TextAlignment.Left, 5, 2, 0xffffff));

        // Current Spell
        this.castingBar = new ProgressBar(this.scene, 10, 35, () =>
        {
            return [0.3, 1.8];
        }, 60, 4, 1, false, 0x222222, 0x20604F, 0xffe8af, true, _('UIFont'), TextAlignment.Right, 58, 7, 0xffffff, () => _("Wind Blade"));
        this.add(this.castingBar);
    }

    switchWeapon()
    {
        // TODO: switch the weapon
        let res = this.targetMob.mobData.switchWeapon();
        if (res === false)
        {
            return;
        }

        this.wpCurrent.setWeapon(this.targetMob.mobData.anotherWeapon);
        this.wpAlter.setWeapon(this.targetMob.mobData.currentWeapon);

        this.scene.add.tween({
            targets: this.wpCurrent,
            x: { from: 105, to: 75 },
            duration: 200,
        });

        this.scene.add.tween({
            targets: this.wpAlter,
            x: { from: 75, to: 105 },
            duration: 200,
        });
    }

    update(time: number, dt: number)
    {
        if (this.targetMob.mobData.inCasting)
        {

        }
        else if (this.targetMob.mobData.inChanneling)
        {

        }
        else
        {
            this.castingBar.setVisible(false);
        }
        this.each((obj: Phaser.GameObjects.GameObject) => { obj.update(); });
    }
}
