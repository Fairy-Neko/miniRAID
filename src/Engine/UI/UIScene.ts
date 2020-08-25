/**
 * @packageDocumentation
 * @module UI
 */

import { PopUpManager } from "./PopUpManager";
import { UnitFrame } from "./UnitFrame";

export class UIScene extends Phaser.Scene
{
    static instance: UIScene;
    loaded: boolean = false;

    static getSingleton(): UIScene
    {
        if (!UIScene.instance)
        {
            UIScene.instance = new UIScene({ key: 'UIScene' });
            console.log("registering UI Scene...");
        }
        return UIScene.instance;
    }

    preload()
    {
        this.load.bitmapFont('smallPx', './assets/fonts/smallPx_C_0.png', './assets/fonts/smallPx_C.fnt');
        this.load.bitmapFont('smallPx_HUD', './assets/fonts/smallPx_HUD_0.png', './assets/fonts/smallPx_HUD.fnt');
        this.load.bitmapFont('mediumPx', './assets/fonts/mediumPx_04b03_0.png', './assets/fonts/mediumPx_04b03.fnt');
        this.load.bitmapFont('simsun', './assets/fonts/simsun_0.png', './assets/fonts/simsun.fnt');
        this.load.bitmapFont('simsun_o', './assets/fonts/simsun_outlined_0.png', './assets/fonts/simsun_outlined.fnt');

        this.add.existing(PopUpManager.register(this));
    }

    create()
    {
        this.add.existing(new UnitFrame(this, 300, 300));
    }

    update(time: number, dt: number)
    {
        this.children.each((item: Phaser.GameObjects.GameObject) => { item.update(time / 1000.0, dt / 1000.0); });
    }
}
