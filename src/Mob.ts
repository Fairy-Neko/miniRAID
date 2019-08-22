/** @module GameEntity */

import {dSprite} from './DynamicLoader/dSprite'
// import {MobData, Buff, EquipmentType, EquipmentTag, UnitManager, mRTypes} from './core/ModuleProxy'
import {dPhysSprite} from './DynamicLoader/dPhysSprite';
import { Game, Scene } from 'Phaser';
import { MobAgent } from './agents/MobAgent';
import { MobData } from './core/MobData';
import { mRTypes } from './core/mRTypes';
import { UnitManager } from './core/UnitManager';
import { EquipmentType, EquipmentTag } from './core/EquipmentCore';
import { Buff } from './core/Buff';

export class Mob extends dPhysSprite
{
    moveAnim:string;
    idleAnim:string;
    deadAnim:string;

    mobData:MobData;
    isPlayer: boolean;
    agent: MobAgent;
    attackCounter: number;

    constructor(
        scene:Scene,
        x:number, y:number, 
        sprite:string,
        settings:mRTypes.Settings.Mob,
        subsprite?:string, 
        frame?:string | number)
    {
        super(scene, x, y, sprite, subsprite, frame);

        this.setOrigin(0.5, 0.8);

        this.moveAnim = settings.moveAnim;
        this.idleAnim = settings.idleAnim;
        this.deadAnim = settings.deadAnim;

        if(this.idleAnim)
        {
            this.play(this.idleAnim);
        }

        this.isPlayer = settings.isPlayer;
        if(this.isPlayer === true)
        {
            // Is player
            UnitManager.getCurrent().addPlayer(this);
        }
        else
        {
            // Is enemy
            UnitManager.getCurrent().addEnemy(this);
        }
        
        this.setGravity(0, 0);

        this.mobData = settings.backendData;

        if(settings.agent)
        {
            this.agent = new settings.agent(this);
        }

        this.mobData.addListener(this.agent);
        this.attackCounter = 0;

        // HPBar
    }

    update(dt:number)
    {
        // this.sprite.x += dt / 1000.0 * 10;
        if(this.body.velocity.length() > 0)
        {
            this.mobData.isMoving = true;
        }
        else
        {
            this.mobData.isMoving = false;
        }

        this.mobData.updateMobBackend(this, dt);
        
        // Physics update?

        this.agent.updateMob(this, dt);
    }

    doAttack(dt:number):boolean
    {
        if(typeof this.mobData.currentWeapon === "undefined")
        {
            return false;
        }

        this.attackCounter += dt * 0.001;

        if(this.mobData.canCastSpell() == false)
        {
            return false;
        }

        if(this.attackCounter > (this.mobData.getAttackSpeed()))
        {
            // This will cause mutiple attacks if attackspeed increases.
            // this.attackCounter -= this.data.getAttackSpeed();
            
            this.attackCounter = 0;
            return true;
        }

        return false;
    }

    getEquipableTags(equipmentType:EquipmentType):EquipmentTag[]
    {
        return [EquipmentTag.Equipment];
    }
    
    // Will be called when a buff is going to affect the mob.
    // If anything some object with buff ability (e.g. fireball can fire sth up) hits has method receiveBuff(),
    // receiveBuff() will be called and the mob will be buffed.
    // receiveBuff() should be the final step of being buffed, and if the mob resists some buff this should not be called.
    // e.g. in some inherited classes use:
    //                                       if(...){ nothing happens; } else { super.receiveBuff() }.

    // N.B. recieveBuff should also work like recieveDamage(), that triggers listener events and decide
    // if we should keep the buff or ignore it.
    // But I have not write it.

