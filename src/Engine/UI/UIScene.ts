/**
 * @packageDocumentation
 * @module UI
 */

import { PopUpManager } from "./PopUpManager";
import { UnitFrame } from "./UnitFrame";
import { UnitManager } from "../Core/UnitManager";
import { Mob } from "../GameObjects/Mob";

export class UIScene extends Phaser.Scene
{
    static instance: UIScene;
    loaded: boolean = false;
    unitFrames: UnitFrame[] = [];
    playerCache: Mob[];

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
        this.loaded = true;
        this.initUnitFrames();
    }

    clearUnitFrame()
    {
        for (let u of this.unitFrames)
        {
            u.destroy();
        }
        this.unitFrames = [];
    }

    resetPlayers()
    {
        this.clearUnitFrame();

        this.playerCache = Array.from(UnitManager.getCurrent().player.values());
        if (this.loaded)
        {
            this.initUnitFrames();
        }
    }

    initUnitFrames()
    {
        if (this.playerCache === undefined) { return; }
        let cnt = 0;
        for (let player of this.playerCache)
        {
            let tmp = new UnitFrame(this, 35 + (cnt % 4) * 180, 524 + Math.floor(cnt / 4) * 70, player);
            // let tmp = new UnitFrame(this, 20, 20 + cnt * 70, player);
            this.add.existing(tmp);
            this.unitFrames.push(tmp);
            cnt += 1;
        }
    }

    update(time: number, dt: number)
    {
        this.children.each((item: Phaser.GameObjects.GameObject) => { item.update(time / 1000.0, dt / 1000.0); });
    }
}
