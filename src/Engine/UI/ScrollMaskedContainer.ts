/**
 * @packageDocumentation
 * @module UI
 */

export enum ScrollDirc
{
    Vertical = 'height',
    Horizontal = 'width'
}

export class ScrollMaskedContainer extends Phaser.GameObjects.Container
{
    rect: Phaser.GameObjects.Image;
    contentStart: number;
    contentLength: number;
    contentPosition: number;
    dirc: ScrollDirc;

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, dirc: ScrollDirc = ScrollDirc.Vertical)
    {
        super(scene, x, y);

        this.rect = this.scene.make.image({ add: false });
        // this.rect.fillStyle(0x00ffff);
        // this.rect.fillRect(x, y, width, height);
        this.rect.x = x;
        this.rect.y = y;
        this.rect.displayWidth = width;
        this.rect.displayHeight = height;
        this.rect.setOrigin(0);

        let mask = new Phaser.Display.Masks.BitmapMask(this.scene, this.rect);
        this.mask = mask;

        this.setSize(width, height);
        this.setInteractive();
        this.input.hitArea.x = width / 2;
        this.input.hitArea.y = height / 2;
        this.on('wheel', this.onWheel);

        this.dirc = dirc;
        if (this.dirc == ScrollDirc.Vertical) { this.contentStart = y; }
        if (this.dirc == ScrollDirc.Horizontal) { this.contentStart = x; }
    }

    updateContentLength()
    {
        let rect = this.getBounds();
        if (this.dirc == ScrollDirc.Vertical)
        {
            this.contentLength = rect.height;
            this.contentPosition = this.y - rect.y;
        }
        else
        {
            this.contentLength = rect.width;
            this.contentPosition = this.x - rect.x;
        }
        console.log(this.contentPosition);
        console.log(this.contentLength);
    }

    onWheel(evt: Phaser.Input.Pointer)
    {
        if (this.rect.getBounds().contains(evt.position.x, evt.position.y))
        {
            if (this.dirc == ScrollDirc.Vertical)
            {
                this.contentPosition += evt.deltaY * 0.1;
                this.contentPosition = Math.max(0, Math.min(this.contentPosition, this.contentLength - this.rect.displayHeight));
                this.y = this.rect.y - this.contentPosition;
            }
            else
            {
                this.contentPosition += evt.deltaY * 0.1;
                this.contentPosition = Math.max(0, Math.min(this.contentPosition, this.contentLength - this.rect.displayWidth));
                this.x = this.rect.x - this.contentPosition;
            }
        }
    }
}
