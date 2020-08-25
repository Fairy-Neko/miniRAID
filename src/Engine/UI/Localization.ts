/**
 * @packageDocumentation
 * @module UI
 */

import { GameData } from "../Core/GameData";

export class Localization
{
    static data: any;

    static setData(data: any)
    {
        Localization.data = data;
    }

    static getStr(s: string): any
    {
        if (Localization.data)
        {
            if (Localization.data.main.hasOwnProperty(s))
            {
                return Localization.data.main[s][GameData.mainLanguage];
            }
            else if (Localization.data.popUpBuff.hasOwnProperty(s))
            {
                return Localization.data.popUpBuff[s][GameData.popUpBuffLanguage];
            }

            return s;
        }
        return 'LOCAL_NOT_LOADED';
    }
}

export function _(s: string): any
{
    return Localization.getStr(s);
}
