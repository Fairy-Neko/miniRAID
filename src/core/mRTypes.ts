/** @module Core */

import { Weapon, Armor, Accessory } from "./EquipmentCore";
import dSprite from "../DynamicLoader/dSprite";
import Mob from "../Mob";
import { SpellData, MobData } from "./DataBackend";
import dPhysSprite from "../DynamicLoader/dPhysSprite";

export namespace Settings
{
    export interface Buff
    {

    }

    export interface SpellData
    {
        name: string;

        coolDown: number;
        manaCost: number;
    }

    export interface MobData
    {
        name:string;
        image?:string;
        
        race?:string;
        class?:string;
        level?:number;

        availableBP?:number;
        availableSP?:number;

        vit?:number;
        str?:number;
        dex?:number;
        tec?:number;
        int?:number;
        mag?:number;

        health?:number;
        damage?:number;
        mana?:number;

        speed?:number;
        movingSpeed?:number;
        attackSpeed?:number;
        spellSpeed?:number;
        resourceCost?:number;

        baseSpeed?:number;
        baseAttackSpeed?:number;

        weaponLeft?: Weapon;
        weaponRight?: Weapon;
        armor?: Armor;
        accessory?: Accessory;

        isPlayer?: boolean;
        tauntMul?: number;

        mobConstructor?: MobConstructor;
    }

    export interface Mob
    {
        sprite:   dPhysSprite;
        moveAnim: string;
    }
}

export type FilterFunc<T> = (arg: T) => boolean;
export type CompareFunc<T> = (lhs: T, rhs: T) => number;
export type FailCallback<T> = (arg: T) => boolean;

export interface MobConstructor
{
    new (settings:Settings.Mob): Mob;
}

export interface BaseStats
{
    vit: number;
    str: number;
    dex: number;
    tec: number;
    int: number;
    mag: number;

    [index:string] : number;
}

export interface MobSpeedModifiers
{
    speed: number;
    movingSpeed: number;
    attackSpeed: number;
    spellSpeed: number;
    resourceCost: number;

    [index:string] : number;
}

export interface AllTypes<T>
{
    physical: T;
    elemental: T;
    pure: T; // It should be 0

    slash: T;
    knock: T;
    pierce: T;
    fire: T;
    ice: T;
    water: T;
    nature: T;
    wind: T;
    thunder: T;
    light: T;

    heal: T;

    [index:string] : T;
}

export interface LeafTypes<T>
{
    slash: T;
    knock: T;
    pierce: T;
    fire: T;
    ice: T;
    water: T;
    nature: T;
    wind: T;
    thunder: T;
    light: T;
    heal: T;

    [index:string] : T;
}

export interface DamageHeal
{
    source?: MobData;
    target: MobData;
    value: LeafTypes<number>;
    overdeal: LeafTypes<number>;
    isCrit: boolean;
    isAvoid: boolean;
    isBlock: boolean;
    spell?: SpellData;
}

export interface BattleStats
{
    resist: AllTypes<number>;

    attackPower: AllTypes<number>;

    // Write a helper to get hit / avoid / crit percentage from current level and parameters ?
    // Percentage
    // Those are basic about overall hit accuracy & avoid probabilities, critical hits.
    // Advanced actions (avoid specific spell) should be calculated inside onReceiveDamage() etc.
    // Same for shields, healing absorbs (Heal Pause ====...===...==...=>! SS: [ABSORB]!!! ...*&@^#), etc.
    hitAcc: number;
    avoid: number;

    // Percentage
    crit: number; // Should crit have types? e.g. physical elemental etc.
    antiCrit: number;

    // Parry for shield should calculate inside the shield itself when onReceiveDamage().

    attackRange: number;
    extraRange: number;
}

export interface SpellDictionary 
{
    [index: string]: SpellData;
}

export interface HTMLToolTip
{
    title: string;
    text: string;
}