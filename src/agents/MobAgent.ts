/** 
 * Agents are used to control the action of mobs (players, enemies). They are also MobListeners so that they could handle events like dealDamage etc.
 * They are the "brain" of a mob, and a mob will not make any action without an agent.
 * 
 * @module Agent
 * @preferred
 */

import { MobListener } from "../core/DataBackend";
import Mob from "../Mob";

export default class MobAgent extends MobListener
{
    constructor()
    {
        super();
    }

    updateMob(mob:Mob, dt:number) {}
}
