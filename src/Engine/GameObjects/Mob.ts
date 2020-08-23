/** @packageDocumentation @module GameEntity */

import { dSprite } from '../DynamicLoader/dSprite'
// import {MobData, Buff, EquipmentType, EquipmentTag, UnitManager, mRTypes} from './core/ModuleProxy'
import { dPhysSprite } from '../DynamicLoader/dPhysSprite';
// import { Game, Scene } from 'phaser';
import { MobAgent } from '../Agents/MobAgent';
import { MobData } from '../Core/MobData';
import { mRTypes, Consts } from '../Core/mRTypes';
import { UnitManager } from '../Core/UnitManager';
import { EquipmentType, EquipmentTag } from '../Core/EquipmentCore';
import { Buff } from '../Core/Buff';
import { PopUpManager } from '../UI/PopUpManager';
import { DynamicLoaderScene } from '../DynamicLoader/DynamicLoaderScene';
import { ObjectPopulator } from '../Core/ObjectPopulator';

export class Mob extends dPhysSprite
{
    moveAnim: string;
    idleAnim: string;
    deadAnim: string;

    mobData: MobData;
    isPlayer: boolean;
    agent: MobAgent;
    attackCounter: number;

    constructor(
        scene: Phaser.Scene,
        x: number, y: number,
        sprite: string,
        settings: mRTypes.Settings.Mob,
        subsprite?: string,
        frame?: string | number)
    {
        super(scene, x, y, sprite, subsprite, frame);

        this.setOrigin(0.5, 0.8);

        this.mobData = settings.backendData;

        this.moveAnim = settings.moveAnim;
        this.idleAnim = settings.idleAnim;
        this.deadAnim = settings.deadAnim;

        if (this.idleAnim)
        {
            this.play(this.idleAnim);
        }

        this.isPlayer = this.mobData.isPlayer;
        if (this.isPlayer === true)
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

        if (settings.agent)
        {
            this.agent = new settings.agent(this);
            this.mobData.addListener(this.agent);
        }

        this.attackCounter = 0;

        // HPBar
    }

    static fromTiled(scene: Phaser.Scene, obj: Phaser.Types.Tilemaps.TiledObject, prop: any): Mob
    {
        let settings_backend = <mRTypes.Settings.MobData>(prop);
        settings_backend.name = settings_backend.name || obj.name || 'Unnamed_mob';

        let charsheet_key = 'sheet_' + prop['image'] || 'sheet_default_mob';
        let settings: mRTypes.Settings.Mob = {
            'moveAnim': charsheet_key + '_move',
            'idleAnim': charsheet_key + '_idle',
            'deadAnim': charsheet_key + '_dead',
            'backendData': new MobData(settings_backend),
            'agent': ObjectPopulator.agentList[prop['agentType'] || prop['agent'] || 'default'],
        };

        return new Mob(scene, obj.x, obj.y, charsheet_key, <mRTypes.Settings.Mob>settings);
    }

    update(dt: number)
    {
        // this.sprite.x += dt / 1000.0 * 10;
        if (this.body.velocity.length() > 0)
        {
            this.mobData.isMoving = true;
        }
        else
        {
            this.mobData.isMoving = false;
        }

        this.mobData.updateMobBackend(this, dt);

        // Physics update?

        if (this.agent)
        {
            this.agent.updateMob(this, dt);
        }
    }

    doAttack(dt: number): boolean
    {
        if (typeof this.mobData.currentWeapon === "undefined")
        {
            return false;
        }

        if (this.mobData.canCastSpell() == false)
        {
            return false;
        }

        return this.mobData.currentWeapon.isReady;
    }

