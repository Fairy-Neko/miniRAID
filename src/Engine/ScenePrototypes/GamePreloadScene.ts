/** @packageDocumentation @module ScenePrototypes */

import { Localization, _ } from "../UI/Localization";
import { DynamicLoaderScene } from "../DynamicLoader/DynamicLoaderScene";
import { UIScene } from "../UI/UIScene";
import { TestScene } from "../../TestScene";
import { ItemManager } from "../Core/InventoryCore";
import { ItemList } from "../../Lists/ItemList";
import { ProgressBar } from "../UI/ProgressBar";

import { parse } from 'papaparse';
import { mRTypes } from "../Core/mRTypes";
import { Buff } from "../Core/Buff";
import Cookies from "js-cookie";
import { GameData } from "../Core/GameData";

/**
 * Handles all necessary assets that must be loaded before the game start.
 * May also perform necessary processing steps.
 */
export class GamePreloadScene extends Phaser.Scene
{
    currProgress: number = 0;

    create()
    {
        // Set Language
        let sbox = <HTMLSelectElement>(document.getElementById("Language"));
        let slang = Cookies.get('language') || sbox.options[sbox.selectedIndex].value;
        GameData.mainLanguage = <any>slang;
        sbox.selectedIndex = slang === 'zh-cn' ? 0 : (slang === 'en-us' ? 1 : 2);

        this.load.bitmapFont('smallPx', './assets/fonts/smallPx_C_0.png', './assets/fonts/smallPx_C.fnt');
        this.load.bitmapFont('smallPx_HUD', './assets/fonts/smallPx_HUD_0.png', './assets/fonts/smallPx_HUD.fnt');
        this.load.bitmapFont('mediumPx', './assets/fonts/mediumPx_04b03_0.png', './assets/fonts/mediumPx_04b03.fnt');

        this.load.text('locals', './assets/dataSheets/Locals.csv');
        this.load.text('itemData', 'assets/dataSheets/Items.csv');
        this.load.text('buffData', 'assets/dataSheets/Buffs.csv');

        this.add.existing(new ProgressBar(this, 400, 310, () => [this.currProgress, 1.0], 224, 20, 5, false, 0x444444, 0x000000, 0xfddac5, false));
        this.load.on('progress', (value: number) => { this.currProgress = value; });
        this.load.on('complete', () =>
        {
            // https://medium.com/@kishanvikani/parse-multiple-files-using-papa-parse-and-perform-some-synchronous-task-2db18e531ede
            Promise.all(
                [
                    this.cache.text.get('locals'),
                    this.cache.text.get('buffData'),
                    this.cache.text.get('itemData'),
                ].map(
                    (val) => new Promise(
                        (resolve, reject) => parse(val, {
                            complete: resolve,
                            error: reject,
                        }),
                    )
                ),
            ).then((results) =>
            {
                let localesCSV = <string>(results[0]);
                let buffsCSV = <string>(results[1]);
                let itemsCSV = <string>(results[2]);

                Localization.setData(this.parseLocales(localesCSV));
                ItemManager.setData(this.parseItems(itemsCSV), ItemList);

                // Create the ItemManager
                // ItemManager.setData(this.cache.json.get('itemData'), ItemList);

                Buff.parsedBuffInfo = this.parseBuffs(buffsCSV);

                this.scene.add('TestScene', new TestScene(), true);
                this.scene.add('UIScene', UIScene.getSingleton(), true);
                this.scene.add('DynamicLoaderScene', DynamicLoaderScene.getSingleton(), true);
            }).catch((err) =>
            {
                console.log("Something went wrong: ", err);
            });
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
                    "zh-cn": row[2] === "" ? "BAD_STR" : row[2],
                    "en-us": row[3] === "" ? "BAD_STR" : row[3],
                    "ja-jp": row[4] === "" ? "BAD_STR" : row[4]
                };
            }
            else
            {
                localesMain[row[0]] = {
                    "zh-cn": row[2] === "" ? "BAD_STR" : row[2],
                    "en-us": row[3] === "" ? "BAD_STR" : row[3],
                    "ja-jp": row[4] === "" ? "BAD_STR" : row[4]
                };
            }
        }

