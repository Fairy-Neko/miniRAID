/** @module Core */

import { mRTypes } from "./mRTypes";


export namespace GameData
{
    export const damageType:mRTypes.AllTypes<string> = {
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
    
    export const critMultiplier:mRTypes.LeafTypes<number> = {
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
    
    export const playerMax:number = 8;
    export let playerSparse:number = 12;
    export let playerSparseInc:number = 2;
    export let useAutomove:boolean = false;
    export let moveThreshold:number = 150;
    
    export const healTaunt:number = 2;
}
