import dSprite from './DynamicLoader/dSprite'

export default class Mob
{
    sprite:dSprite;
    moveAnim:string;

    constructor(sprite: dSprite, moveAnim:string)
    {
        this.sprite = sprite;
        this.moveAnim = moveAnim;

        if(this.moveAnim)
        {
            this.sprite.play(this.moveAnim);
        }
    }

    update(dt:number)
    {
        this.sprite.x += dt / 1000.0 * 10;
    }
}