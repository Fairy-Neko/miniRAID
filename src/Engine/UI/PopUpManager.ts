/**
 * @packageDocumentation
 * @module UI
 */

import { GameData } from "../Core/GameData";
import { UIScene } from "./UIScene";
import { mRTypes } from "../Core/mRTypes";
import { _ } from "./Localization";

// import * as Phaser from 'phaser'

export class PopupText extends Phaser.GameObjects.BitmapText
{
    timeMax: number;
    baseAlpha: number;
    time: number;
    velX: number;
    velY: number;
    accX: number;
    accY: number;

    dead: boolean;

    constructor(
        scene: Phaser.Scene, x: number, y: number, text: string,
        color: number,
        time: number = 1.0,
        velX: number = -64, velY: number = -256,
        accX: number = 0.0, accY: number = 512.0, isBuff: boolean = false, alpha: number = 1.0,
        scale: number = 1,)
    {
        if (isBuff)
        {
            let font = _('buffFont');
            super(scene, x, y, font, text);
        }
        else
        {
            super(scene, x, y, GameData.popUpSmallFont ? 'smallPx' : 'mediumPx', text, -scale * (GameData.popUpSmallFont ? 10 : 16));
        }

        this.time = time;
        this.timeMax = time;
        this.baseAlpha = alpha;
        this.velX = velX / scale;
        this.velY = velY / scale;
        this.accX = accX / scale;
        this.accY = accY / scale;

        // this.scale = scale;

        this.dead = false;
        this.setTint(color);
        this.setLetterSpacing(1);
        this.setOrigin(0.5, 0.0);
    }

    update(dt: number)
    {
        // perhaps we don't need this?
        super.update();

        this.time -= dt;

        if (this.time < 0)
        {
            this.dead = true;
            return;
        }

        this.x += this.velX * dt;
        this.y += this.velY * dt;
        this.velX += this.accX * dt;
        this.velY += this.accY * dt;

        this.alpha = Math.max(this.time, (this.time / this.timeMax)) * this.baseAlpha;
    }
}

export class PopUpManager extends Phaser.GameObjects.Container
{
    textList: Set<PopupText>;
    static instance: PopUpManager;
    loaded: boolean = false;

    static getSingleton(): PopUpManager
    {
        if (!PopUpManager.instance)
        {
            return undefined;
            console.log("registering Popup Manager...");
        }
        return PopUpManager.instance;
    }

    static register(scene: Phaser.Scene, x: number = 0, y: number = 0): PopUpManager
    {
        PopUpManager.instance = new PopUpManager(scene, x, y);
        return PopUpManager.instance;
    }

    constructor(scene: Phaser.Scene, x: number, y: number)
    {
        super(scene, x, y);
        this.textList = new Set<PopupText>();
    }

    hasLoaded()
    {
        this.loaded = true;
    }

    addText(
        text: string,
        posX: number = 100,
        posY: number = 100,
        color: Phaser.Display.Color = new Phaser.Display.Color(255, 255, 255, 255),
        time: number = 1.0,
        velX: number = -64,
        velY: number = -256, // jumping speed
        accX: number = 0.0,   // gravity
        accY: number = 512,// gravity
        alpha: number = 1,
        scale: number = 1,
    )
    {
        if (this.loaded)
        {
            let txt = new PopupText(this.scene, posX, posY, text, color.color, time, velX, velY, accX, accY, false, alpha, scale);
            this.add(txt);
        }
    }

    addText_nonDigit(
        text: string,
        posX: number = 100,
        posY: number = 100,
        color: Phaser.Display.Color = new Phaser.Display.Color(255, 255, 255, 255),
        time: number = 1.0,
        velX: number = -64,
        velY: number = -256, // jumping speed
        accX: number = 0.0,   // gravity
        accY: number = 512,// gravity
    )
    {
        if (this.loaded)
        {
            let txt = new PopupText(this.scene, posX, posY, text, color.color, time, velX, velY, accX, accY, true);
            this.add(txt);
        }
    }

    preUpdate(time: number, dt: number)
    {
        this.each(
            (item: Phaser.GameObjects.GameObject) => 
            {
                item.update(dt / 1000.0);
                if (item instanceof PopupText)
                {
                    if (item.dead)
                    {
                        item.destroy();
                    }
                }
            }
        );
    }
}
