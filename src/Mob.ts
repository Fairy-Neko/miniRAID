export default class Mob
{
    sprite:Phaser.GameObjects.Sprite;
    moveAnim:string;

    constructor(sprite:Phaser.GameObjects.Sprite, moveAnim:string)
    {
        this.sprite = sprite;
        this.moveAnim = moveAnim;

        this.sprite.play(this.moveAnim);
    }

    update(dt:number)
    {
        this.sprite.x += dt / 1000.0 * 10;
    }
}