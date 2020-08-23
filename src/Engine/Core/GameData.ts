/** @packageDocumentation @module Core */

import { mRTypes } from "./mRTypes";


export namespace GameData
{
    export const damageType: mRTypes.AllTypes<string> = {
        slash: "physical",
        knock: "physical",
        pierce: "physical",
        fire: "elemental",
        ice: "elemental",
        water: "elemental",
        nature: "elemental",
        wind: "elemental",
        thunder: "elemental",

        // Let them just add 0 (as themselves when calculating) for convinence
        light: "pure",
        dark: "pure",
        physical: "pure",
        elemental: "pure",
        heal: "pure",
        pure: "pure",
    }

    export const critMultiplier: mRTypes.LeafTypes<number> = {
        slash: 2.0,
        knock: 1.6,
        pierce: 2.5,
        fire: 2.0,
        ice: 2.0,
        water: 1.6,
        nature: 2.0,
        wind: 2.5,
        thunder: 2.5,
        light: 1.6,
        dark: 1.6,
        heal: 2.0,
    }

    export enum Elements
    {
        slash = 'slash',
        knock = 'knock',
        pierce = 'pierce',
        fire = 'fire',
        ice = 'ice',
        water = 'water',
        nature = 'nature',
        wind = 'wind',
        thunder = 'thunder',
        light = 'light',
        dark = 'dark',
        heal = 'heal',
    }

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

    export const playerMax: number = 8;
    export let playerSparse: number = 12;
    export let playerSparseInc: number = 2;
    export let useAutomove: boolean = false;
    export let moveThreshold: number = 150;

    export const healTaunt: number = 2;
}
