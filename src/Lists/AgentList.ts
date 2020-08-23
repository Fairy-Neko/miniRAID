/** @packageDocumentation @module Lists */

import { KeepMoving } from "../Agents/SimpleAgents";
import { agentConstructor } from "../Engine/Core/ObjectPopulator";

export const AgentList: { [index: string]: agentConstructor } =
{
    'default': undefined,
    'keepMoving': KeepMoving,
}