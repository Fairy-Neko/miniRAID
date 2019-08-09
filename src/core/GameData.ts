/** @module Core */

import { AllTypes, LeafTypes } from "./mRTypes";

const damageType:AllTypes<string> = {
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
    physical: "pure",
    elemental: "pure",
    heal: "pure",
    pure: "pure",
}

const critMultiplier:LeafTypes<number> = {
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
    heal: 2.0,
}

export { damageType, critMultiplier };