/** @packageDocumentation @module Core */

import { MobAgent } from "../Agents/MobAgent";
import { mRTypes } from "./mRTypes";

export class ObjectPopulator
{
    static objList: { [index: string]: mRTypes.TiledObjConstructor };
    static agentList: { [index: string]: mRTypes.AgentConstructor };

    static setData(objList: { [index: string]: mRTypes.TiledObjConstructor }, agentList: { [index: string]: mRTypes.AgentConstructor })
    {
        ObjectPopulator.objList = objList;
        ObjectPopulator.agentList = agentList;
    }

    private constructor() { }

    static newObject<T>(scene: Phaser.Scene, objID: string, obj: Phaser.Types.Tilemaps.TiledObject): T
    {
        let f = this.objList[objID];
        if (f)
        {
            let prop: any = {};
            for (let key of obj.properties)
            {
                prop[key.name] = key.value;
            }
            return <T>f(scene, obj, prop);
        }
        return undefined;
    }
}