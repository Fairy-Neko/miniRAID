/** @module Core */

import { MobListener, MobData } from './DataBackend'

export class Equipable extends MobListener
{
    equipper:MobData;

    constructor()
    {
        super();
    }
}

export class Armor extends Equipable
{

}

export class Weapon extends Equipable
{
    baseAttackSpeed: number;
    manaRegen: number;
}

export class Accessory extends Equipable
{

}