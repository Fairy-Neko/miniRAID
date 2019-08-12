/** @module Core */

import { MobListener, MobData } from './DataBackend'
import Mob from '../Mob';

export enum EquipmentType
{
    All,
    Accessory,
    Armor,
    Weapon,
}

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
    manaCost: number;
    manaRegen: number;

    isInRange(mob: Mob, target: Mob) : boolean
    {
        throw new Error("Method not implemented.");
    }

    grabTargets(mob: Mob):Array<Mob> 
    {
        return [];
    }

    attack(source: Mob, target: Mob)
    {
        throw new Error("Method not implemented.");
    }
}

export class Accessory extends Equipable
{

}