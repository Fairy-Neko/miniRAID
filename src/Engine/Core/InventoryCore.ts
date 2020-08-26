/** @packageDocumentation @module Core */

import { Mob } from "../GameObjects/Mob";
import { MobData } from "./MobData";
import { mRTypes } from "./mRTypes";

export class Inventory
{
    constructor()
    {

    }
}

export class ItemManager
{
    static datastorage: mRTypes.ItemDataStorage;
    static itemList: any;

    private static instance: ItemManager;
    static getCurrent(): ItemManager
    {
        if (!ItemManager.instance)
        {
            return new ItemManager();
        }
        return ItemManager.instance;
    }

    static setData(itemData: any, itemList: any)
    {
        this.itemList = itemList;
        // ItemManager.datastorage = JSON.parse(JSON.stringify(itemData)); // Deep copy
        ItemManager.datastorage = itemData;
        for (let key in ItemManager.datastorage)
        {
            ((<any>(ItemManager.datastorage))[key]).color = Phaser.Display.Color.HexStringToColor(((<any>(ItemManager.datastorage))[key]).color);
        }
    }

    private constructor() { }

    static getData(itemID: string): mRTypes.ItemData
    {
        return ItemManager.datastorage[itemID];
    }

    static newItem<T>(itemID: string): T
    {
        return <T>(new this.itemList[itemID](itemID));
    }
}

export interface Item
{
    stackable: boolean;
    stacks: number;
    user: MobData;
    itemID: string;

    showToolTip: () => mRTypes.HTMLToolTip;
}
