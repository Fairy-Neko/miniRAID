/** @packageDocumentation @module BattleScene */

import * as Events from '../Events/EventSystem'
// import * as Phaser from 'phaser'
import { Mob } from '../GameObjects/Mob'
import { UnitManager } from '../Core/UnitManager';
import { Spell } from '../GameObjects/Spell';
import { DynamicLoaderScene } from '../DynamicLoader/DynamicLoaderScene';
import { ObjectPopulator } from '../Core/ObjectPopulator';
import { BattleMonitor } from '../Core/BattleMonitor';
import { UIScene } from '../UI/UIScene';
import { ProgressBar } from '../UI/ProgressBar';

export class BattleScene extends Phaser.Scene 
{
    width: number;
    height: number;

    unitMgr: UnitManager;

    worldGroup: Phaser.Physics.Arcade.Group;
    commonGroup: Phaser.Physics.Arcade.Group;
    fxGroup: Phaser.Physics.Arcade.Group;

    playerGroup: Phaser.Physics.Arcade.Group;
    enemyGroup: Phaser.Physics.Arcade.Group;

    playerTargetingObjectGroup: Phaser.Physics.Arcade.Group;
    enemyTargetingObjectGroup: Phaser.Physics.Arcade.Group;
    everyoneTargetingObjectGroup: Phaser.Physics.Arcade.Group;

    mapToLoad: string;
    map: Phaser.Tilemaps.Tilemap;
    tilesetImgPrefix: string = 'assets/tilemaps/tiles/';

    mapReady: boolean;
    loadingScreen: Phaser.GameObjects.Rectangle;
    battleMonitor: BattleMonitor;

    currProgress: number = 0;
    pBar: ProgressBar;

    constructor(debug: boolean = false, mapToLoad = "playground") 
    {
        super({
            key: 'BattleScene',
            physics: {
                default: 'arcade',
                'arcade': {
                    debug: debug,
                }
            }
        });

        this.mapToLoad = mapToLoad;
    }

    preload() 
    {
        this.width = this.sys.game.canvas.width;
        this.height = this.sys.game.canvas.height;

        this.load.tilemapTiledJSON(this.mapToLoad, "assets/tilemaps/playground.json");
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

        // Create groups
        this.worldGroup = this.physics.add.group();
        this.commonGroup = this.physics.add.group();
        this.fxGroup = this.physics.add.group();
        this.playerGroup = this.physics.add.group();
        this.enemyGroup = this.physics.add.group();
        this.playerTargetingObjectGroup = this.physics.add.group();
        this.enemyTargetingObjectGroup = this.physics.add.group();
        this.everyoneTargetingObjectGroup = this.physics.add.group();

        this.physics.add.overlap(this.playerTargetingObjectGroup, this.playerGroup, this.spellHitMobCallback);
        this.physics.add.overlap(this.everyoneTargetingObjectGroup, this.playerGroup, this.spellHitMobCallback);

        this.physics.add.overlap(this.enemyTargetingObjectGroup, this.enemyGroup, this.spellHitMobCallback);
        this.physics.add.overlap(this.everyoneTargetingObjectGroup, this.enemyGroup, this.spellHitMobCallback);

        this.physics.add.overlap(this.playerTargetingObjectGroup, this.worldGroup, this.spellHitWorldCallback);
        this.physics.add.overlap(this.enemyTargetingObjectGroup, this.worldGroup, this.spellHitWorldCallback);
        this.physics.add.overlap(this.everyoneTargetingObjectGroup, this.worldGroup, this.spellHitWorldCallback);

        // Prepare for load the tilemap
        this.loadingScreen = this.add.rectangle(0, 0, 1024, 680, 0x000000);
        this.loadingScreen.setOrigin(0);
        this.loadingScreen.displayWidth = 1024;
        this.loadingScreen.displayHeight = 640;
        this.loadingScreen.setDepth(100);

        this.map = this.make.tilemap({ key: this.mapToLoad });
        console.log(this.map);
        for (let tileset of this.map.tilesets)
        {
            let path: string = this.tilesetImgPrefix + tileset.name + ".png";
            this.load.image(tileset.name, path);
            console.log(path);
        }

        this.pBar = new ProgressBar(this, 400, 310, () => [this.currProgress, 1.0], 224, 20, 5, false, 0x444444, 0x000000, 0xade0ee, false);
        this.pBar.setDepth(1000);
        this.add.existing(this.pBar);
        this.load.on('progress', (value: number) => { this.currProgress = value; });

        this.load.on('complete', () => { this.loadComplete(); UIScene.getSingleton().resetPlayers(); });
        this.load.start();
    }

    loadComplete()
    {
        this.tweens.add({
            targets: this.loadingScreen,
            alpha: { value: 0, duration: 1000, ease: 'Power1' },
            yoyo: false,
            repeat: 0
        });

        // Remove the loading bar
        this.tweens.add({
            targets: this.pBar,
            alpha: 0,
            duration: 300,
        }).on('complete', () => { this.pBar.destroy(); this.pBar = undefined; });

        for (let tileset of this.map.tilesets)
        {
            this.map.addTilesetImage(tileset.name, tileset.name);
        }
        for (let layer of this.map.layers)
        {
            let tmp_layer = this.map.createStaticLayer(layer.name, this.map.tilesets, 0, 0);
            tmp_layer.depth = -1; // TODO: adjust this value
        }
        for (let objLayer of this.map.objects)
        {
            for (let obj of objLayer.objects)
            {
                let objPopulated = ObjectPopulator.newObject<Phaser.GameObjects.GameObject>(this, obj.type == "" ? obj.name : obj.type, obj);
                if (objPopulated instanceof Mob)
                {
                    this.addMob(objPopulated);
                }
                else if (objPopulated)
                {
                    this.add.existing(objPopulated);
                }
            }
        }
        console.log(this.map);
        this.mapReady = true;
        this.battleMonitor = BattleMonitor.getSingleton();
    }

    // Handle when spell hits a mob it targets
    spellHitMobCallback(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject)
    {
        let spell = <Spell>obj1;
        let mob = <Mob>obj2;

        spell.onHit(mob);
        spell.onMobHit(mob);
    }

    // Handle when spell hits some world object that it may interact
    spellHitWorldCallback(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject)
    {
        let spell = <Spell>obj1;

        spell.onHit(obj2);
        spell.onWorldHit(obj2);
    }

    update(time: number, dt: number)
    {
        if (this.mapReady)
        {
            this.children.each((item: Phaser.GameObjects.GameObject) => { item.update(dt / 1000.0); });
            this.unitMgr.update(dt / 1000.0);

            this.updateScene(time, dt / 1000.0);
            BattleMonitor.getSingleton().update(dt / 1000.0);
        }
        else if (this.pBar)
        {
            this.pBar.update(time, dt / 1000.0);
        }
    }

    updateScene(time: number, dt: number) { }
}
