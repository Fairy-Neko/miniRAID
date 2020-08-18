/** @module BattleScene */

import * as Events from '../Events/EventSystem'
import * as Phaser from 'Phaser'
import { Mob } from '../Mob'
import { dPhysSprite } from '../DynamicLoader/dPhysSprite';
import * as PlayerAgents from '../agents/PlayerAgents';
import { UnitManager } from '../core/UnitManager';
import { MobData } from '../core/MobData';
import { PopUpManager } from '../UI/PopUpManager';
import { CometWand } from '../Weapons/Stuff';
import { Spell } from '../GameObjects/Spell';

export class BattleScene extends Phaser.Scene 
{
    logo: any;
    logo_scale: number = 0.5;

    eventSystem: Events.EventSystem = new Events.EventSystem();
    objs: Events.EventElement[] = [];
    num: number;
    cnt: number = 0;

    width: number;
    height: number;

    terrainLayer: Phaser.Tilemaps.StaticTilemapLayer;
    map: Phaser.Tilemaps.Tilemap;
    tiles: Phaser.Tilemaps.Tileset;

    unitMgr: UnitManager;

    worldGroup: Phaser.Physics.Arcade.Group;
    commonGroup: Phaser.Physics.Arcade.Group;
    fxGroup: Phaser.Physics.Arcade.Group;

    playerGroup: Phaser.Physics.Arcade.Group;
    enemyGroup: Phaser.Physics.Arcade.Group;

    playerTargetingObjectGroup: Phaser.Physics.Arcade.Group;
    enemyTargetingObjectGroup: Phaser.Physics.Arcade.Group;
    everyoneTargetingObjectGroup: Phaser.Physics.Arcade.Group;

    constructor() 
    {
        super({
            key: 'BattleScene',
            physics: {
                default: 'arcade',
                'arcade': {
                    // debug: true,
                }
            }
        });
    }

    preload() 
    {
        this.load.image('logo', 'assets/BlueHGRMJsm.png');
        this.width = this.sys.game.canvas.width;
        this.height = this.sys.game.canvas.height;

        this.load.image('Grass_Overworld', 'assets/tilemaps/tiles/overworld_tileset_grass.png');
        this.load.tilemapTiledJSON('overworld', 'assets/tilemaps/Overworld_tst.json');

        this.load.spritesheet('elf', 'assets/forestElfMyst.png', { frameWidth: 32, frameHeight: 32, endFrame: 3 });
    }

    addMob(mob: Mob)
    {
        this.add.existing(mob);
        if (mob.mobData.isPlayer)
        {
            this.playerGroup.add(mob);
        }
        else
        {
            this.enemyGroup.add(mob);
        }
    }

    create() 
    {
        UnitManager.resetScene(this);
        this.unitMgr = UnitManager.getCurrent();

        this.map = this.make.tilemap({ key: 'overworld' });
        this.tiles = this.map.addTilesetImage('Grass_Overworld', 'Grass_Overworld');
        this.terrainLayer = this.map.createStaticLayer('Terrain', this.tiles, 0, 0);

        this.anims.create({ key: 'move', frames: this.anims.generateFrameNumbers('elf', { start: 0, end: 3, first: 0 }), frameRate: 8, repeat: -1 });

        // Create groups
        this.worldGroup = this.physics.add.group();
        this.commonGroup = this.physics.add.group();
        this.fxGroup = this.physics.add.group();
        this.playerGroup = this.physics.add.group();
        this.enemyGroup = this.physics.add.group();
        this.playerTargetingObjectGroup = this.physics.add.group();
        this.enemyTargetingObjectGroup = this.physics.add.group();
        this.everyoneTargetingObjectGroup = this.physics.add.group();

        // this.alive.push(new Mob(this.add.sprite(100, 200, 'elf'), 'move'));
        let girl = new Mob(this, 100, 200, 'char_sheet_forestelf_myst', {
            'idleAnim': 'move',
            'moveAnim': 'move',
            'deadAnim': 'move',
            'backendData': new MobData({ name: 'testGirl', 'isPlayer': true, 'attackSpeed': 1.72 }),
            'agent': PlayerAgents.Simple,
        });
        girl.mobData.battleStats.attackPower.ice = 3.3;
        girl.mobData.battleStats.crit = 50.0;
        girl.mobData.weaponRight = new CometWand();
        girl.mobData.currentWeapon = girl.mobData.weaponRight;
        girl.mobData.addListener(girl.mobData.weaponRight);
        this.addMob(girl);

        let woodlog = new Mob(this, 300, 200, 'char_sheet_forestelf_myst', {
            'idleAnim': 'move',
            'moveAnim': 'move',
            'deadAnim': 'move',
            'backendData': new MobData({ name: 'woodLog', 'isPlayer': false, 'health': 100000, }),
            // 'agent': PlayerAgents.Simple,
            'agent': null,
        });
        this.addMob(woodlog);

        this.physics.add.overlap(this.playerTargetingObjectGroup, this.playerGroup, this.spellHitMobCallback);
        this.physics.add.overlap(this.everyoneTargetingObjectGroup, this.playerGroup, this.spellHitMobCallback);

        this.physics.add.overlap(this.enemyTargetingObjectGroup, this.enemyGroup, this.spellHitMobCallback);
        this.physics.add.overlap(this.everyoneTargetingObjectGroup, this.enemyGroup, this.spellHitMobCallback);

        this.physics.add.overlap(this.playerTargetingObjectGroup, this.worldGroup, this.spellHitWorldCallback);
        this.physics.add.overlap(this.enemyTargetingObjectGroup, this.worldGroup, this.spellHitWorldCallback);
        this.physics.add.overlap(this.everyoneTargetingObjectGroup, this.worldGroup, this.spellHitWorldCallback);
        // this.physics.add.overlap(this.enemyGroup, this.playerGroup, this.spellHitMobCallback);
    }

    // Handle when spell hits a mob it targets
    spellHitMobCallback(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject)
    {
        let spell = <Spell>obj1;
        let mob = <Mob>obj2;

        spell.onHit(mob);
        spell.onMobHit(mob);

        // console.log("Obj1 = " + (<Mob>obj1).mobData.name);
        // console.log("Obj2 = " + (<Mob>obj2).mobData.name);
    }

    // Handle when spell hits some world object that it may interact
    spellHitWorldCallback(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject)
    {
        let spell = <Spell>obj1;
        // let mob = <Mob>obj2;

        spell.onHit(obj2);
        spell.onWorldHit(obj2);
    }

    update(time: number, dt: number)
    {
        this.children.each((item: Phaser.GameObjects.GameObject) => { item.update(dt / 1000.0); });

        this.unitMgr.update(dt / 1000.0);

        // for(let i = 0; i < 3; i++)
        // {
        //     PopUpManager.getSingleton().addText('test', Math.random() * 500 + 100, Math.random() * 300 + 100, new Phaser.Display.Color(255, 255, 255, 255), 1.0, 128 * (Math.random() * 2 - 1), -256, 0.0, 512);
        // }
    }
}
