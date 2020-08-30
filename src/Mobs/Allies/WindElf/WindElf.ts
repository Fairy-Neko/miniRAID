/** @packageDocumentation @module Mobs.Allies.WindElf */

import { Mob } from "../../../Engine/GameObjects/Mob";
import { MobListener } from "../../../Engine/Core/MobListener";

export class WindElf extends Mob
{
    // TODO: Specific unit frame
}

export class WindElfChar extends MobListener
{
    windPower: number = 0;
    windPowerMax: number = 5;
}