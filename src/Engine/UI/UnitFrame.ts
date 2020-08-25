/**
 * @packageDocumentation
 * @module UI
 */

import { ProgressBar, TextAlignment } from "./ProgressBar";
import { UnitManager } from "../Core/UnitManager";

export class UnitFrame extends Phaser.GameObjects.Container
{
    rect: Phaser.GameObjects.Rectangle;

    constructor(scene: Phaser.Scene, x: number, y: number)
    {
        super(scene, x, y);
        this.add(new Phaser.GameObjects.BitmapText(this.scene, 0, 0, 'simsun_o', "testGirl0: 魔法值"));
        // this.add(new Phaser.GameObjects.BitmapText(this.scene, 0, 3, 'smallPx', "Mana of testGirl0"));

        this.add(new ProgressBar(this.scene, 0, 14, () =>
        {
            let a = Array.from(UnitManager.getCurrent().player.values());
            return [a[0].mobData.currentMana, a[0].mobData.maxMana];
        }, 100, 3, 0, 0x222222, 0x20604F, 0x33A6B8, true, 'smallPx', TextAlignment.Right, 95, 5, 0xffffff));
    }

    update(time: number, dt: number)
    {
        this.each((obj: Phaser.GameObjects.GameObject) => { obj.update(); });
    }
}
