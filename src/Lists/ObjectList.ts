import { objectConstructor } from "../Engine/Core/ObjectPopulator";
import { Mob } from "../Engine/GameObjects/Mob";

export const ObjectList: { [index: string]: objectConstructor } =
{
    'mob': Mob.fromTiled,
}