    getEquipableTags(equipmentType: EquipmentType): EquipmentTag[]
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
        source: Mob = undefined,
        buff: Buff = undefined,
        popUp: boolean = true): boolean
    {
        if (Mob.checkAlive(this) == false)
        {
            return false;
        }

        if (buff != undefined)
        {
            // Set source if not
            if (typeof buff.source === "undefined")
            {
                buff.source = source.mobData;
            }

            // Call backend to add the buff.
            // Actually, for the backend, a buff is same as a plain listener (this.data.addListener(listener)).
            this.mobData.addBuff(buff);

            // Initial popUp
            if (popUp == true)
            {
                throw new Error("Please implement popup");
                // buff.popUp(this);
            }
        }

        return true;
    }

    fillDHF(_damageInfo: mRTypes.DamageHeal_FrontEnd): mRTypes.DamageHeal_FrontEnd
    {
        if (_damageInfo.isAvoid == undefined)
        {
            _damageInfo.isAvoid = false;
        }

        if (_damageInfo.isCrit == undefined)
        {
            _damageInfo.isCrit = false;
        }

        if (_damageInfo.isBlock == undefined)
        {
            _damageInfo.isBlock = false;
        }

        if (_damageInfo.popUp == undefined)
        {
            _damageInfo.popUp = true;
        }

        return _damageInfo;
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
    receiveDamage(_damageInfo: mRTypes.DamageHeal_FrontEnd): mRTypes.DamageHeal
    {
        // Fill optional slots with their default values.
        _damageInfo = this.fillDHF(_damageInfo);

        let damageInfo: mRTypes.DamageHeal = {
            'source': _damageInfo.source.mobData,
            'target': this.mobData,
            'spell': _damageInfo.spell,
            'value': _damageInfo.value,
            'isCrit': _damageInfo.isCrit,
            'isAvoid': _damageInfo.isAvoid,
            'isBlock': _damageInfo.isBlock,
            'type': _damageInfo.type,
            // 'type'   : _damageInfo.type,
            'overdeal': 0,

            'detailedSource': new Map([[_damageInfo.source.mobData, _damageInfo.value]]),
        };

        if (Mob.checkAlive(this) == false)
        {
            damageInfo.isAvoid = true;
            damageInfo.value = 0;
            return damageInfo;
        }

        // The actual damage calculate and event trigger moved into backend
        // If mob dead finally, this.data.alive will become false
        let result = this.mobData.receiveDamage(damageInfo);

        // It does not hit !
        if (result.isAvoid)
        {
            if (_damageInfo.popUp == true)
            {
                var popUpPos = this.getTopCenter();
                PopUpManager.getSingleton().addText('MISS', popUpPos.x, popUpPos.y, Consts.ElementColors['miss']);
            }

            return result;
        }

        // Mob itself only do rendering popUp texts
        if (_damageInfo.popUp == true && result.value > 0)
        {
            var popUpPos = this.getTopCenter();
            PopUpManager.getSingleton().addText(result.value.toString() + (result.isCrit ? "!" : ""), popUpPos.x, popUpPos.y, Consts.ElementColors[result.type]);

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

        // However, it should also check if self dead here
        // since it should remove the renderable (actual object) from the scene and mob list
        // Check if I am alive
        if (this.mobData.alive == false)
        {
            this.die(_damageInfo.source, result);
        }

        return result;
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
    receiveHeal(_healInfo: mRTypes.DamageHeal_FrontEnd): mRTypes.DamageHeal
    {
        // Fill optional slots with their default values.
        _healInfo = this.fillDHF(_healInfo);

        // Same as above
        let healInfo: mRTypes.DamageHeal = {
            'source': _healInfo.source.mobData,
            'target': this.mobData,
            'spell': _healInfo.spell,
            'value': _healInfo.value,
            'isCrit': _healInfo.isCrit,
            'isAvoid': _healInfo.isAvoid,
            'isBlock': _healInfo.isBlock,
            'type': 'heal',
            'overdeal': 0
        };

        if (Mob.checkAlive(this) == false)
        {
            healInfo.isAvoid = true;
            healInfo.value = 0;
            return healInfo;
        }

        let result = this.mobData.receiveHeal(healInfo);

        // Show popUp text with overhealing hint
        if (_healInfo.popUp == true && (result.value + result.overdeal) > 0)
        {
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

            var popUpPos = this.getTopCenter();
            if (result.overdeal > 0)
            {
                PopUpManager.getSingleton().addText(result.value.toString() + (result.isCrit ? "!" : "") + " <" + result.overdeal.toString() + ">", popUpPos.x, popUpPos.y, Consts.ElementColors['heal'], 1.0, 64, -256);
            }
            else
            {
                PopUpManager.getSingleton().addText(result.value.toString() + (result.isCrit ? "!" : ""), popUpPos.x, popUpPos.y, Consts.ElementColors['heal'], 1.0, 64, -256);
            }

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

        return result;
    }

    die(source?: Mob, damage?: mRTypes.DamageHeal)
    {
        this.mobData.die(damage);

        // this.body.collisionType = me.collision.types.NO_OBJECT;

        if (this.mobData.isPlayer === true)
        {
            // Don't remove it, keep it dead
            // game.units.removePlayer(this);
        }
        else
        {
            // throw new Error("Remove the mob here");
            console.log(this.mobData.name + " has DEAD!")
            // me.game.world.removeChild(this.HPBar);
            // game.units.removeEnemy(this);
            // me.game.world.removeChild(this);
            this.destroy();
        }
    }

    footPos(): Phaser.Math.Vector2
    {
        return new Phaser.Math.Vector2(this.x, this.y);
    }

    static checkExist(mob?: Mob): boolean
    {
        return (mob != null);
    }

    static checkAlive(mob?: Mob): boolean
    {
        return (Mob.checkExist(mob) && (mob.mobData.alive === true));
    }
}