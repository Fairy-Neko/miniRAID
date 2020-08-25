/**
 * @packageDocumentation
 * @module UI
 */

import { ProgressBar, TextAlignment } from "./ProgressBar";
import { UnitManager } from "../Core/UnitManager";
import { Mob } from "../GameObjects/Mob";
import { dSprite } from "../DynamicLoader/dSprite";

export class UnitFrame extends Phaser.GameObjects.Container
{
    wpCurrent: Phaser.GameObjects.Image;
    wpAlter: Phaser.GameObjects.Image;
    targetMob: Mob;

    constructor(scene: Phaser.Scene, x: number, y: number, target: Mob)
    {
        super(scene, x, y);
        this.targetMob = target;

        // this.add(new Phaser.GameObjects.BitmapText(this.scene, 0, 0, 'simsun_o', target.mobData.name + ": 魔法值"));
        // this.add(new Phaser.GameObjects.BitmapText(this.scene, 0, 3, 'smallPx', "Mana of testGirl0"));

        // Name
        let txt = new Phaser.GameObjects.BitmapText(this.scene, 0, 9, 'smallPx', target.mobData.name);
        txt.setOrigin(0, 1);
        this.add(txt);

        // Avatar
        let avatar = new Phaser.GameObjects.Image(this.scene, 0, 10, 'elf', 0);
        avatar.setOrigin(1, 0);
        this.add(avatar);

        // Weapon, TODO: switch weapons on click
        this.wpCurrent = new dSprite(this.scene, 75, 11, 'img_weapon_icon_test');
        this.wpCurrent.setOrigin(0);
        this.wpCurrent.setInteractive();
        this.add(this.wpCurrent);

        this.wpAlter = new dSprite(this.scene, 105, 11, 'img_weapon_icon_test');
        this.wpAlter.setOrigin(0);
        this.wpAlter.setTint(0x888888);
        this.wpAlter.setInteractive();
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
        this.add(new ProgressBar(this.scene, 10, 35, () =>
        {
            return [0.3, 1.8];
        }, 60, 4, 1, false, 0x222222, 0x20604F, 0xffe8af, true, 'smallPx', TextAlignment.Right, 58, 7, 0xffffff, () => "Wind Blade"));
    }

    update(time: number, dt: number)
    {
        this.each((obj: Phaser.GameObjects.GameObject) => { obj.update(); });
    }
}
