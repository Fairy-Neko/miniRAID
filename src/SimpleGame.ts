import ExampleScene from './ExampleScene'

export default class InitPhaser 
{
    static gameRef:Phaser.Game;

    public static initGame() 
    {
        let config = 
        {
            type: Phaser.AUTO,
            width: 1024,
            height: 640,
            scene: [ExampleScene],
            banner: true,
            title: 'Playground',
            url: 'https://updatestage.littlegames.app',
            version: '-1.0',
        }

        this.gameRef = new Phaser.Game(config);
    }
}

console.log("!");
InitPhaser.initGame();
