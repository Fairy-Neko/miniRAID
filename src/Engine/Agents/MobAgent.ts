/** 
 * Agents are used to control the action of mobs (players, enemies). They are also MobListeners so that they could handle events like dealDamage etc.
 * They are the "brain" of a mob, and a mob will not make any action without an agent.
 * 
 * @packageDocumentation
 * @module Agent
 * @preferred
 */

// import { MobListener } from "../core/DataBackend";
import { Mob } from "../GameObjects/Mob";
import { MobListener, MobListenerType } from "../Core/MobListener";
import { MobData } from "../Core/MobData";
import { UIScene } from "../UI/UIScene";
import { PopupText, PopUpManager } from "../UI/PopUpManager";
import { mRTypes } from "../Core/mRTypes";
import { GameData } from "../Core/GameData";

export class MobAgent extends MobListener
{
    constructor()
    {
        super();
        this.type = MobListenerType.Agent;
    }

    updateMob(mob: Mob, dt: number) { }
}

export class MoveableAgent extends MobAgent
{
    isMoving: boolean = false;
    idleFrames: number = 10;
    idleCount: number = 0;
    speedFriction: number = 0.9;

    updateMob(mob: Mob, dt: number)
    {
        if (this.isMoving === true)
        {
            // Reset the anim counter
            this.idleCount = this.idleFrames;
        }
        else
        {
            if (this.idleCount > 0)
            {
                this.idleCount--;

                // Smooth the speed
                mob.body.velocity.scale(this.speedFriction);
            }
            else
            {
                mob.setVelocity(0, 0);
            }
        }
    }
}

export class TauntBasedAgent extends MoveableAgent
{
    focusList: Set<MobData>;
    tauntList: { [index: number]: { taunt: number } };

    targetMob: Mob;

    footPos: Phaser.Math.Vector2;

    isMoving: boolean = false;
    idleFrames: number = 10;
    idleCount: number = 0;
    speedFriction: number = 0.9;

    constructor()
    {
        super();
        this.focusList = new Set();
        this.tauntList = {};
    }

    onAdded(mob: MobData)
    {
        this.listen(mob, 'death', this.onDeath);
        this.listen(mob, 'receiveDamageFinal', this.onReceiveDamageFinal);
    }

    updateMob(mob: Mob, dt: number)
    {
        // borrowed from playerAgent
        this.footPos = mob.footPos();

        this.updateTaunt(mob);

        // We have already checked if targetMob alive in updateTaunt()
        // as that function checks every one in this.focusList.
        if (this.targetMob)
        {
            // we need move to goin the range of our current weapon
            if (mob.mobData.currentWeapon && mob.mobData.currentWeapon.isInRange(mob, this.targetMob) == false)
            {
                let vel = this.targetMob.footPos().clone().subtract(this.footPos).normalize().scale(mob.mobData.getMovingSpeed());
                mob.setVelocity(vel.x, vel.y);

                this.isMoving = true;
            }
            // and then we don't move anymore.
            else
            {
                this.isMoving = false;
            }
        }
        else
        {
            // We lose the target.
            this.targetMob = undefined;
            this.isMoving = false;
        }

        // Attack !
        if (mob.doAttack(dt) === true)
        {
            if (mob.mobData.currentWeapon && typeof this.targetMob !== "undefined")
            {
                if (mob.mobData.currentWeapon.isInRange(mob, this.targetMob))
                {
                    mob.mobData.currentWeapon.attack(mob, [this.targetMob]);
                }
            }
        }

        super.updateMob(mob, dt);
    }

