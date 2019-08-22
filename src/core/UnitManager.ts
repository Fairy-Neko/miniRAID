/** @module Core */

import { Mob } from "../Mob";
import { mRTypes } from "./mRTypes";
import { GameData } from "./GameData"
import { PlayerAgentBase, Simple } from "../agents/Modules";

export class UnitManager
{
    name: string;

    player: Set<Mob>;
    enemy: Set<Mob>;
    selectedPlayerCount: number;

    isDown: boolean;
    isDragging: boolean;
    timeCounter: number;

    origin: Phaser.Math.Vector2;
    rectOrigin: Phaser.Math.Vector2;
    rectTarget: Phaser.Math.Vector2;

    rotateKey: Phaser.Input.Keyboard.Key;
    sparseKey: Phaser.Input.Keyboard.Key;
    playerRotation: number;
    
    renderRect: Phaser.GameObjects.Rectangle;
    selectingRect: Phaser.Geom.Rectangle;

    playerGroup: Phaser.Physics.Arcade.Group;
    enemyGroup: Phaser.Physics.Arcade.Group;
    allyGroup: Phaser.Physics.Arcade.Group;
    thirdGroup: Phaser.Physics.Arcade.Group;
    renderContainer: Phaser.GameObjects.Container;

    constructor(scene:Phaser.Scene)
    {
        this.name = "Unit Manager";

        // TODO: change this to QuerySet ?
        this.player = new Set();
        this.enemy = new Set();
        this.selectedPlayerCount = 0;

        this.isDown = false;
        this.isDragging = false;
        this.timeCounter = 0;

        this.origin = new Phaser.Math.Vector2(0, 0);
        this.rectOrigin = new Phaser.Math.Vector2(0, 0);
        this.rectTarget = new Phaser.Math.Vector2(0, 0);
        this.selectingRect = new Phaser.Geom.Rectangle(0, 0, 0, 0);

        scene.input.on('pointerdown', (pt:any) => this.pointerDown(pt));
        scene.input.on('pointerup', (pt:any) => this.pointerUp(pt));
        // scene.input.on('pointerleave', (pt:any) => this.pointerLeave(pt));
        scene.input.on('pointermove', (pt:any) => this.pointerMove(pt));

        this.sparseKey = scene.input.keyboard.addKey('F');
        this.rotateKey = scene.input.keyboard.addKey('R');

        this.playerRotation = 0;

        //Add a rectangle to the scene
        this.renderContainer = scene.add.container(0, 0);
        this.renderRect = new Phaser.GameObjects.Rectangle(scene, 0, 0, 0, 0, 0x90D7EC, 0.2);
        this.renderContainer.add(this.renderRect);
        this.renderContainer.add(new Phaser.GameObjects.Line(scene, 0, 200, 0, 0, 1000, 0, 0xFF0000));
        this.renderContainer.depth = 100000;

        this.playerGroup = scene.physics.add.group();
        this.enemyGroup = scene.physics.add.group();
        this.allyGroup = scene.physics.add.group();
        this.thirdGroup = scene.physics.add.group();
    }

    private static instance: UnitManager;
    static resetScene(scene:Phaser.Scene)
    {
        if(UnitManager.instance)
        {
            delete UnitManager.instance;
        }
        UnitManager.instance = new UnitManager(scene);
    }

    static getCurrent(): UnitManager
    {
        if(!UnitManager.instance)
        {
            return undefined;
        }
        return UnitManager.instance;
    }

    update(dt: number)
    {
        if(this.isDragging == true)
        {
            this.renderRect.setVisible(true);

            this.renderRect.setPosition(this.selectingRect.x, this.selectingRect.y);
            this.renderRect.setSize(this.selectingRect.width, this.selectingRect.height);

            var minX = Math.min(this.rectOrigin.x, this.rectTarget.x);
            var minY = Math.min(this.rectOrigin.y, this.rectTarget.y);
            var maxX = Math.max(this.rectOrigin.x, this.rectTarget.x);
            var maxY = Math.max(this.rectOrigin.y, this.rectTarget.y);

            var playerCount = 0;
            // console.log(this.player);
            for(let player of this.player)
            {
                if(Mob.checkAlive(player))
                {
                    var pt = new Phaser.Math.Vector2(player.x, player.y);
                    // var frame = game.UI.unitFrameSlots.slots[playerCount];

                    // TODO: use box intersection instead of containsPoint
                    if(this.selectingRect.contains(pt.x, pt.y))
                    {
                        player.mobData.inControl = true;
                    }
                    // else if(this.selectingRect.containsPoint(frame.pos.x - minX, frame.pos.y - minY))
                    // {
                    //     player.data.inControl = true;
                    // }
                    else
                    {
                        player.mobData.inControl = false;
                    }
                }
                playerCount++;
            }
        }
        else
        {
            this.renderRect.setVisible(false);
        }
    }

