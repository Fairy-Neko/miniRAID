/** @packageDocumentation @module Core */

// import { MobListener, MobListenerType, MobData } from "./DataBackend";
import { mRTypes } from "./mRTypes";
import { MobListener } from "./MobListener";
import { MobData } from "./MobData";

export class Buff extends MobListener
{
    name: string;

    countTime: boolean;
    timeMax: number;
    timeRemain: number;

    stacks: integer;
    stackable: boolean;
    maxStack: integer;
    // multiply: boolean; // Used to decide if the buff can be applied multiple times by a same source.

    iconId: integer;
    color: Phaser.Display.Color; // ?
    popupName: string;
    popupColor: Phaser.Display.Color;

    source: MobData;
    toolTip: mRTypes.HTMLToolTip;

    constructor(settings: mRTypes.Settings.Buff)
    {
        super();
    }

    /**
     * Addes one stack of itself.
     */
    addStack()
    {

    }
}
