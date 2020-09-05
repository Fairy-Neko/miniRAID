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
        knock: 1.8,
        pierce: 2.2,
        fire: 2.0,
        ice: 2.0,
        water: 1.8,
        nature: 2.0,
        wind: 2.2,
        thunder: 2.2,
        light: 1.8,
        dark: 1.8,
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

    export const ElementColorsStr: { [index: string]: string } =
    {
        slash: "#ffffff",
        knock: "#ffffff",
        pierce: "#ffffff",

        fire: "#ffa342",
        ice: "#72ffe2",
        water: "#5b8fff",
        nature: "#b1ed1a",
        wind: "#aaffc8",
        thunder: "#fffb21",
        light: "#fffbd1",
        dark: "#8d47bf",

        miss: "#ff19e0",
        heal: "#66f95c",
    }

    export const ElementColors: { [index: string]: Phaser.Display.Color } =
    {
        slash: Phaser.Display.Color.HexStringToColor(ElementColorsStr['slash']),
        knock: Phaser.Display.Color.HexStringToColor(ElementColorsStr['knock']),
        pierce: Phaser.Display.Color.HexStringToColor(ElementColorsStr['pierce']),

        fire: Phaser.Display.Color.HexStringToColor(ElementColorsStr['fire']),
        ice: Phaser.Display.Color.HexStringToColor(ElementColorsStr['ice']),
        water: Phaser.Display.Color.HexStringToColor(ElementColorsStr['water']),
        nature: Phaser.Display.Color.HexStringToColor(ElementColorsStr['nature']),
        wind: Phaser.Display.Color.HexStringToColor(ElementColorsStr['wind']),
        thunder: Phaser.Display.Color.HexStringToColor(ElementColorsStr['thunder']),
        light: Phaser.Display.Color.HexStringToColor(ElementColorsStr['light']),
        dark: Phaser.Display.Color.HexStringToColor(ElementColorsStr['dark']),

        miss: Phaser.Display.Color.HexStringToColor(ElementColorsStr['miss']),
        heal: Phaser.Display.Color.HexStringToColor(ElementColorsStr['heal']),
    }

    export const rarityColor = ["#888", "#fff", "#3f3", "#3af", "#fb3", "#faa"];
    export const rarityName = ["rare0", "rare1", "rare2", "rare3", "rare4", "rare5"];

    export const playerMax: number = 8;
    export let playerSparse: number = 12;
    export let playerSparseInc: number = 2;
    export let useAutomove: boolean = true;
    export let moveThreshold: number = 150;

    export let popUpSmallFont: boolean = true;
    export let popUpBuffLanguage: mRTypes.Languages = mRTypes.Languages.ENG;
    export let mainLanguage: mRTypes.Languages = mRTypes.Languages.ENG;
    export let showManaNumber: boolean = true;

    export const healTaunt: number = 2;
}
