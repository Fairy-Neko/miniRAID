/** @packageDocumentation @module UI */

export enum TextAlignment
{
    Left = 0,
    Center = 1,
    Right = 2,
}

export class ProgressBar extends Phaser.GameObjects.Container
{
    fetchFunc: undefined | (() => [number, number]);
    out: Phaser.GameObjects.Rectangle;
    bg: Phaser.GameObjects.Rectangle;
    fill: Phaser.GameObjects.Rectangle;
    text: Phaser.GameObjects.BitmapText;
    fillMaxLength: number;

    maxV: number;
    curV: number;

    constructor(
        scene: Phaser.Scene, x: number, y: number,
        fetchValue: undefined | (() => [number, number]) = undefined,
        width: number = 100, height: number = 10,
        border: number = 1,
        outlineColor: number = 0xffffff, bgColor: number = 0x20604f, fillColor: number = 0x1b813e,
        showText: boolean = true, fontKey: string = 'smallPx_HUD', align: TextAlignment = TextAlignment.Left, textX: number = 0, textY: number = 0, textColor: number = 0xffffff)
    {
        super(scene, x, y);

        this.fetchFunc = fetchValue;
        this.out = new Phaser.GameObjects.Rectangle(this.scene, 0, 0, width, height, outlineColor);
        this.out.setOrigin(0);
        this.bg = new Phaser.GameObjects.Rectangle(this.scene, border, border, width - border * 2, height - border * 2, bgColor);
        this.bg.setOrigin(0);
        this.bg.setPosition(border, border);
        this.fill = new Phaser.GameObjects.Rectangle(this.scene, border, border, width - border * 2, height - border * 2, fillColor);
        this.fill.setOrigin(0);
        this.fill.setPosition(border, border);

        this.text = new Phaser.GameObjects.BitmapText(this.scene, textX, textY, fontKey, '0/0');
        this.text.setOrigin(align * 0.5, 0);
        this.text.setTint(textColor);

        if (border > 0)
        {
            this.add(this.out);
        }
        this.add(this.bg);
        this.add(this.fill);
        if (showText)
        {
            this.add(this.text);
        }

        this.fillMaxLength = width - border * 2;

        this.maxV = 100;
        this.curV = 100;
    }

    update(time: number, dt: number)
    {
        if (this.fetchFunc)
        {
            let v = this.fetchFunc();
            this.setValue(v[0], v[1]);
        }
    }

    setValue(value: number, max: number = undefined)
    {
        if (max === undefined)
        {
            max = this.maxV;
        }
        // this.fill.width = this.fillMaxLength * (value / max);

        this.scene.tweens.add({
            targets: this.fill,
            width: this.fillMaxLength * (value / max),
            yoyo: false,
            repeat: 0,
            duration: 100,
        })

        this.text.text = value.toFixed(0) + "/" + max.toFixed(0);
    }
}
