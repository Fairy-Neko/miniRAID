/** @packageDocumentation @module BattleScene */

import { BattleScene } from "./Engine/ScenePrototypes/BattleScene";
import { Mob } from "./Engine/GameObjects/Mob";
import { MobData, EquipSlots } from "./Engine/Core/MobData";
import * as Weapons from "./Weapons";
import * as PlayerAgents from "./Engine/Agents/PlayerAgents";
import * as Mobs from './Mobs';
import * as Agents from "./Agents";
import { Helper, getRandomInt } from "./Engine/Core/Helper";
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
import * as SpellDatas from "./SpellData/";
import { MobListener } from "./Engine/Core/MobListener";

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
        this.load.spritesheet('particles', 'assets/img/projectiles/particles.png', { 'frameWidth': 8, 'frameHeight': 8 });
    }

    // create()
    // {
    //     super.create();
    // }

    loadComplete() 
    {
        super.loadComplete();

        // let iceShard = this.add.particles('particles', 0);
        // iceShard.createEmitter({
        //     x: 600,
        //     y: 100,
        //     angle: { min: 0, max: 360 },
        //     speed: 400,
        //     scale: 1,
        //     gravityY: 200,
        //     lifespan: { min: 1000, max: 2000 },
        //     // blendMode: 'ADD'
        // });

        // this.map = this.make.tilemap({ key: 'overworld' });
        // this.tiles = this.map.addTilesetImage('Grass_Overworld', 'Grass_Overworld');
        // this.terrainLayer = this.map.createStaticLayer('Terrain', this.tiles, 0, 0);

        this.anims.create({ key: 'move', frames: this.anims.generateFrameNumbers('elf', { start: 0, end: 3, first: 0 }), frameRate: 8, repeat: -1 });

        for (let i = 0; i < 1; i++)
        {
            // this.alive.push(new Mob(this.add.sprite(100, 200, 'elf'), 'move'));
            this.girl = new Mob(this, 930, 220 + i * 30, 'sheet_mHwarrior', {
                'backendData': new MobData({
                    'name': _('Guardian') + i,
                    'isPlayer': true,
                    'vit': 40 + getRandomInt(-10, 10),
                    'mag': 5 + getRandomInt(-3, 3),
                    'str': 3 + getRandomInt(-3, 3),
                    'int': 3 + getRandomInt(-3, 3),
                    'dex': 8 + getRandomInt(-3, 3),
                    'tec': 7 + getRandomInt(-3, 3),
                }),
                'agent': PlayerAgents.Simple,
            });

            this.girl.mobData.equip(new Weapons.Staffs.CometWand(), EquipSlots.MainHand);
            this.girl.mobData.equip(new Weapons.Staffs.FlameWand(), EquipSlots.SubHand);
            this.girl.mobData.currentWeapon.activeRange = 50;
            this.girl.mobData.tauntMul = 2.5;

            this.girl.mobData.weaponSubHand.baseAttackSpeed = 0.05;
            this.girl.mobData.weaponSubHand.manaCost = 1;

            this.girl.mobData.spells['taunt'] = new SpellDatas.Taunt({ 'name': 'Taunt' });

            this.addMob(this.girl);
        }

        for (let i = 0; i < 1; i++)
        {
            // this.alive.push(new Mob(this.add.sprite(100, 200, 'elf'), 'move'));
            this.girl = new Mob(this, 930, 250 + i * 30, 'sheet_mHdruid', {
                'backendData': new MobData({
                    'name': _('Healer') + i,
                    'isPlayer': true,
                    'vit': 8 + getRandomInt(-10, 10),
                    'mag': 20 + getRandomInt(-8, 8),
                    'str': 3 + getRandomInt(-3, 3),
                    'int': 3 + getRandomInt(-3, 3),
                    'dex': 8 + getRandomInt(-3, 3),
                    'tec': 7 + getRandomInt(-3, 3),
                }),
                'agent': PlayerAgents.Simple,
            });

            this.girl.mobData.equip(new Weapons.Staffs.CometWand(), EquipSlots.MainHand);
            this.girl.mobData.equip(new Weapons.Staffs.FlameWand(), EquipSlots.SubHand);
            // this.girl.mobData.currentWeapon.activeRange = 350;

            this.girl.mobData.weaponSubHand.baseAttackSpeed = 0.05;
            this.girl.mobData.weaponSubHand.manaCost = 1;

            this.girl.mobData.spells['bigHeal'] = new SpellDatas.BigHeal({ 'name': 'BigHeal' });

            this.addMob(this.girl);
        }

        for (let i = 0; i < 3; i++)
        {
            // this.alive.push(new Mob(this.add.sprite(100, 200, 'elf'), 'move'));
            this.girl = new Mob(this, 930, 280 + i * 30, 'sheet_forestelf_myst', {
                'backendData': new MobData({
                    'name': _('testGirl') + i,
                    'isPlayer': true,
                    'vit': 12 + getRandomInt(-3, 3),
                    'mag': 5 + getRandomInt(-3, 3),
                    'str': 3 + getRandomInt(-3, 3),
                    'int': 3 + getRandomInt(-3, 3),
                    'dex': 8 + getRandomInt(-3, 3),
                    'tec': 7 + getRandomInt(-3, 3),
                }),
                'agent': PlayerAgents.Simple,
            });

            this.girl.mobData.equip(new Weapons.Staffs.CometWand(), EquipSlots.MainHand);
            this.girl.mobData.equip(new Weapons.Staffs.FlameWand(), EquipSlots.SubHand);
            // this.girl.mobData.currentWeapon.activeRange = 2000;

            this.girl.mobData.weaponSubHand.baseAttackSpeed = 0.05;
            this.girl.mobData.weaponSubHand.manaCost = 1;

            // this.girl.mobData.addListener(this.girl.mobData.weaponMainHand);
            // this.girl.receiveBuff(this.girl, new Buffs.HDOT(Buff.fromKey('test_GodHeal'), GameData.Elements.heal, 20, 38, 0.8));

            this.girl.mobData.spells['floraHeal'] = new SpellDatas.FloraHeal({ 'name': 'FloraHeal', 'coolDown': 5.0 + i * 1.0, 'manaCost': 20 });

            this.addMob(this.girl);
        }

        for (let i = 0; i < 1; i++)
        {
            // this.alive.push(new Mob(this.add.sprite(100, 200, 'elf'), 'move'));
            this.girl = new Mobs.Allies.MountainElf.Mage(this, 930, 280 + i * 30, 'sheet_forestelf_myst', {
                'backendData': new MobData({
                    'name': _('Mage') + i,
                    'isPlayer': true,
                    'vit': 12 + getRandomInt(-3, 3),
                    'mag': 5 + getRandomInt(-3, 3),
                    'str': 3 + getRandomInt(-3, 3),
                    'int': 3 + getRandomInt(-3, 3),
                    'dex': 8 + getRandomInt(-3, 3),
                    'tec': 7 + getRandomInt(-3, 3),
                }),
                'agent': PlayerAgents.Simple,
            });

            this.girl.mobData.equip(new Weapons.Staffs.CometWand(), EquipSlots.MainHand);
            this.girl.mobData.equip(new Weapons.Staffs.FlameWand(), EquipSlots.SubHand);
            // this.girl.mobData.currentWeapon.activeRange = 2000;

            this.girl.mobData.weaponSubHand.baseAttackSpeed = 0.05;
            this.girl.mobData.weaponSubHand.manaCost = 1;

            // this.girl.mobData.addListener(this.girl.mobData.weaponMainHand);
            // this.girl.receiveBuff(this.girl, new Buffs.HDOT(Buff.fromKey('test_GodHeal'), GameData.Elements.heal, 20, 38, 0.8));

            // this.girl.mobData.spells['floraHeal'] = new SpellDatas.FloraHeal({ 'name': 'FloraHeal', 'coolDown': 5.0 + i * 1.0, 'manaCost': 20 });

            this.addMob(this.girl);
        }

        for (let i = 0; i < 2; i++)
        {
            // this.alive.push(new Mob(this.add.sprite(100, 200, 'elf'), 'move'));
            this.girl = new Mobs.Allies.WindElf.Hunter(this, 930, 220 + 180 + i * 30, 'sheet_forestelf_myst', {
                'backendData': new MobData({
                    'name': _('Hunter') + i,
                    'isPlayer': true,
                    'vit': 10 + getRandomInt(-3, 3),
                    'mag': 5 + getRandomInt(-3, 3),
                    'str': 3 + getRandomInt(-3, 3),
                    'int': 3 + getRandomInt(-3, 3),
                    'dex': 8 + getRandomInt(-3, 3),
                    'tec': 7 + getRandomInt(-3, 3),
                }),
                'agent': PlayerAgents.Simple,
            });
            this.girl.mobData.battleStats.attackPower.ice = 10;
            this.girl.mobData.battleStats.attackPower.fire = 40;
            this.girl.mobData.battleStats.crit = 5.0;

            this.girl.mobData.equip(new Weapons.Bows.VentonHuntingBow(), EquipSlots.MainHand);
            this.girl.mobData.equip(new Weapons.Staffs.FlameWand(), EquipSlots.SubHand);
            // this.girl.mobData.currentWeapon.activeRange = 2000;

            this.girl.mobData.weaponSubHand.baseAttackSpeed = 0.05;
            this.girl.mobData.weaponSubHand.manaCost = 1;

            // this.girl.mobData.addListener(this.girl.mobData.weaponMainHand);
            // this.girl.receiveBuff(this.girl, new Buffs.HDOT(Buff.fromKey('test_GodHeal'), GameData.Elements.heal, 20, 38, 0.8));

            // this.girl.mobData.spells['floraHeal'] = new SpellDatas.FloraHeal({ 'name': 'FloraHeal', 'coolDown': 12.0 + i * 1.0, 'manaCost': 20 });

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
    }
}