        return { "main": localesMain, "popUpBuff": localesPop };
    }

    parseItems(result: any): mRTypes.ItemDataStorage
    {
        let allItemInfo: { [index: string]: mRTypes.ItemData } = {};

        let currentRowIdx = 3; // Start from 4th row
        for (; currentRowIdx < result.data.length; currentRowIdx++)
        {
            let row = result.data[currentRowIdx];
            if (row[0] === "") { continue; } // This row is empty

            // A: Unique ID
            let uid: string = row[0];
            let item: mRTypes.ItemData =
            {
                'showName': 'itemname_' + uid, // B, C, D
                'color': row[4], // E
                'tint': row[5] === 'true', // F
                'level': Number.parseInt(row[6]), // G
                'rarity': Number.parseInt(row[7]), // H
                'stackable': row[8] === 'true', // I
                'eClass': row[9], // J
                'pClass': row[10], // K
                'sClass': row[11], // L
                'image': row[18], // S
                'iconIdx': Number.parseInt(row[19]), // T
                'toolTipText': 'itemtt_' + uid, // U, V, W
            };

            Localization.data.main[item.showName] = {
                "zh-cn": row[1] === "" ? "BAD_STR" : row[1],
                "en-us": row[2] === "" ? "BAD_STR" : row[2],
                "ja-jp": row[3] === "" ? "BAD_STR" : row[3],
            };

            Localization.data.main[item.toolTipText] = {
                "zh-cn": row[20] === "" ? "BAD_STR" : row[20],
                "en-us": row[21] === "" ? "BAD_STR" : row[21],
                "ja-jp": row[22] === "" ? "BAD_STR" : row[22],
            };

            // Has attackName
            if (row[12] !== "")
            {
                item.atkName = 'aN_' + uid;
                // M, N, O
                Localization.data.main[item.atkName] = {
                    "zh-cn": row[12] === "" ? "BAD_STR" : (row[12]),
                    "en-us": row[13] === "" ? "BAD_STR" : (row[13]),
                    "ja-jp": row[14] === "" ? "BAD_STR" : (row[14]),
                };
            }

            // Has specialAttackName
            if (row[15] !== "")
            {
                item.spName = 'sN_' + uid;
                // P, Q, R
                Localization.data.main[item.spName] = {
                    "zh-cn": row[15] === "" ? "BAD_STR" : (row[15]),
                    "en-us": row[16] === "" ? "BAD_STR" : (row[16]),
                    "ja-jp": row[17] === "" ? "BAD_STR" : (row[17]),
                };
            }

            allItemInfo[uid] = item;
        }

        return allItemInfo;
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
            buff.name = 'buffname_' + uid;

            // B, C, D: names
            let name = {
                "zh-cn": row[1] === "" ? "BAD_STR" : row[1],
                "en-us": row[2] === "" ? "BAD_STR" : row[2],
                "ja-jp": row[3] === "" ? "BAD_STR" : row[3],
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
                "zh-cn": row[11] === "" ? "BAD_STR" : row[11],
                "en-us": row[12] === "" ? "BAD_STR" : row[12],
                "ja-jp": row[13] === "" ? "BAD_STR" : row[13],
            }
            Localization.data.popUpBuff[buff.popupName] = pName;

            // O, P: UIImportant, UIPriority
            buff.UIimportant = row[14] === "true";
            buff.UIpriority = Number.parseFloat(row[15]);

            // Q, R, S: ToolTip
            buff.toolTip = 'tt_' + uid;
            let ttText = {
                "zh-cn": row[16] === "" ? "BAD_STR" : row[16],
                "en-us": row[17] === "" ? "BAD_STR" : row[17],
                "ja-jp": row[18] === "" ? "BAD_STR" : row[18],
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
