/** @module Core */

import * as EventSystem from '../Events/EventSystem'
import {Mob} from '../Mob';
import { Inventory } from './InventoryCore';

export class DataBackend
{
    private constructor() {}
    private static instance: DataBackend;
    static getSingleton(): DataBackend
    {
        if(!DataBackend.instance)
        {
            DataBackend.instance = new DataBackend();
            console.log("registering data backend...");
        }
        return DataBackend.instance;
    }

    eventSystem:EventSystem.EventSystem = new EventSystem.EventSystem();

    // Save all available players (characters).
    // Character mobs (sprites) will be spawned by PlayerSpawnPoint,
    // playerList[0:playerCount-1] will be spawned. (e.g. 4 player map = the first 4 players in list)    
    playerList: Mob[] = [];

    // Array saving Inventory(bag) data.
    inventory: Inventory = new Inventory();

    // Used to generate ID for mobs.
    mobCount: number = -1;

    addPlayer(player:Mob)
    {
        if(this.playerList.length < 8)
        {
            this.playerList.push(player);
        }
    }

    removePlayer(idx:number)
    {
        this.playerList.splice(idx, 1);
    }

    adjuestPlayer(idx:number, offset:number):boolean
    {
        if(idx + offset >= this.playerList.length || idx + offset < 0)
        {
            return false;
        }

        var tmp = this.playerList[idx + offset];
        this.playerList[idx + offset] = this.playerList[idx];
        this.playerList[idx] = tmp;

        return true;
    }

    getID():number
    {
        this.mobCount++;
        return this.mobCount;
    }
}
