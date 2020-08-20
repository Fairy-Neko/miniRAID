/**
 * @packageDocumentation
 * @module UI
 */

export class DraggableScene extends Phaser.Scene
{
    screenX: number;
    screenY: number;
    sizeX: number;
    sizeY: number;

    constructor(config: Phaser.Types.Scenes.SettingsConfig)
    {
        super(config);
    }

    create()
    {
        this.cameras.main.setViewport(this.screenX, this.screenY, this.sizeX, this.sizeY);
    }

    update(time: number, dt: number)
    {

    }
}