    isMouseLeft(pointer: any)
    {
        if ("which" in pointer.event)  // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
            return pointer.event.which == 1; 
        else if ("button" in pointer.event)  // IE, Opera 
            return pointer.event.button == 0; 
    }

    isMouseMiddle(pointer: any)
    {
        if ("which" in pointer.event)  // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
            return pointer.event.which == 2; 
        else if ("button" in pointer.event)  // IE, Opera 
            return pointer.event.button == 1; 
    }

    isMouseRight(pointer: any)
    {
        if ("which" in pointer.event)  // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
            return pointer.event.which == 3; 
        else if ("button" in pointer.event)  // IE, Opera 
            return pointer.event.button == 2; 
    }

    pointerDown(pointer: any)
    {
        // console.log(pointer);
        pointer.event.preventDefault();

        // Drag a rect
        if(this.isMouseLeft(pointer))
        {
            this.isDown = true;
            this.isDragging = true;

            // console.log("Drag start");

            this.rectOrigin.set(pointer.x, pointer.y);
            this.rectTarget.set(pointer.x, pointer.y);

            this.selectingRect.setPosition(pointer.x, pointer.y);
            this.selectingRect.setSize(0, 0);

            return true;
        }

        // Move player
        if(this.isMouseRight(pointer))
        {
            this.selectedPlayerCount = 0;
            for(var player of this.player)
            {
                if(player.mobData.inControl == true)
                {
                    this.selectedPlayerCount += 1;
                }
            }

            this.origin.set(pointer.x, pointer.y);

            var playerNum = 0;

            var playerSparse = GameData.playerSparse + GameData.playerSparseInc * this.selectedPlayerCount;

            if(this.sparseKey.isDown)
            {
                playerSparse = 60;
            }
            if(this.rotateKey.isDown)
            {
                this.playerRotation += 2;
            }

            if(this.selectedPlayerCount == 1)
            {
                playerSparse = 0;
            }

            for(var player of this.player)
            {
                if(player.mobData.inControl == true)
                {
                    (<Simple>(player.agent)).setTargetPos(
                        player, 
                        this.origin.clone().add(
                            (new Phaser.Math.Vector2(0, 0)).setToPolar(((playerNum + this.playerRotation) / this.selectedPlayerCount * 2 * Math.PI), playerSparse) 
                        )
                    );
                    playerNum++;
                }
            }

            return false;
        }
    }

    pointerMove(pointer: any)
    {
        // this.timeCounter += me.timer.lastUpdate;

        if(this.isDragging)
        {
            this.rectTarget.set(pointer.x, pointer.y);
            // this.selectingRect.setPosition(this.rectOrigin.x, this.rectOrigin.y);
            this.selectingRect.setSize(this.rectTarget.x - this.rectOrigin.x, this.rectTarget.y - this.rectOrigin.y);
        }
    }

    pointerUp(pointer: any)
    {
        this.isDown = false;

        if(this.isMouseLeft(pointer))
        {
            this.isDragging = false;
            // console.log("Drag end");
        }

        return true;
    }

    pointerLeave(pointer: any)
    {
        console.log("leave");

        this.isDown = false;
        this.isDragging = false;

        return true;
    }

    addPlayer(player:Mob)
    {
        console.log("Added player:");
        console.log(player);
        this.player.add(player);
        this.playerGroup.add(player);
    }

    addEnemy(enemy:Mob)
    {
        this.enemy.add(enemy);
        this.enemyGroup.add(enemy);
    }

    removePlayer(player:Mob)
    {
        this.player.delete(player);
    }

    removeEnemy(enemy:Mob)
    {
        this.enemy.delete(enemy);
    }

    _getUnitList(targetSet:Set<Mob>, sortMethod:mRTypes.CompareFunc<Mob>, availableTest:mRTypes.FilterFunc<Mob>, containsDead:boolean = false)
    {
        var result = [];

        for(var unit of targetSet)
        {
            // TODO: how to do with raise skills ?
            if((containsDead || Mob.checkAlive(unit)) && availableTest(unit) === true)
            {
                result.push(unit);
            }
        }

        result.sort(sortMethod);
        return result;
    }

