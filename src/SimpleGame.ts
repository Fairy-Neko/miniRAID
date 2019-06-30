/// <reference path='ExampleScene.ts'/>

namespace Example
{
    export class InitPhaser 
    {
        static gameRef:Phaser.Game;
 
        public static initGame() 
        {
            let config = 
            {
                type: Phaser.AUTO,
                width: 400,
                height: 240,
                scene: [ExampleScene],
                banner: true,
                title: 'Playground',
                url: 'https://updatestage.littlegames.app',
                version: '-1.0',
            }
 
            this.gameRef = new Phaser.Game(config);
        }
    }
}
 
window.onload = 
() => {
    Example.InitPhaser.initGame();
};