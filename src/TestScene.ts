/** @packageDocumentation @module BattleScene */

import { BattleScene } from "./Engine/ScenePrototypes/BattleScene";
import { Mob } from "./Engine/GameObjects/Mob";
import { MobData, EquipSlots } from "./Engine/Core/MobData";
import * as Weapons from "./Weapons";
import * as PlayerAgents from "./Engine/Agents/PlayerAgents";
import * as Agents from "./Agents";
import { HealDmg, Helper, getRandomInt } from "./Engine/Core/Helper";
import { SpellFlags } from "./Engine/GameObjects/Spell";
import { ItemManager } from "./Engine/Core/InventoryCore";
import { ItemList } from "./Lists/ItemList";
import { ObjectPopulator } from "./Engine/Core/ObjectPopulator";
import { ObjectList } from "./Lists/ObjectList";
import { AgentList } from "./Lists/AgentList";
import { GameData } from "./Engine/Core/GameData";
import * as Buffs from "./Buffs";
import { _, Localization } from "./Engine/UI/Localization";
import { Buff } from "./Engine/Core/Buff";
import { SpellDatas } from "./SpellData/FloraHeal";

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

    }

    // create()
    // {
    //     super.create();
    // }

    loadComplete() 
    {
        super.loadComplete();

        // this.map = this.make.tilemap({ key: 'overworld' });
        // this.tiles = this.map.addTilesetImage('Grass_Overworld', 'Grass_Overworld');
        // this.terrainLayer = this.map.createStaticLayer('Terrain', this.tiles, 0, 0);

        this.anims.create({ key: 'move', frames: this.anims.generateFrameNumbers('elf', { start: 0, end: 3, first: 0 }), frameRate: 8, repeat: -1 });

        for (let i = 0; i < 8; i++)
        {
            // this.alive.push(new Mob(this.add.sprite(100, 200, 'elf'), 'move'));
            this.girl = new Mob(this, 930, 220 + i * 30, 'sheet_forestelf_myst', {
                'backendData': new MobData({
                    'name': _('testGirl') + i,
                    'isPlayer': true,
                    'vit': 10 + getRandomInt(-3, 3),
                    'mag': 8 + getRandomInt(-3, 3),
                    'str': 2 + getRandomInt(-1, 1),
                    'int': 3 + getRandomInt(-2, 2),
                    'dex': 5 + getRandomInt(-3, 3),
                    'tec': 7 + getRandomInt(-3, 3),
                }),
                'agent': PlayerAgents.Simple,
            });
            this.girl.mobData.battleStats.attackPower.ice = 10;
            this.girl.mobData.battleStats.attackPower.fire = 40;
            this.girl.mobData.battleStats.crit = 5.0;

            this.girl.mobData.equip(new Weapons.CometWand(), EquipSlots.MainHand);
            this.girl.mobData.equip(new Weapons.CometWand(), EquipSlots.SubHand);

            this.girl.mobData.weaponSubHand.baseAttackSpeed = 0.05;
            this.girl.mobData.weaponSubHand.manaCost = 1;

            // this.girl.mobData.addListener(this.girl.mobData.weaponMainHand);
            // this.girl.receiveBuff(this.girl, new HDOT(Buff.fromKey('test_GodHeal'), GameData.Elements.heal, 20, 38, 0.8));

            this.girl.mobData.spells['floraHeal'] = new SpellDatas.FloraHeal({ 'name': 'FloraHeal', 'coolDown': 5.0 + i * 1.0, 'manaCost': 20 });

            this.addMob(this.girl);
        }

        let woodlog = new Mob(this, 300, 200, 'sheet_forestelf_myst', {
            'backendData': new MobData({ name: 'woodLog', 'isPlayer': false, 'health': 1000, }),
            'agent': Agents.KeepMoving,
            // 'agent': undefined,
        });
        this.addMob(woodlog);

        woodlog = new Mob(this, 350, 200, 'sheet_forestelf_myst', {
            'backendData': new MobData({ name: 'woodLog', 'isPlayer': false, 'health': 1000, }),
            'agent': Agents.KeepMoving,
            // 'agent': undefined,
        });
        this.addMob(woodlog);
        this.h = woodlog;

        woodlog = new Mob(this, 300, 250, 'sheet_forestelf_myst', {
            'backendData': new MobData({ name: 'woodLog', 'isPlayer': false, 'health': 1000, }),
            'agent': Agents.KeepMoving,
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