    // TODO: add onReceiveBuff & onFocusReceiveBuff for game.MobListeners.
    // ...Maybe we should let them auto trigger onFocusXXX for any events ?
    receiveBuff(
        source:Mob = undefined, 
        buff:Buff = undefined,
        popUp:boolean = true):boolean
    {
        if(Mob.checkAlive(this) == false)
        {
            return false;
        }

        if(buff != undefined)
        {
            // Set source if not
            if(typeof buff.source === "undefined")
            {
                buff.source = source.mobData;
            }

            // Call backend to add the buff.
            // Actually, for the backend, a buff is same as a plain listener (this.data.addListener(listener)).
            this.mobData.addBuff(buff);

            // Initial popUp
            if(popUp == true)
            {
                throw new Error("Please implement popup");
                // buff.popUp(this);
            }
        }

        return true;
    }

    // Same as receiveBuff(),
    // this method will be used to receive damage from any object.
    // this method will also trigger events for listeners, and let them modify the damage.
    // e.g. mob equiped fire resist necklace -> it's event will be triggered ...
    // (actually for fire resist necklace, change parameters in onStatsChange() is convinent, though. lol.)
    
    // This method will also popup a text with the final amount of damage, 
    // with corresponding color defined in gama.data.damageColor.
    // this action could be disabled by setting popUp = false.

    /**
     * Params of damageInfo (default value)
     * source:          damage source
     * damage ({}):     actual damage. e.g. {fire: 165, ice: 100, thunder: 600}
     * isCrit (false):  is this damage crits ? It will be calculated automatically if it is false.
     * isAvoid (false): Same as above.
     * spell:           the spell used at this attack
     * popUp (true):    Should this damage popup a text ?
     */
    receiveDamage(_damageInfo:mRTypes.DamageHeal_FrontEnd):boolean
    {
        if(Mob.checkAlive(this) == false)
        {
            return false;
        }

        let damageInfo:mRTypes.DamageHeal = {
            'source' : _damageInfo.source.mobData,
            'target' : this.mobData,
            'spell'  : _damageInfo.spell,
            'value'  : _damageInfo.value,
            'isCrit' : _damageInfo.isCrit,
            'isAvoid': _damageInfo.isAvoid,
            'isBlock': _damageInfo.isBlock,
            'overdeal': mRTypes.LeafTypesZERO
        };

        // The actual damage calculate and event trigger moved into backend
        // If mob dead finally, this.data.alive will become false
        this.mobData.receiveDamage(damageInfo);

        // It does not hit !
        if(damageInfo.isAvoid)
        {            
            throw new Error("Please implement popup");
            
            // if(damageInfo.popUp == true)
            // {
            //     var popUpPos = this.getRenderPos(0.5, 0.0);
            //     game.UI.popupMgr.addText({
            //         text: "MISS",
            //         color: game.data.damageColor.miss,
            //         posX: popUpPos.x,
            //         posY: popUpPos.y,
            //     });
            // }

            return false;
        }

        // Mob itself only do rendering popUp texts
        for(var dmgType in damageInfo.value)
        {
            if(_damageInfo.popUp == true && damageInfo.value[dmgType] > 0)
            {
                throw new Error("Please implement popup");
        
                // var popUpPos = this.getRenderPos(0.5, 0.0);
                // game.UI.popupMgr.addText({
                //     text: damageInfo.damage[dmgType].toString() + (damageInfo.isCrit ? " !" : ""),
                //     color: game.data.damageColor[dmgType],
                //     posX: popUpPos.x,
                //     posY: popUpPos.y,
                // });
                
                // // popUp texts on unit frames
                // // fade from the edge of currentHealth to the left
                // if(this.data.isPlayer)
                // {
                //     for(var i = 0; i < game.units.getPlayerListWithDead().length; i++)
                //     {
                //         if(this === game.units.getPlayerListWithDead()[i])
                //         {
                //             popUpPos = game.UI.unitFrameSlots.slots[i].pos;
                //             game.UI.popupMgr.addText({
                //                 text: "-" + damageInfo.damage[dmgType].toString(),
                //                 time: 0.75,
                //                 color: game.data.damageColor[dmgType],
                //                 posX: popUpPos.x + 126,// * (this.data.currentHealth / this.data.maxHealth), // Maybe this is better ? (or cannot see if sudden death)
                //                 posY: popUpPos.y - 10,
                //                 velX: -256,
                //                 velY: 0.0,
                //                 accX: 384,
                //                 accY: 0.0,
                //             });
                //         }
                //     }
                // }
            }
        }

        // However, it should also check if self dead here
        // since it should remove the renderable (actual object) from the scene and mob list
        // Check if I am alive
        if(this.mobData.alive == false)
        {
            this.die(_damageInfo.source, damageInfo);
        }

        return true;
    }

