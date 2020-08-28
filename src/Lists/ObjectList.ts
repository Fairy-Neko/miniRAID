/** @packageDocumentation @module Lists */

import { Mob } from "../Engine/GameObjects/Mob";
import * as Mobs from "../Mobs"
import { mRTypes } from "../Engine/Core/mRTypes";

export const ObjectList: { [index: string]: mRTypes.TiledObjConstructor } =
{
    'Mob': Mob.fromTiled(Mob),
    'TestMob': Mob.fromTiled(Mobs.Enemies.TestMob),
}
