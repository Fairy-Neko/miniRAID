namespace Example 
{
    export class ExampleScene extends Phaser.Scene 
    {
        logo:any;

        constructor() 
        {
            super({key: 'ExampleScene'});
        }

        preload() 
        {
            this.load.image('logo', 'assets/BlueHGRMJsm.png');
        }

        create() 
        {
            this.logo = this.add.image(<number> Example.InitPhaser.gameRef.config["width"] / 2, <number> Example.InitPhaser.gameRef.config["height"] / 2, 'logo');
            this.logo.setScale(.5,.5);

            let tween = this.tweens.add({
                            targets: this.logo,
                            scaleX: { value: 1.0, duration: 2000, ease: 'Back.easeInOut' },
                            scaleY: { value: 1.0, duration: 2000, ease: 'Back.easeInOut' },
                            yoyo: true,
                            repeat: -1
                            });

            // for (var i:number = 0; i < 4000; i++)
            // {
            //     var tmpText = this.add.text(16 + (i % 40) * 20, 16 + Math.floor(i / 40) * 20, '哇哦', {fontSize: '9px'});
            // }
        }
    }
}