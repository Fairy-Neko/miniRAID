/** @module BattleScene */

import { BattleScene } from "./Engine/ScenePrototypes/BattleScene";
import { Mob } from "./Engine/GameObjects/Mob";
import { MobData } from "./Engine/Core/MobData";
import { CometWand } from "./Weapons/Stuff";
import * as PlayerAgents from "./Agents/PlayerAgents";

export class TestScene extends BattleScene
{
    terrainLayer: Phaser.Tilemaps.StaticTilemapLayer;
    map: Phaser.Tilemaps.Tilemap;
    tiles: Phaser.Tilemaps.Tileset;

    constructor() 
    {
        super(false); // debug?
    }

    preload() 
    {
        super.preload();
        this.load.image('logo', 'assets/BlueHGRMJsm.png');

        this.load.image('Grass_Overworld', 'assets/tilemaps/tiles/overworld_tileset_grass.png');
        this.load.tilemapTiledJSON('overworld', 'assets/tilemaps/Overworld_tst.json');

        this.load.spritesheet('elf', 'assets/forestElfMyst.png', { frameWidth: 32, frameHeight: 32, endFrame: 3 });
    }

    create() 
    {
        super.create();
        this.map = this.make.tilemap({ key: 'overworld' });
        this.tiles = this.map.addTilesetImage('Grass_Overworld', 'Grass_Overworld');
        this.terrainLayer = this.map.createStaticLayer('Terrain', this.tiles, 0, 0);

        this.anims.create({ key: 'move', frames: this.anims.generateFrameNumbers('elf', { start: 0, end: 3, first: 0 }), frameRate: 8, repeat: -1 });

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
    }
}
