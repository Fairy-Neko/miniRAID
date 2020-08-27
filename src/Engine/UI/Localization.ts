/**
 * @packageDocumentation
 * @module UI
 */

import { GameData } from "../Core/GameData";
import { mRTypes } from "../Core/mRTypes";

export class Localization
{
    static data: any;

    static setData(data: any)
    {
        Localization.data = data;
    }

    static setOneData(key: string, data: any, isPopUp: boolean = false)
    {
        if (isPopUp)
        {
            Localization.data.popUpBuff[key] = data;
        }
        else
        {
            Localization.data.main[key] = data;
        }
    }

    static getStr(s: string, overrideLanguage?: mRTypes.Languages): any
    {
        if (Localization.data)
        {
            if (Localization.data.main.hasOwnProperty(s))
            {
                return Localization.data.main[s][overrideLanguage || GameData.mainLanguage];
            }
            else if (Localization.data.popUpBuff.hasOwnProperty(s))
            {
                return Localization.data.popUpBuff[s][overrideLanguage || GameData.popUpBuffLanguage];
            }

            return s;
        }
        return 'LOCAL_NOT_LOADED';
    }
}

export function _(s: string, overrideLanguage?: mRTypes.Languages): any
{
    return Localization.getStr(s, overrideLanguage);
}
