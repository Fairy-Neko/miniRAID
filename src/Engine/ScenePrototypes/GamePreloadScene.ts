/** @packageDocumentation @module ScenePrototypes */

import { Localization } from "../UI/Localization";
import { DynamicLoaderScene } from "../DynamicLoader/DynamicLoaderScene";
import { UIScene } from "../UI/UIScene";
import { TestScene } from "../../TestScene";
import { ItemManager } from "../Core/InventoryCore";
import { ItemList } from "../../Lists/ItemList";
import { ProgressBar } from "../UI/ProgressBar";

import { parse } from 'papaparse';
import { mRTypes } from "../Core/mRTypes";
import { Buff } from "../Core/Buff";

/**
 * Handles all necessary assets that must be loaded before the game start.
 * May also perform necessary processing steps.
 */
export class GamePreloadScene extends Phaser.Scene
{
    currProgress: number = 0;

    create()
    {
        this.load.bitmapFont('smallPx', './assets/fonts/smallPx_C_0.png', './assets/fonts/smallPx_C.fnt');
        this.load.bitmapFont('smallPx_HUD', './assets/fonts/smallPx_HUD_0.png', './assets/fonts/smallPx_HUD.fnt');
        this.load.bitmapFont('mediumPx', './assets/fonts/mediumPx_04b03_0.png', './assets/fonts/mediumPx_04b03.fnt');

        this.load.text('locals', './assets/dataSheets/Locals.csv');
        this.load.json('itemData', 'assets/dataSheets/Items.json');
        this.load.text('buffData', 'assets/dataSheets/Buffs.csv');

        this.add.existing(new ProgressBar(this, 400, 310, () => [this.currProgress, 1.0], 224, 20, 5, false, 0x444444, 0x000000, 0xfddac5, false));
        this.load.on('progress', (value: number) => { this.currProgress = value; });
        this.load.on('complete', () =>
        {
            parse(this.cache.text.get('locals'), {
                complete: (result) =>
                {
                    Localization.setData(this.parseLocales(result));

                    // Create the ItemManager
                    ItemManager.setData(this.cache.json.get('itemData'), ItemList);

                    let buffCSV = <string>(this.cache.text.get('buffData'));
                    parse(buffCSV, {
                        complete: (result) =>
                        {
                            Buff.parsedBuffInfo = this.parseBuffs(result);

                            this.scene.add('TestScene', new TestScene(), true);
                            this.scene.add('UIScene', UIScene.getSingleton(), true);
                            this.scene.add('DynamicLoaderScene', DynamicLoaderScene.getSingleton(), true);
                        }
                    });
                }
            })
        });

        this.load.start();
    }

    parseLocales(result: any): any
    {
        let localesMain: { [index: string]: any } = {};
        let localesPop: { [index: string]: any } = {};

        let currentRowIdx = 3; // Start from 4th row
        for (; currentRowIdx < result.data.length; currentRowIdx++)
        {
            let row = result.data[currentRowIdx];
            if (row[0] === "") { continue; } // This row is empty
            if (row[1] === "true")
            {
                localesPop[row[0]] = {
                    "zh-cn": row[2] || "BAD_STR",
                    "en-us": row[3] || "BAD_STR",
                    "jp-ja": row[4] || "BAD_STR"
                };
            }
            else
            {
                localesMain[row[0]] = {
                    "zh-cn": row[2] || "BAD_STR",
                    "en-us": row[3] || "BAD_STR",
                    "jp-ja": row[4] || "BAD_STR"
                };
            }
        }

        return { "main": localesMain, "popUpBuff": localesPop };
    }

    parseBuffs(result: any): { [index: string]: mRTypes.Settings.Buff }
    {
        let allBuffInfo: { [index: string]: mRTypes.Settings.Buff } = {};

        let currentRowIdx = 3; // Start from 4th row
        for (; currentRowIdx < result.data.length; currentRowIdx++)
        {
            let row = result.data[currentRowIdx];
            if (row[0] === "") { continue; } // This row is empty

            // A: Unique ID
            let uid: string = row[0];
            let buff: mRTypes.Settings.Buff = {};
            buff.name = 'name_' + uid;

            // B, C, D: names
            let name = {
                "zh-cn": row[1],
                "en-us": row[2],
                "ja-jp": row[3],
            }
            Localization.data.main[buff.name] = name;

            // E: color
            buff.color = Phaser.Display.Color.HexStringToColor(row[4]);

            // F, G: countTime, time
            buff.countTime = row[5] === "true";
            buff.time = Number.parseFloat(row[6]);

            // H, I: stackable, maxStack
            buff.stackable = row[7] === "true";
            buff.maxStack = Number.parseInt(row[8]);

            // J, K: imageKey, iconId
            // row[9]
            buff.iconId = Number.parseInt(row[10]);

            // L, M, N: popUpName
            buff.popupName = 'popUp_' + uid;
            let pName = {
                "zh-cn": row[11],
                "en-us": row[12],
                "ja-jp": row[13],
            }
            Localization.data.popUpBuff[buff.popupName] = pName;

            // O, P: UIImportant, UIPriority
            buff.UIimportant = row[14] === "true";
            buff.UIpriority = Number.parseFloat(row[15]);

            // Q, R, S: ToolTip
            buff.toolTip = 'tt_' + uid;
            let ttText = {
                "zh-cn": row[16],
                "en-us": row[17],
                "ja-jp": row[18],
            }
            Localization.data.main[buff.toolTip] = ttText;

            allBuffInfo[uid] = buff;
        }

        console.log("Parsed buffSettings:");
        console.dir(allBuffInfo);
        return allBuffInfo;
    }

    update(time: number, dt: number)
    {
        this.children.each((item: Phaser.GameObjects.GameObject) => { item.update(time, dt / 1000.0); });
    }
}
