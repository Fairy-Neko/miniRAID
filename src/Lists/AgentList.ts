/** @packageDocumentation @module Lists */

import * as Agents from "../Agents";
import { mRTypes } from "../Engine/Core/mRTypes";

export const AgentList: { [index: string]: mRTypes.AgentConstructor } =
{
    'default': undefined,
    'keepMoving': Agents.KeepMoving,
}