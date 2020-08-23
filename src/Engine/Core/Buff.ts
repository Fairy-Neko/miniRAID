/** @packageDocumentation @module Core */

// import { MobListener, MobListenerType, MobData } from "./DataBackend";
import { mRTypes } from "./mRTypes";
import { MobListener, MobListenerType } from "./MobListener";
import { MobData } from "./MobData";
import { Mob } from "../GameObjects/Mob";
import { PopUpManager } from "../UI/PopUpManager";

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

        //Name of the buff
        this.name = settings.name || "buff";

        //This listener is a buff
        this.type = MobListenerType.Buff;

        //Does this buff counts time?
        this.countTime = ((settings.countTime === undefined) ? true : settings.countTime);

        //time in seconds, indicates the durtion of buff
        this.timeMax = settings.time || 1.0;

        //time in seconds, will automatically reduce by time
        this.timeRemain = settings.time || this.timeMax;

        //Is the buff over? (should be removed from buff list)
        this.isOver = false;

        //stacks of the buff (if any)
        this.stacks = settings.stacks || 1;
        this.stackable = settings.stackable || false;
        this.maxStack = settings.maxStack || 3;

        //cellIndex of this buff in the buffIcons image, might be shown under boss lifebar / player lifebar
        this.iconId = settings.iconId || 0;

        //the color used for UI rendering
        this.color = settings.color || Phaser.Display.Color.HexStringToColor('#56CDEF');

        //when the buff was attached or triggered, a small text will pop up like damages e.g. "SLOWED!"
        this.popupName = settings.popupName || "buff";

        //Color for the popup text. default is this.color.
        this.popupColor = settings.popupColor || this.color;

        //Where does this buff come from?
        this.source = settings.source || undefined;

        this.toolTip = { title: "Buff", text: "lol." };
    }

    popUp(mob: Mob)
    {
        let popUpPos = mob.getTopCenter();

        PopUpManager.getSingleton().addText(
            this.popupName,
            popUpPos.x, popUpPos.y,
            this.popupColor,
            1.0, 0, -64, 0, 64
        );
    }

    update(self: MobData, dt: number)
    {
        super.update(self, dt);

        if (this.countTime == true)
        {
            this.timeRemain -= dt;
            if (this.timeRemain < 0)
            {
                this.isOver = true;
            }
        }
    }

    showToolTip()
    {
        // TODO
    }

    /**
     * Addes one stack of itself.
     */
    addStack()
    {
    }
}
