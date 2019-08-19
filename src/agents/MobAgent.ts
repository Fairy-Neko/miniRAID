/** 
 * Agents are used to control the action of mobs (players, enemies). They are also MobListeners so that they could handle events like dealDamage etc.
 * They are the "brain" of a mob, and a mob will not make any action without an agent.
 * 
 * @module Agent
 * @preferred
 */

// import { MobListener } from "../core/DataBackend";
import { Mob } from "../Mob";
import { MobListener } from "../core/MobListener";

export class MobAgent extends MobListener
{
    constructor(parentMob:Mob)
    {
        super();
    }

    updateMob(mob:Mob, dt:number) {}
}
