/** @packageDocumentation @module UI */

import { mRTypes } from "../Core/mRTypes";

export enum TextAlignment
{
    Left = 0,
    Center = 1,
    Right = 2,
}

export class ProgressBar extends Phaser.GameObjects.Container
{
    fetchFunc: undefined | (() => [number, number]);
    getText: undefined | (() => string);
    out: Phaser.GameObjects.Rectangle;
    bg: Phaser.GameObjects.Rectangle;
    fill: Phaser.GameObjects.Rectangle;
    text: Phaser.GameObjects.BitmapText;
    textBG: Phaser.GameObjects.Rectangle;
    prevText: string;
    fillMaxLength: number;
    useTween: boolean;
    align: TextAlignment;

    maxV: number;
    curV: number;

    constructor(
        scene: Phaser.Scene, x: number, y: number,
        fetchValue: undefined | (() => [number, number]) = undefined,
        width: number = 100, height: number = 10,
        border: number = 1, hasBG: boolean = true,
        outlineColor: number = 0xffffff, bgColor: number = 0x20604f, fillColor: number = 0x1b813e,
        showText: boolean = true, fontKey: string = 'smallPx_HUD', align: TextAlignment = TextAlignment.Left, textX: number = 0, textY: number = 0, textColor: number = 0xffffff, getText: undefined | (() => string) = undefined, tween: boolean = true, textBG: number = 0x00000000)
    {
        super(scene, x, y);

        this.fetchFunc = fetchValue;
        this.getText = getText;

        this.align = align;
        this.fill = new Phaser.GameObjects.Rectangle(this.scene, border, border, width - border * 2, height - border * 2, fillColor);
        this.fill.setOrigin(0);
        this.fill.setPosition(border, border);

        if (border > 0)
        {
            this.out = new Phaser.GameObjects.Rectangle(this.scene, 0, 0, width, height, outlineColor);
            this.out.setOrigin(0);
            this.add(this.out);
        }
        if (hasBG)
        {
            this.bg = new Phaser.GameObjects.Rectangle(this.scene, border, border, width - border * 2, height - border * 2, bgColor);
            this.bg.setOrigin(0);
            this.bg.setPosition(border, border);
            this.add(this.bg);
        }
        this.add(this.fill);

        if (textBG !== 0x00000000)
        {
            this.textBG = new Phaser.GameObjects.Rectangle(this.scene, textX - 1 + align, textY - 1, 0, 0, textBG >> 8, (textBG & 0x000000FF) / 255);
            this.textBG.setOrigin(align * 0.5, 0);
            this.add(this.textBG);
        }
        if (showText)
        {
            this.text = new Phaser.GameObjects.BitmapText(this.scene, textX, textY, fontKey, '0/0');
            this.text.setOrigin(align * 0.5, 0);
            this.text.setTint(textColor);
            this.add(this.text);
        }

        this.fillMaxLength = width - border * 2;

        this.maxV = 100;
        this.curV = 100;
        this.prevText = "";

        this.useTween = tween;
    }

    update(time: number, dt: number)
    {
        if (this.fetchFunc)
        {
            let v = this.fetchFunc();
            if (v)
            {
                this.setValue(v[0], v[1]);
            }
        }
    }

    setValue(value: number, max: number = undefined)
    {
        if (max === undefined)
        {
            max = this.maxV;
        }
        // this.fill.width = this.fillMaxLength * (value / max);

        if (this.useTween)
        {
            this.scene.tweens.add({
                targets: this.fill,
                width: this.fillMaxLength * Math.max(0.0, Math.min(1.0, value / max)),
                yoyo: false,
                repeat: 0,
                duration: 100,
            });
        }
        else
        {
            this.fill.width = this.fillMaxLength * Math.max(0.0, Math.min(1.0, value / max));
        }

        if (this.text)
        {
            if (this.getText)
            {
                this.text.text = this.getText();
            }
            else
            {
                this.text.text = value.toFixed(0);// + "/" + max.toFixed(0);
            }

            if (typeof this.textBG !== 'undefined' && this.text.text !== this.prevText)
            {
                this.prevText = this.text.text;
                let bounds = this.text.getTextBounds();
                this.textBG.width = bounds.global.width + 4;
                this.textBG.height = bounds.global.height + 4;
                this.textBG.x = bounds.global.x - 2;
                this.textBG.y = bounds.global.y - 2;
            }
        }

    }
}
