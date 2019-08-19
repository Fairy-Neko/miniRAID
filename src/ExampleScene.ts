/** @module GameScene */

import * as Events from './Events/EventSystem'
import * as Phaser from 'Phaser'
import {Mob} from './Mob'
import {dPhysSprite} from './DynamicLoader/dPhysSprite';
import * as PlayerAgents from './agents/PlayerAgents';
import { UnitManager } from './core/UnitManager';
import { MobData } from './core/MobData';

export class ExampleScene extends Phaser.Scene 
{
    logo:any;
    logo_scale:number = 0.5;

    eventSystem:Events.EventSystem = new Events.EventSystem();
    objs:Events.EventElement[] = [];
    num:number;
    cnt:number = 0;

    width:number;
    height:number;

    terrainLayer:Phaser.Tilemaps.StaticTilemapLayer;
    map:Phaser.Tilemaps.Tilemap;
    tiles:Phaser.Tilemaps.Tileset;

    alive:Mob[] = [];
    unitMgr: UnitManager;

    constructor() 
    {
        super({
            key: 'ExampleScene', 
            physics: {
                default: 'arcade',
                'arcade': {
                    debug: true,
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

        this.load.spritesheet('elf', 'assets/forestElfMyst.png', {frameWidth: 32, frameHeight: 32, endFrame: 3});
    }

    create() 
    {
        UnitManager.resetScene(this);
        this.unitMgr = UnitManager.getCurrent();

        this.map = this.make.tilemap({key: 'overworld'});
        this.tiles = this.map.addTilesetImage('Grass_Overworld', 'Grass_Overworld');
        this.terrainLayer = this.map.createStaticLayer('Terrain', this.tiles, 0, 0);

        this.anims.create({key: 'move', frames: this.anims.generateFrameNumbers('elf', {start: 0, end: 3, first: 0}), frameRate: 8, repeat: -1});

        // this.alive.push(new Mob(this.add.sprite(100, 200, 'elf'), 'move'));
        let girl = new Mob({
            'sprite': new dPhysSprite(this, 100, 200, 'char_sheet_forestelf_myst'),
            'idleAnim': 'move',
            'moveAnim': 'move',
            'deadAnim': 'move',
            'isPlayer': true,
            'backendData': new MobData({name: 'testMob'}),
            'agent': PlayerAgents.Simple,
        });
        this.alive.push(girl);
        this.add.existing(girl.sprite);
    }

    update(time:number, dt:number)
    {
        for(let m of this.alive)
        {
            m.update(dt);
        }

        this.unitMgr.update(dt);
    }
}
