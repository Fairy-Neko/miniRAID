/** @packageDocumentation @module Core */

import { Weapon, Armor, Accessory } from "./EquipmentCore";
import { dSprite } from "../DynamicLoader/dSprite";
import { Mob as MobEntity } from "../GameObjects/Mob";
import { dPhysSprite } from "../DynamicLoader/dPhysSprite";
import { MobAgent } from "../Agents/MobAgent";
import * as MobData from "./MobData";
import { SpellData } from "./SpellData";
import { SpellFlags, Spell as SpellEntity, DummySpell as DummySpellEntity } from "../GameObjects/Spell";
import { Dictionary } from "typescript-collections";
import { GameData } from "./GameData";

export namespace mRTypes
{
    export namespace Settings
    {
        export interface Buff
        {
            name?: string;

            countTime?: boolean;
            time?: number;

            stacks?: integer;
            stackable?: boolean;
            maxStack?: integer;

            iconId?: integer;
            color?: Phaser.Display.Color;
            popupName?: string;
            popupColor?: Phaser.Display.Color;

            source?: MobData.MobData;

            UIimportant?: boolean;
            UIpriority?: number;

            toolTip?: string;
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
            job?: string;
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
            manaRegen?: number;

            speed?: number;
            movingSpeed?: number;
            attackSpeed?: number;
            spellSpeed?: number;
            resourceCost?: number;

            baseSpeed?: number;
            baseAttackSpeed?: number;

            weaponSubHand?: Weapon;
            weaponMainHand?: Weapon;
            armor?: Armor;
            accessory?: Accessory;

            isPlayer?: boolean;
            tauntMul?: number;

            mobConstructor?: MobConstructor;
        }

        export interface Mob
        {
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

        export interface DummySpell extends Spell
        {
            triggerTime?: number;
            onSpell?: (self: DummySpellEntity, source: MobEntity, target: MobEntity) => void;
            onSpellVec2?: (self: DummySpellEntity, source: MobEntity, target: Phaser.Math.Vector2) => void;
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

    export type MobConstructor = (typeof MobEntity);
    export type AgentConstructor = (typeof MobAgent);
    export type TiledObjConstructor = (scene: Phaser.Scene, obj: Phaser.Types.Tilemaps.TiledObject, properties: any) => any;

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
        type: GameData.Elements;
        overdeal?: number;
        isCrit?: boolean;
        isAvoid?: boolean;
        isBlock?: boolean;
        spell?: SpellInfo;
    }

    export interface DamageHeal_FrontEnd
    {
        source?: MobEntity;
        target?: MobEntity;
        value: number;
        type: GameData.Elements;
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
        color?: string;
        bodyStyle?: string;
    }

    export interface ItemData
    {
        showName: string;
        rawName: string;
        color: Phaser.Display.Color;
        tint: boolean;

        level: number;
        rarity: number;

        stackable: boolean;

        eClass: string;
        pClass: string;
        sClass: string;

        image: string;
        iconIdx: number;

        toolTipText: string;

        atkName?: string;
        spName?: string;
    }

    export interface ItemDataStorage
    {
        [index: string]: ItemData;
    }

    export enum Languages
    {
        CHS = 'zh-cn',
        ENG = 'en-us',
        JPN = 'ja-jp',
    }
}
