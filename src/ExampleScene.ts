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

    constructor() 
    {
        super({key: 'ExampleScene'});
    }

    preload() 
    {
        this.load.image('logo', 'assets/BlueHGRMJsm.png');
        this.width = this.sys.game.canvas.width;
        this.height = this.sys.game.canvas.height;
    }

    create() 
    {
        this.logo = this.add.image(this.width / 2, this.height / 2, 'logo');
        this.logo.setScale(this.logo_scale, this.logo_scale);

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
        this.logo_scale = time / 10000.0;
        this.logo.setScale(this.logo_scale, this.logo_scale);

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
