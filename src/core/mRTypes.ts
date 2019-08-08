/** @module Core */

import { Weapon, Armor, Accessory } from "./EquipmentCore";
import dSprite from "../DynamicLoader/dSprite";
import Mob from "../Mob";
import { SpellData, MobData } from "./DataBackend";

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
        image:string;
        
        race:string;
        class:string;
        level:number;

        availableBP:number;
        availableSP:number;

        vit:number;
        str:number;
        dex:number;
        tec:number;
        int:number;
        mag:number;

        health:number;
        damage:number;
        mana:number;

        speed:number;
        movingSpeed:number;
        attackSpeed:number;
        spellSpeed:number;
        resourceCost:number;

        baseSpeed:number;
        baseAttackSpeed:number;

        weaponLeft: Weapon;
        weaponRight: Weapon;
        armor: Armor;
        accessory: Accessory;

        isPlayer: boolean;
        tauntMul: number;

        mobConstructor: MobConstructor;
    }

    export interface Mob
    {
        sprite:   dSprite;
        moveAnim: string;
    }
}

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
}

export interface MobSpeedModifiers
{
    speed: number;
    movingSpeed: number;
    attackSpeed: number;
    spellSpeed: number;
    resourceCost: number;
}

export interface AllTypeNumbers
{
    physical: number;
    elemental: number;
    pure: number; // It should be 0

    slash: number;
    knock: number;
    pierce: number;
    fire: number;
    ice: number;
    water: number;
    nature: number;
    wind: number;
    thunder: number;
    light: number;

    heal: number;
}

export interface LeafTypeNumbers
{
    slash: number;
    knock: number;
    pierce: number;
    fire: number;
    ice: number;
    water: number;
    nature: number;
    wind: number;
    thunder: number;
    light: number;
    heal: number;
}

export interface DamageHeal
{
    source?: MobData;
    target: MobData;
    value: LeafTypeNumbers;
    overdeal: LeafTypeNumbers;
    isCrit: boolean;
    isAvoid: boolean;
    isBlock: boolean;
    spell?: SpellData;
}

export interface BattleStats
{
    resist: AllTypeNumbers;

    attackPower: AllTypeNumbers;

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