    // Receive healing, same as recieve damage.

    /**
     * Params of healInfo (default value)
     * source:          heal source
     * heal (0):        actual heal, a number.
     * isCrit (false):  is this heal crits ? It will be calculated automatically if it is false.
     * spell:           the spell used at this attack
     * popUp (true):    Should this heal popup a text ?
     */
    receiveHeal(_healInfo:mRTypes.DamageHeal_FrontEnd)
    {
        if(Mob.checkAlive(this) == false)
        {
            return false;
        }

        // Same as above
        let healInfo:mRTypes.DamageHeal = {
            'source' : _healInfo.source.mobData,
            'target' : this.mobData,
            'spell'  : _healInfo.spell,
            'value'  : _healInfo.value,
            'isCrit' : _healInfo.isCrit,
            'isAvoid': _healInfo.isAvoid,
            'isBlock': _healInfo.isBlock,
            'overdeal': mRTypes.LeafTypesZERO
        };

        this.mobData.receiveHeal(healInfo);

        // Show popUp text with overhealing hint
        if(_healInfo.popUp == true && (healInfo.value.heal + healInfo.overdeal.heal) > 0)
        {
            throw new Error("Please implement popup");

            // var popUpPos = this.getRenderPos(0.5, 0.0);
            // if(healInfo.heal.over > 0)
            // {
            //     game.UI.popupMgr.addText({
            //         text: healInfo.heal.real.toString() + (healInfo.isCrit ? " !" : "") + " <" + healInfo.heal.over.toString() + ">",
            //         color: game.data.damageColor.heal,
            //         velX: 64,
            //         posX: popUpPos.x,
            //         posY: popUpPos.y,
            //     });
            // }
            // else
            // {
            //     game.UI.popupMgr.addText({
            //         text: healInfo.heal.real.toString() + (healInfo.isCrit ? " !" : ""),
            //         color: game.data.damageColor.heal,
            //         velX: 64,
            //         posX: popUpPos.x,
            //         posY: popUpPos.y,
            //     });
            // }
            // // popUp texts on unit frames
            // // fade from left to the the edge of currentHealth
            // if(this.data.isPlayer && healInfo.heal.real > 0){
            //     for(var i = 0; i < game.units.getPlayerListWithDead().length; i++)
            //     {
            //         if(this === game.units.getPlayerListWithDead()[i])
            //         {
            //             popUpPos = game.UI.unitFrameSlots.slots[i].pos;
            //             game.UI.popupMgr.addText({
            //                 text: "+" + healInfo.heal.real.toString(),
            //                 time: 0.75,
            //                 color: game.data.damageColor.heal,
            //                 posX: popUpPos.x + 30,
            //                 posY: popUpPos.y + 10,
            //                 velX: 256,
            //                 velY: 0.0,
            //                 accX: -384,
            //                 accY: 0.0,
            //             });
            //         }
            //     }
            // }
        }
    }

    die(source?:Mob, damage?:mRTypes.DamageHeal)
    {
        this.mobData.die(damage);

        // this.body.collisionType = me.collision.types.NO_OBJECT;

        if(this.mobData.isPlayer === true)
        {
            // Don't remove it, keep it dead
            // game.units.removePlayer(this);
        }
        else
        {
            throw new Error("Remove the mob here");
            // me.game.world.removeChild(this.HPBar);
            // game.units.removeEnemy(this);
            // me.game.world.removeChild(this);
        }
    }

    static checkExist(mob?:Mob):boolean
    {
        return (mob != null);
    }

    static checkAlive(mob?:Mob):boolean
    {
        return (Mob.checkExist(mob) && (mob.mobData.alive === true));
    }
}