    // Get a list of units, e.g. attack target list etc.
    // You will get a list that:
    // * The list was sorted using sortMethod,
    // * The list will contain units only if they have passed availableTest. (availableTest(unit) returns true)
    getPlayerList(sortMethod:mRTypes.CompareFunc<Mob>, availableTest:mRTypes.FilterFunc<Mob>, containsDead:boolean = false)
    {
        sortMethod = sortMethod || function(a, b) {return 0;};
        availableTest = availableTest || function(a) {return true;};

        return this._getUnitList(this.player, sortMethod, availableTest, containsDead);
    }

    getPlayerListWithDead(sortMethod:mRTypes.CompareFunc<Mob>, availableTest:mRTypes.FilterFunc<Mob>)
    {
        sortMethod = sortMethod || function(a, b) {return 0;};
        availableTest = availableTest || function(a) {return true;};

        return this._getUnitList(this.player, sortMethod, availableTest, true);
    }

    getEnemyList(sortMethod:mRTypes.CompareFunc<Mob>, availableTest:mRTypes.FilterFunc<Mob>)
    {
        sortMethod = sortMethod || function(a, b) {return 0;};
        availableTest = availableTest || function(a) {return true;};

        return this._getUnitList(this.enemy, sortMethod, availableTest);
    }

    getUnitList(sortMethod:mRTypes.CompareFunc<Mob>, availableTest:mRTypes.FilterFunc<Mob>, isPlayer:boolean = false)
    {
        if(isPlayer === true)
        {
            return this._getUnitList(this.player, sortMethod, availableTest);
        }
        else
        {
            return this._getUnitList(this.enemy, sortMethod, availableTest);
        }
    }

    getUnitListAll(sortMethod:mRTypes.CompareFunc<Mob>, availableTest:mRTypes.FilterFunc<Mob>)
    {
        sortMethod = sortMethod || function(a, b) {return 0;};
        availableTest = availableTest || function(a) {return true;};

        return this._getUnitList(this.enemy, sortMethod, availableTest).concat(this._getUnitList(this.player, sortMethod, availableTest)).sort(sortMethod);
    }

    // Shorthand to get k-nearest (as a parameter "count") player around a position using above API.
    getNearest(position:Phaser.Math.Vector2, isPlayer:boolean = false, count:integer = 1)
    {
        var result = this.getUnitList(
            UnitManager.sortNearest(position),
            UnitManager.NOOP,
            isPlayer,
        );
        return result.slice(0, Math.min(count, result.length));
    }

    getNearestUnitAll(position:Phaser.Math.Vector2, count = 1)
    {
        var result = this.getUnitListAll(
            UnitManager.sortNearest(position),
            UnitManager.NOOP,
        );
        return result.slice(0, Math.min(count, result.length));
    }

    static sortByHealth:mRTypes.CompareFunc<Mob> = (a:Mob, b:Mob) =>
    {
        return a.mobData.currentHealth - b.mobData.currentHealth;
    };

    static sortByHealthPercentage:mRTypes.CompareFunc<Mob> = (a:Mob, b:Mob) =>
    {
        return (
            ((a.mobData.currentHealth / a.mobData.maxHealth) - 0.4 * (a.mobData.healPriority ? 1.0 : 0.0)) - 
            ((b.mobData.currentHealth / b.mobData.maxHealth) - 0.4 * (b.mobData.healPriority ? 1.0 : 0.0))
        );
    };

    static sortNearest(position:Phaser.Math.Vector2):mRTypes.CompareFunc<Mob>
    {
        return (a:Mob, b:Mob) => {
            return (
                new Phaser.Math.Vector2(a.x, a.y).distance(position)
              - new Phaser.Math.Vector2(b.x, b.y).distance(position)
            );
        }
    }

    static IDENTITY:mRTypes.CompareFunc<Mob> = (a:Mob, b:Mob) => 0;
    static NOOP:mRTypes.FilterFunc<Mob> = (a:Mob) => true;

    // // Boardcast the method targeted target with args to any listeners of any mobs that focused on the target.
    // boardcast: function(method, target, args)
    // {
    //     var flag = false;

    //     flag = flag | this._boardcast(this.player, method, target, args);
    //     flag = flag | this._boardcast(this.enemy, method, target, args);

    //     return flag;
    // },

    // // The actually boardcast process goes here.
    // _boardcast: function(set, method, target, args)
    // {
    //     var flag = false;

    //     if(target)
    //     {
    //         for(var _mob of set)
    //         {
    //             for(let obj of _mob.data.listeners)
    //             {
    //                 if((obj.enabled == undefined || obj.enabled && obj.enabled == true)
    //                  && obj.focusList && obj.focusList.has(target))   
    //                 {
    //                     flag = flag | obj[method](args);
    //                 }
    //             }
    //         }
    //     }

    //     return flag;
    // },
}
