/** @module GameEntity */

import dSprite from './DynamicLoader/dSprite'
import * as mRTypes from './core/mRTypes'
import { MobData } from './core/DataBackend';
import dPhysSprite from './DynamicLoader/dPhysSprite';

export default class Mob
{
    sprite:dPhysSprite;
    moveAnim:string;
    idleAnim:string;
    deadAnim:string;

    data:MobData;

    constructor(settings:mRTypes.Settings.Mob)
    {
        this.sprite = settings.sprite;
        this.moveAnim = settings.moveAnim;

        if(this.moveAnim)
        {
            this.sprite.play(this.moveAnim);
        }

        this.sprite.setOrigin(0.5, 0.8);
    }

    update(dt:number)
    {
        this.sprite.x += dt / 1000.0 * 10;
    }

    getEquipableTags(type:string):string[]
    {
        return [];
    }

    doAttack(dt: number) : boolean
    {
        throw new Error("Method not implemented.");
    }

    static checkExist(mob?:Mob):boolean
    {
        return (mob == null);
    }

    static checkAlive(mob?:Mob):boolean
    {
        return (Mob.checkExist(mob) && (mob.data.alive === true));
    }
}