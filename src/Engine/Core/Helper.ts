/** @module Helper */

import { Mob } from "../GameObjects/Mob";
import { mRTypes } from "./mRTypes";

export function HealDmg(info: mRTypes.DamageHeal_FrontEnd)
{
    if (info.type === 'heal')
    {
        info.target.receiveHeal(info);
    }
    else
    {
        info.target.receiveDamage(info);
    }
}

export function getRandomInt(min: number, max: number): number 
{
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

export function getRandomFloat(min: number, max: number): number 
{
    return Math.random() * (max - min) + min;
}

export function radian(degree: number): number
{
    return degree / 180.0 * Math.PI;
}
