import * as Events from './Events/EventSystem'
import * as Phaser from 'Phaser'

export default class ExampleScene extends Phaser.Scene 
{
    logo:any;
    logo_scale:number = 0.5;

    eventSystem:Events.EventSystem = new Events.EventSystem();
    objs:Events.EventElement[] = [];
    num:number;
    cnt:number = 0;

    width:number;
    height:number;

    ground_rt:Phaser.GameObjects.RenderTexture;
    terrainLayer:Phaser.Tilemaps.StaticTilemapLayer;
    map:Phaser.Tilemaps.Tilemap;
    tiles:Phaser.Tilemaps.Tileset;
    mesh0: Phaser.GameObjects.Mesh;

    constructor() 
    {
        super({key: 'ExampleScene'});
    }

    preload() 
    {
        this.load.image('logo', 'assets/BlueHGRMJsm.png');
        this.width = this.sys.game.canvas.width;
        this.height = this.sys.game.canvas.height;
    
        this.load.image('Grass_Overworld', 'assets/tilemaps/tiles/overworld_tileset_grass.png');
        this.load.tilemapTiledJSON('overworld', 'assets/tilemaps/Overworld_tst.json');
    }

    create() 
    {
        this.logo = this.add.image(this.width / 2, this.height / 2, 'logo');
        this.logo.setScale(this.logo_scale, this.logo_scale);

        this.map = this.make.tilemap({key: 'overworld'});
        this.tiles = this.map.addTilesetImage('Grass_Overworld', 'Grass_Overworld');
        this.terrainLayer = this.map.createStaticLayer('Terrain', this.tiles, 0, 0).setVisible(false);
        this.ground_rt = this.add.renderTexture(0, 0, 960, 544);

        this.ground_rt.saveTexture('ground_rt');

        this.mesh0 = this.make.mesh({
            key: 'ground_rt',
            x: 400,
            y: 250,
            vertices: [
            /*  X   |   Y  */
            /* ----------- */
                -150, -150,
                -300, 150,
                300, 150,
    
                -150, -150,
                300, 150,
                150, -150
            ],
            uv: [
            /*  U   |   V  */
            /* ----------- */
                0,      0,
                0,      1,
                1,      1,
                
                0,      0,
                1,      1,
                1,      0
            ]
        });

        // let tween = this.tweens.add({
        //                 targets: this.logo,
        //                 scaleX: { value: 1.0, duration: 2000, ease: 'Back.easeInOut' },
        //                 scaleY: { value: 1.0, duration: 2000, ease: 'Back.easeInOut' },
        //                 yoyo: true,
        //                 repeat: -1
        //                 });

        // for (var i:number = 0; i < 4000; i++)
        // {
        //     var tmpText = this.add.text(16 + (i % 40) * 20, 16 + Math.floor(i / 40) * 20, '哇哦', {fontSize: '9px'});
        // }

        // console.log('Building event system...')
        // // Init event system
        // // 50x {1 Main -> 9 Sub}
        // // this.num = 5000; // <-- This still runs at 60 FPS! with the update operation 7.88ms. Although the starting process is quite long (around 2min). This system is strong!
        // this.num = 500;
        // for(var i = 0; i < this.num * 10; i++)
        // {
        //     this.objs.push(new Events.EventElement(this.eventSystem));
        // }

        // // Create relationships
        // for(var i = 0; i < this.num * 10; i++)
        // {
        //     if(i % 10 >= 0)
        //     {
        //         this.objs[i].listen(this.objs[Math.floor(i / 10) * 10], 'update', (mob, dt) => {return 0;});
        //         this.objs[i].listen(this.objs[Math.floor(i / 10) * 10], 'onDamageReceived', (mob, src, dmg, hit, crit) => {/*console.log(dmg);*/});
        //         this.objs[i].listen(this.objs[Math.floor(i / 10) * 10], 'onDead', (mob, lastHit) => {return 0;});
        //         for(var j = 0; j < this.num; j++)
        //         {
        //             if(Math.random() < 0.5)
        //             {
        //                 this.objs[i].listen(this.objs[j * 10], 'onDamageReceived', (mob, src, dmg, hit, crit) => {/*console.log(dmg);*/})
        //             }
        //         }
        //     }

        //     if(i % 1000 == 0)
        //     {
        //         console.log(i / 10);
        //     }
        // }
    }

    update(time:number, dt:number)
    {
        // this.cnt ++;
        // if(this.cnt > 20)
        // {
        //     console.log(1000.0 / dt);
        //     this.cnt = 0;
        // }
        // this.logo_scale = time / 10000.0;
        // this.logo.setScale(this.logo_scale, this.logo_scale);

        // this.ground_rt.scale -= 0.01;
        this.ground_rt.setAngle(15);
        this.ground_rt.clear();
        this.ground_rt.draw(this.terrainLayer);
        // this.ground_rt.draw(this.mesh0);

        // for(var i = 0; i < this.num; i++)
        // {
        //     this.objs[i * 10].emit('update', this.objs[i * 10], dt);
        //     if(Math.random() < 0.6)
        //     {
        //         var src = Math.floor(Math.random() * this.num);
        //         var dmg = Math.random() * 100.0;
        //         this.objs[i * 10].emit('onDamageReceived', this.objs[i * 10], src, dmg, true, false);
        //     }
        // }
    }
}
