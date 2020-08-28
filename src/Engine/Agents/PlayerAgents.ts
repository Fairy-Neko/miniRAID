/** @packageDocumentation @moduleeDocumentation @module Agent */

import { MobAgent, MoveableAgent } from "./MobAgent";
import { Mob } from "../GameObjects/Mob";
import { GameData } from "../Core/GameData";
import { UnitManager } from "../Core/UnitManager";
import { PopUpManager } from "../UI/PopUpManager";

export class PlayerAgentBase extends MoveableAgent
{
    targetPos: Phaser.Math.Vector2;
    targetMob: Mob;

    setTargetPos(player: Mob, position: Phaser.Math.Vector2, dt: number) { }
    setTargetMob(player: Mob, target: Mob, dt: number) { }
}

export class Simple extends PlayerAgentBase
{
    autoMove: boolean;

    footPos: Phaser.Math.Vector2;
    isMoving: boolean;
    unitMgr: UnitManager;

    OOMwarned: boolean = false;

    constructor()
    {
        super();

        // Will the player move automatically (to nearest mob) if it is free ?
        this.autoMove = GameData.useAutomove;
        // this.autoMove = true;

        // idleCount will count down from idleFrame if player is in idle (-1 / frame) to smooth the animation.
        // Only if idleCount = 0, the player will be "idle".
        // idleFrame is seperated for targeting Mob (which may move = need more smooth)
        // and targeting a static position (don't move and need high precision)
        // WTF? I cannot understood what have I wrote ...
        this.idleFrames = 0;
        this.idleCount = 0;
        this.speedFriction = 0.9;

        this.unitMgr = UnitManager.getCurrent();

        // TODO: smooth when hit world object ?
    }

    updateMob(player: Mob, dt: number)
    {
        this.autoMove = GameData.useAutomove;
        this.footPos = new Phaser.Math.Vector2(player.x, player.y);

        if (Mob.checkAlive(player) === true)
        {
            // Low Mana warning
            if (player.mobData.currentMana < (player.mobData.currentWeapon.manaCost * player.mobData.modifiers.resourceCost))
            {
                if (!this.OOMwarned)
                {
                    let _p = player.getTopCenter();
                    PopUpManager.getSingleton().addText("*OOM*", _p.x, _p.y, Phaser.Display.Color.HexStringToColor("#45beff"), 1.0, 0)
                }
                this.OOMwarned = true;
            }
            else
            {
                this.OOMwarned = false;
            }

            if (typeof this.targetPos !== "undefined")
            {
                if (this.targetPos.distance(this.footPos) > 1.5)
                {
                    let velocity = this.targetPos.clone().subtract(this.footPos).normalize().scale(player.mobData.getMovingSpeed());
                    player.setVelocity(velocity.x, velocity.y);

                    this.isMoving = true;
                }
                else
                {
                    this.targetPos = undefined;

                    this.isMoving = false;
                }
            }
            else if (Mob.checkAlive(this.targetMob) == true)
            {
                // we need move to goin the range of our current weapon
                if (player.mobData.currentWeapon.isInRange(player, this.targetMob) == false)
                {
                    let targetPos = new Phaser.Math.Vector2(this.targetMob.x, this.targetMob.y);
                    let velocity = targetPos.subtract(this.footPos).normalize().scale(player.mobData.getMovingSpeed());
                    player.setVelocity(velocity.x, velocity.y);

                    this.isMoving = true;
                }
                // and then we don't move anymore.
                else
                {
                    this.targetMob = undefined;
                    this.isMoving = false;
                }
            }
            else
            {
                // We lose the target.
                this.targetPos = undefined;
                this.targetMob = undefined;
                this.isMoving = false;
            }

            if (this.isMoving === false)
            {
                if (this.autoMove === true)
                {
                    if (player.mobData.currentWeapon)
                    {
                        let targetList = player.mobData.currentWeapon.grabTargets(player);
                        if (targetList.length > 0)
                        {
                            this.setTargetMob(player, targetList[0], dt);
                        }
                    }
                }
            }

            // Attack !
            // Todo: attack single time for multi targets, they should add same amount of weapon gauge (basically)
            if (player.doAttack(dt) === true)
            {
                // console.log("canAttack");
                let targets = player.mobData.currentWeapon.grabTargets(player); // This will ensure that targets are within the range
                if (targets.length > 0)
                {
                    // for(var target of targets.values())
                    // {
                    // if(player.mobData.currentWeapon.isInRange(player, targets))
                    // {
                    if (player.mobData.hasMana(player.mobData.currentWeapon.manaCost))
                    {
                        let result = player.mobData.currentWeapon.attack(player, targets);
                        if (result)
                        {
                            player.mobData.useMana(player.mobData.currentWeapon.manaCost);
                        }
                    }
                    // }
                    // }
                }
            }

            // Use any spells available
            for (let spell in player.mobData.spells)
            {
                if (player.mobData.spells.hasOwnProperty(spell))
                {
                    if (this.isMoving == false)
                    {
                        if (player.mobData.spells[spell].available)
                        {
                            player.mobData.cast(player, this.targetMob, player.mobData.spells[spell])
                        }
                    }
                }
            }
        }
        // YOU DIED !
        else
        {
            this.isMoving = false;
            player.setVelocity(0, 0);
        }

        super.updateMob(player, dt);
    }

    setTargetPos(player: Mob, position: Phaser.Math.Vector2)
    {
        // console.log(position);
        this.targetPos = position;
    }

    setTargetMob(player: Mob, mob: Mob, dt: number)
    {
        this.targetMob = mob;
    }
}
