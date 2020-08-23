import { MobAgent } from "../Agents/MobAgent";

export type agentConstructor = (typeof MobAgent);
export type objectConstructor = (scene: Phaser.Scene, obj: Phaser.Types.Tilemaps.TiledObject, properties: any) => any;

export class ObjectPopulator
{
    static objList: { [index: string]: objectConstructor };
    static agentList: { [index: string]: agentConstructor };

    static setData(objList: { [index: string]: objectConstructor }, agentList: { [index: string]: agentConstructor })
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