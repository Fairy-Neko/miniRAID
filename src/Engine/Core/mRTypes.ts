/** @module Core */

import { Weapon, Armor, Accessory } from "./EquipmentCore";
import { dSprite } from "../DynamicLoader/dSprite";
import { Mob as MobEntity } from "../GameObjects/Mob";
import { dPhysSprite } from "../DynamicLoader/dPhysSprite";
import { MobAgent } from "../Agents/MobAgent";
import * as MobData from "./MobData";
import { SpellData } from "./SpellData";
import { SpellFlags, Spell as SpellEntity } from "../GameObjects/Spell";

export namespace mRTypes
{
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
            name: string;
            image?: string;

            race?: string;
            class?: string;
            level?: number;

            availableBP?: number;
            availableSP?: number;

            vit?: number;
            str?: number;
            dex?: number;
            tec?: number;
            int?: number;
            mag?: number;

            health?: number;
            damage?: number;
            mana?: number;

            speed?: number;
            movingSpeed?: number;
            attackSpeed?: number;
            spellSpeed?: number;
            resourceCost?: number;

            baseSpeed?: number;
            baseAttackSpeed?: number;

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
            moveAnim: string;
            idleAnim: string;
            deadAnim: string;

            backendData: MobData.MobData;

            agent: AgentConstructor;
        }

        export interface Spell
        {
            info?: SpellInfo;

            source: MobEntity;
            target?: MobEntity | Phaser.Math.Vector2;

            onHit?: (self: SpellEntity, arg: Phaser.GameObjects.GameObject) => void;
            onMobHit?: (self: SpellEntity, arg: MobEntity) => void;
            onWorldHit?: (self: SpellEntity, arg: Phaser.GameObjects.GameObject) => void;
            onDestroy?: (self: SpellEntity, arg: Phaser.GameObjects.GameObject) => void;
            onUpdate?: (self: SpellEntity, dt: number) => void;

            color?: Phaser.Display.Color;
        }

        export interface Projectile extends Spell
        {
            chasingRange?: number;
            chasingPower?: number;
            speed?: number;
        }
    }

    export type FilterFunc<T> = (arg: T) => boolean;
    export type CompareFunc<T> = (lhs: T, rhs: T) => number;
    export type FailCallback<T> = (arg: T) => boolean;
    export type weaponGaugeFunc<T> = (arg: T) => number;

    export interface MobConstructor
    {
        new(settings: Settings.Mob): MobEntity;
    }

    export interface AgentConstructor
    {
        new(arg: MobEntity): MobAgent;
    }

    export interface BaseStats
    {
        vit: number;
        str: number;
        dex: number;
        tec: number;
        int: number;
        mag: number;

        [index: string]: number;
    }

    export interface MobSpeedModifiers
    {
        speed: number;
        movingSpeed: number;
        attackSpeed: number;
        spellSpeed: number;
        resourceCost: number;

        [index: string]: number;
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
        dark: T;

        heal: T;

        [index: string]: T;
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
        dark: T;

        heal: T;

        [index: string]: T;
    }

    export interface SpellInfo
    {
        name: string;
        flags: Set<SpellFlags>;
    }

    export interface DamageHeal
    {
        source?: MobData.MobData;
        target: MobData.MobData;
        value: number;
        type: string;
        overdeal?: number;
        isCrit?: boolean;
        isAvoid?: boolean;
        isBlock?: boolean;
        spell?: SpellInfo;
    }

    export interface DamageHeal_FrontEnd
    {
        source?: MobEntity;
        target: MobEntity;
        value: number;
        type: string;
        isCrit?: boolean;
        isAvoid?: boolean;
        isBlock?: boolean;
        spell?: SpellInfo;
        popUp?: boolean;
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
}

export namespace Consts
{
    export const LeafTypesZERO: mRTypes.LeafTypes<number> = { fire: 0, water: 0, ice: 0, wind: 0, nature: 0, light: 0, thunder: 0, slash: 0, pierce: 0, knock: 0, dark: 0, heal: 0 };

    export const ElementColors: { [index: string]: Phaser.Display.Color } =
    {
        slash: Phaser.Display.Color.HexStringToColor("#ffffff"),
        knock: Phaser.Display.Color.HexStringToColor("#ffffff"),
        pierce: Phaser.Display.Color.HexStringToColor("#ffffff"),

        fire: Phaser.Display.Color.HexStringToColor("#ffa342"),
        ice: Phaser.Display.Color.HexStringToColor("#72ffe2"),
        water: Phaser.Display.Color.HexStringToColor("#5b8fff"),
        nature: Phaser.Display.Color.HexStringToColor("#b1ed1a"),
        wind: Phaser.Display.Color.HexStringToColor("#aaffc8"),
        thunder: Phaser.Display.Color.HexStringToColor("#fffb21"),
        light: Phaser.Display.Color.HexStringToColor("#fffbd1"),
        dark: Phaser.Display.Color.HexStringToColor("#8d47bf"),

        miss: Phaser.Display.Color.HexStringToColor("#ff19e0"),
        heal: Phaser.Display.Color.HexStringToColor("#66f95c"),
    }
}
