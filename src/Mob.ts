/** @module GameEntity */

import dSprite from './DynamicLoader/dSprite'
import * as mRTypes from './core/mRTypes'
import { MobData } from './core/DataBackend';

export default class Mob
{
    sprite:dSprite;
    moveAnim:string;

    data:MobData;

    constructor(settings:mRTypes.Settings.Mob)
    {
        this.sprite = settings.sprite;
        this.moveAnim = settings.moveAnim;

        if(this.moveAnim)
        {
            this.sprite.play(this.moveAnim);
        }
    }

    update(dt:number)
    {
        this.sprite.x += dt / 1000.0 * 10;
    }

    getEquipableTags(type:string):string[]
    {
        return [];
    }

    static checkExist(mob?:Mob):boolean
    {
        return (mob == null);
    }
}