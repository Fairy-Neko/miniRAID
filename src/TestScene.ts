/** @packageDocumentation @module BattleScene */

import { BattleScene } from "./Engine/ScenePrototypes/BattleScene";
import { Mob } from "./Engine/GameObjects/Mob";
import { MobData } from "./Engine/Core/MobData";
import { CometWand } from "./Weapons/Staff";
import * as PlayerAgents from "./Agents/PlayerAgents";
import { KeepMoving } from "./Agents/SimpleAgents";
import { HealDmg } from "./Engine/Core/Helper";
import { SpellFlags } from "./Engine/GameObjects/Spell";
import { ItemManager } from "./Engine/Core/InventoryCore";
import { ItemList } from "./Lists/ItemList";
import { ObjectPopulator } from "./Engine/Core/ObjectPopulator";
import { ObjectList } from "./Lists/ObjectList";
import { AgentList } from "./Lists/AgentList";
import { GameData } from "./Engine/Core/GameData";
import { HDOT } from "./Buffs/HDOT";

export class TestScene extends BattleScene
{
    terrainLayer: Phaser.Tilemaps.StaticTilemapLayer;
    tiles: Phaser.Tilemaps.Tileset;
    girl: Mob;

    h: Mob;
    hc: number = 0.5;
    hcM: number = 0.5;

    constructor() 
    {
        super(false); // debug?
    }

    preload() 
    {
        ObjectPopulator.setData(ObjectList, AgentList);

        super.preload();
        this.load.image('logo', 'assets/BlueHGRMJsm.png');

        this.load.image('Grass_Overworld', 'assets/tilemaps/tiles/overworld_tileset_grass.png');
        this.load.tilemapTiledJSON('overworld', 'assets/tilemaps/Overworld_tst.json');

        this.load.spritesheet('elf', 'assets/img/spritesheets/forestElfMyst.png', { frameWidth: 32, frameHeight: 32, endFrame: 3 });

        this.load.json('itemData', 'assets/dataSheets/Items.json');
    }

    create()
    {
        // Create the ItemManager
        ItemManager.setData(this.cache.json.get('itemData'), ItemList);

        super.create();
    }

    loadComplete() 
    {
        super.loadComplete();

        // this.map = this.make.tilemap({ key: 'overworld' });
        // this.tiles = this.map.addTilesetImage('Grass_Overworld', 'Grass_Overworld');
        // this.terrainLayer = this.map.createStaticLayer('Terrain', this.tiles, 0, 0);

        this.anims.create({ key: 'move', frames: this.anims.generateFrameNumbers('elf', { start: 0, end: 3, first: 0 }), frameRate: 8, repeat: -1 });

        for (let i = 0; i < 3; i++)
        {
            // this.alive.push(new Mob(this.add.sprite(100, 200, 'elf'), 'move'));
            this.girl = new Mob(this, 930, 220 + i * 100, 'sheet_forestelf_myst', {
                'idleAnim': 'move',
                'moveAnim': 'move',
                'deadAnim': 'move',
                'backendData': new MobData({ name: 'testGirl' + i, 'isPlayer': true, 'attackSpeed': 40 - 5 * i, 'mag': 13 - 2 * i, 'manaRegen': 2 + 6 * i }),
                'agent': PlayerAgents.Simple,
            });
            this.girl.mobData.battleStats.attackPower.ice = 10;
            this.girl.mobData.battleStats.attackPower.fire = 40;
            this.girl.mobData.battleStats.crit = 5.0;
            this.girl.mobData.weaponRight = new CometWand();
            this.girl.mobData.currentWeapon = this.girl.mobData.weaponRight;
            this.girl.mobData.addListener(this.girl.mobData.weaponRight);
            this.girl.receiveBuff(this.girl, new HDOT({ 'source': this.girl.mobData, 'countTime': false, 'name': 'GodHeal' }, GameData.Elements.heal, 10, 18, 1.66));
            this.addMob(this.girl);
        }

        let woodlog = new Mob(this, 300, 200, 'sheet_forestelf_myst', {
            'idleAnim': 'move',
            'moveAnim': 'move',
            'deadAnim': 'move',
            'backendData': new MobData({ name: 'woodLog', 'isPlayer': false, 'health': 1000, }),
            'agent': KeepMoving,
            // 'agent': undefined,
        });
        this.addMob(woodlog);

        woodlog = new Mob(this, 350, 200, 'sheet_forestelf_myst', {
            'idleAnim': 'move',
            'moveAnim': 'move',
            'deadAnim': 'move',
            'backendData': new MobData({ name: 'woodLog', 'isPlayer': false, 'health': 1000, }),
            'agent': KeepMoving,
            // 'agent': undefined,
        });
        this.addMob(woodlog);
        this.h = woodlog;

        woodlog = new Mob(this, 300, 250, 'sheet_forestelf_myst', {
            'idleAnim': 'move',
            'moveAnim': 'move',
            'deadAnim': 'move',
            'backendData': new MobData({ name: 'woodLog', 'isPlayer': false, 'health': 1000, }),
            'agent': KeepMoving,
            // 'agent': undefined,
        });
        this.addMob(woodlog);
    }

    updateScene(time: number, dt: number)
    {
        // console.log("Mana: " + this.girl.mobData.currentMana.toString() + " / " + this.girl.mobData.maxMana.toString());

        if (this.hc < 0)
        {
            this.hc = this.hcM;
            HealDmg({ 'source': this.h, 'target': this.h, type: GameData.Elements.heal, value: 5 });
        }
        this.hc -= dt * 0.001;
    }
}