    updateTaunt(mob: Mob)
    {
        // Find current target with highest taunt
        var maxValue = 0;
        var nextTarget = undefined;

        // Use iteration instead of sort to save a O(logN) time.
        // Don't know if this will slower than obj -> array -> sort() cuz javascript vs native...
        // But we need update the list though
        for (var tmpTargetMobData of this.focusList)
        {
            // Taunt reduces over time
            this.tauntList[tmpTargetMobData.UID].taunt *= 0.999; // TODO: time-consistent

            // Remove the mob if it is dead or it has no taunt
            if (!Mob.checkAlive(tmpTargetMobData.parentMob) || this.tauntList[tmpTargetMobData.UID].taunt <= 1 /*a small enough value*/)
            {
                this.removeTarget(tmpTargetMobData);
            }
            else
            {
                if (this.tauntList[tmpTargetMobData.UID].taunt > maxValue)
                {
                    maxValue = this.tauntList[tmpTargetMobData.UID].taunt;
                    nextTarget = tmpTargetMobData.parentMob;
                }
            }
        }

        if (nextTarget && nextTarget != this.targetMob)
        {
            if (this.targetMob)
            {
                this.targetMob.mobData.beingAttack -= 1;
            }
            this.targetMob = nextTarget;
            nextTarget.mobData.beingAttack += 1;

            // TODO: popUp a "!" and a red line for taunt focus
            var pPos = mob.getTopCenter();
            PopUpManager.getSingleton().addText("!", pPos.x, pPos.y, Phaser.Display.Color.HexStringToColor('#ff0000'), 1.0, 0);
        }
        else if (typeof nextTarget === "undefined")
        {
            // TODO: popUp a "?" as the mob losted its target
            if (typeof this.targetMob !== "undefined")
            {
                var pPos = mob.getTopCenter();
                PopUpManager.getSingleton().addText("?", pPos.x, pPos.y, Phaser.Display.Color.HexStringToColor('#ffff00'), 1.0, 0);
            }

            this.targetMob = undefined;
        }
    }

    addTarget(target: MobData, initialTaunt: number = 0)
    {
        this.focusList.add(target);
        this.tauntList[target.UID] = { taunt: initialTaunt };

        this.listen(target, 'receiveHealFinal', this.onReceiveHealFinal);
    }

    removeTarget(target: MobData)
    {
        this.focusList.delete(target);
        this.unlistenAll(target);
        delete this.tauntList[target.UID];
    }

    // Some skills that will change taunt value directly 
    // (e.g. Taunt(skill), Wind rush(some skill that will reduce some taunt from target), etc.)
    changeTaunt(source: Mob, taunt: number)
    {
        if (!this.focusList.has(source.mobData))
        {
            this.addTarget(source.mobData);
        }

        this.tauntList[source.mobData.UID].taunt += taunt;
    }

    // Test if we can modify the result here !
    // Yes we CAN ! (uncomment this and mob using this agent will deal no damage)
    // onDealDamage({ target, damage, isCrit, spell } = {}) 
    // {
    //     for(var dmg in damage)
    //     {
    //         damage[dmg] = 0;
    //     } 
    //     return true; 
    // },

    onReceiveDamageFinal(info: mRTypes.DamageHeal): boolean
    {
        // Just in case
        if (info.type !== GameData.Elements.heal)
        {
            // Add the damage source in to our focus list,
            if (!this.focusList.has(info.source))
            {
                this.addTarget(info.source);
            }

            // and create the taunt of that target based on damage
            this.tauntList[info.source.UID].taunt += info.value * info.source.tauntMul;
        }

        // We do not change the values
        return false;
    }

    onReceiveHealFinal(info: mRTypes.DamageHeal): boolean
    {
        // Just in case
        if (info.type === GameData.Elements.heal)
        {
            // Add the heal source in to our focus list,
            if (!this.focusList.has(info.source))
            {
                this.addTarget(info.source);
            }

            // and create the taunt of that target based on total heal
            this.tauntList[info.source.UID].taunt += (info.value + info.overdeal) * info.source.tauntMul * GameData.healTaunt;
        }

        // We do not change the values
        return false;
    }

    onDeath(damageInfo: mRTypes.DamageHeal): boolean
    {
        if (this.targetMob)
        {
            this.targetMob.mobData.beingAttack -= 1;
        }

        return false;
    }
}
