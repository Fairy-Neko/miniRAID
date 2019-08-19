/** @module Agent */

import {MobAgent} from "./Modules";
import {Mob} from "../Mob";
import { GameData } from "../core/GameData";

export class PlayerAgentBase extends MobAgent
{
    targetPos: Phaser.Math.Vector2;
    targetMob: Mob;

    constructor(parentMob:Mob)
    {
        super(parentMob);
    }

    setTargetPos(player:Mob, position:Phaser.Math.Vector2, dt:number) {}
    setTargetMob(player:Mob, target:Mob, dt:number) {}
}

export class Simple extends PlayerAgentBase
{
    autoMove: boolean;

    idleFrameMob: number;
    idleFramePos: number;
    idleCount: number;
    speedFriction: number;

    footPos: Phaser.Math.Vector2;
    isMoving: boolean;

    constructor(parentMob:Mob)
    {
        super(parentMob);

        // Will the player move automatically (to nearest mob) if it is free ?
        this.autoMove = GameData.useAutomove;
        // this.autoMove = true;

        // idleCount will count down from idleFrame if player is in idle (-1 / frame) to smooth the animation.
        // Only if idleCount = 0, the player will be "idle".
        // idleFrame is seperated for targeting Mob (which may move = need more smooth)
        // and targeting a static position (don't move and need high precision)
        // WTF? I cannot understood what have I wrote ...
        this.idleFrameMob = 10;
        this.idleFramePos = 0;
        this.idleCount = 0;
        this.speedFriction = 0.9;

        // TODO: smooth when hit world object ?
    }

    updateMob(player:Mob, dt:number)
    {
        this.autoMove = GameData.useAutomove;
        this.footPos = new Phaser.Math.Vector2(player.sprite.x, player.sprite.y);

        if(Mob.checkAlive(player) === true)
        {
            if(typeof this.targetPos !== "undefined")
            {
                if(this.targetPos.distance(this.footPos) > 1.5)
                {
                    let velocity = this.targetPos.clone().subtract(this.footPos).normalize().scale(player.data.getMovingSpeed() * dt);
                    player.sprite.setVelocity(velocity.x, velocity.y);
        
                    this.isMoving = true;

                    // Reset the anim counter
                    this.idleCount = this.idleFramePos;
                }
                else
                {
                    this.targetPos = undefined;

                    this.isMoving = false;
                }
            }
            else if(Mob.checkAlive(this.targetMob) == true)
            {
                // we need move to goin the range of our current weapon
                if(player.data.currentWeapon.isInRange(player, this.targetMob) == false)
                {
                    let targetPos = new Phaser.Math.Vector2(this.targetMob.sprite.x, this.targetMob.sprite.y);
                    let velocity = targetPos.subtract(this.footPos).normalize().scale(player.data.getMovingSpeed() * dt);
                    player.sprite.setVelocity(velocity.x, velocity.y);

                    this.isMoving = true;

                    // Reset the anim counter
                    this.idleCount = this.idleFrameMob;
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

            if(this.isMoving === true)
            {
                // Fix our face direction when moving
                if(player.sprite.body.velocity.x > 0)
                {
                    player.sprite.flipX = true;
                }
                else
                {
                    player.sprite.flipX = false;
                }

                if(!(player.sprite.anims.currentAnim && player.sprite.anims.currentAnim.key == player.moveAnim))
                {
                    player.sprite.play(player.moveAnim);
                }
            }
            else
            {
                // Count the frames
                if(this.idleCount > 0)
                {
                    this.idleCount --;

                    // Also smooth the speed
                    player.sprite.setVelocity(player.sprite.body.velocity.x * this.speedFriction, player.sprite.body.velocity.y * this.speedFriction);
                }
                else
                {
                    player.sprite.setVelocity(0, 0);

                    if(!(player.sprite.anims.currentAnim && player.sprite.anims.currentAnim.key == player.idleAnim))
                    {
                        player.sprite.play(player.idleAnim);
                    }
                }

                if(this.autoMove === true)
                {
                    if(player.data.currentWeapon)
                    {
                        let targetList = player.data.currentWeapon.grabTargets(player);
                        if(targetList.length > 0)
                        {
                            this.setTargetMob(player, targetList[0], dt);
                        }
                    }
                }
            }

            // Attack !
            // Todo: attack single time for multi targets, they should add same amount of weapon gauge (basically)
            if(player.doAttack(dt) === true)
            {
                let targets = player.data.currentWeapon.grabTargets(player);
                if(targets.length > 0)
                {
                    for(var target of targets.values())
                    {
                        if(player.data.currentWeapon.isInRange(player, target))
                        {
                            if(player.data.currentMana > player.data.currentWeapon.manaCost)
                            {
                                player.data.currentMana -= player.data.currentWeapon.manaCost;
                                player.data.currentWeapon.attack(player, target);
                            }
                        }
                    }
                }
            }

            // Use any spells available
            for(let spell in player.data.spells)
            {
                if(player.data.spells.hasOwnProperty(spell))
                {
                    if(this.isMoving == false)
                    {
                        if(player.data.spells[spell].available)
                        {
                            player.data.cast(player, null, player.data.spells[spell])
                        }
                    }
                }
            }
        }
        // YOU DIED !
        else
        {
            this.isMoving = false;
            player.sprite.setVelocity(0, 0)
            player.sprite.flipX = false;

            player.sprite.play(player.deadAnim);
        }
    }

    setTargetPos(player:Mob, position:Phaser.Math.Vector2)
    {
        console.log(position);
        this.targetPos = position;
    }

    setTargetMob(player:Mob, mob:Mob, dt:number)
    {
        this.targetMob = mob;
    }
}