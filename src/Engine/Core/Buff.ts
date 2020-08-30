/** @packageDocumentation @module Core */

// import { MobListener, MobListenerType, MobData } from "./DataBackend";
import { mRTypes } from "./mRTypes";
import { MobListener, MobListenerType } from "./MobListener";
import { MobData } from "./MobData";
import { Mob } from "../GameObjects/Mob";
import { PopUpManager } from "../UI/PopUpManager";
import { GameData } from "./GameData";
import { _ } from "../UI/Localization";

export class Buff extends MobListener
{
    name: string;

    countTime: boolean;
    timeMax: number;
    timeRemain: number[];

    stacks: integer;
    stackable: boolean;
    maxStack: integer;
    // multiply: boolean; // Used to decide if the buff can be applied multiple times by a same source.

    imageKey: string;
    iconId: integer;
    tintIcon: boolean;
    color: Phaser.Display.Color; // ?
    popupName: { [index: string]: string } | string;
    popupColor: Phaser.Display.Color;

    source: MobData;
    toolTip: string;

    UIimportant: boolean;
    UIpriority: number;

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
        this.timeRemain = [settings.time];// || this.timeMax;

        //Is the buff over? (should be removed from buff list)
        this.isOver = false;

        //stacks of the buff (if any)
        this.stacks = settings.stacks || 1;
        this.stackable = settings.stackable || false;
        this.maxStack = settings.maxStack || 3;

        //cellIndex of this buff in the buffIcons image, might be shown under boss lifebar / player lifebar
        this.imageKey = settings.imageKey;
        this.iconId = settings.iconId || 0;
        this.tintIcon = settings.tintIcon || false;

        //the color used for UI rendering
        this.color = settings.color || Phaser.Display.Color.HexStringToColor('#56CDEF');

        //when the buff was attached or triggered, a small text will pop up like damages e.g. "SLOWED!"
        this.popupName = settings.popupName || "buff";

        //Color for the popup text. default is this.color.
        this.popupColor = settings.popupColor || this.color;

        //Where does this buff come from?
        this.source = settings.source || undefined;
        if (this.source === undefined)
        {
            console.error(`Buff "${_(this.name)}" does not have a source.`);
        }

        this.toolTip = settings.toolTip || "LOL.";
        this.UIimportant = (settings.UIimportant === undefined) ? false : settings.UIimportant;
        this.UIpriority = (settings.UIpriority === undefined) ? 0 : settings.UIpriority;
    }

    popUp(mob: Mob)
    {
        let popUpPos = mob.getTopCenter();

        PopUpManager.getSingleton().addText_nonDigit(
            (typeof this.popupName === 'string') ? _(this.popupName) : this.popupName[GameData.popUpBuffLanguage],
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
            for (let i = 0; i < this.timeRemain.length; i++)
            {
                this.timeRemain[i] -= dt;
                if (this.timeRemain[i] <= 0)
                {
                    this.stacks -= 1;
                }
            }

            this.timeRemain = this.timeRemain.filter((v: number) => (v > 0));

            // console.log(this.stacks);
            if (this.stacks == 0)
            {
                this.isOver = true;
            }
        }
    }

    preToolTip(): mRTypes.HTMLToolTip { return { title: undefined, text: "", color: Phaser.Display.Color.RGBToString(this.color.red, this.color.green, this.color.blue) }; }

    getTitle(): string
    {
        return _(this.name) + (this.stackable ? ` (${this.stacks})` : "");
    }

    getToolTip(): mRTypes.HTMLToolTip
    {
        let tt = this.preToolTip();
        return {
            "title": `<div><p style='margin:0;'><span>${tt.title || this.getTitle()}</span><span>(${this.timeRemain.length > 0 ? this.timeRemain[0].toFixed(1) : 0}s)</span></p></div>`,

            "text": `
            <div style = "max-width: 200px">
                <p>
                    ${eval("`" + _(this.toolTip) + "`") + tt.text}
                </p>
                ${ this.source ? `<p class = "buffFroms"><span></span><span>${_('buffTT_from') + this.source.name}</span></p>` : ``}
            </div>`,

            "color": tt.color,
            'bodyStyle': 'margin-left: 0; margin-right: 0;'
        };
    }

    /**
     * Addes one stack of itself.
     */
    addStack(time: number): boolean
    {
        if (this.stacks < this.maxStack)
        {
            this.stacks += 1;
            this.timeRemain.push(time);
            return true;
        }
        return false;
    }

    keyFn(): string
    {
        return `${this.name}-${this.source.name}`;
    }

    static parsedBuffInfo: { [index: string]: mRTypes.Settings.Buff };
    static fromKey(key: string, overrideSettings?: mRTypes.Settings.Buff): mRTypes.Settings.Buff
    {
        let cached = Buff.parsedBuffInfo[key];
        if (cached === undefined)
        {
            console.warn(`Buff key "${key}" does not exist.`);
        }
        return { ...cached, ...overrideSettings };
    }
}
