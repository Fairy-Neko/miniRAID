/** @packageDocumentation @module GameScene */

import { TestScene } from './TestScene'
import { DynamicLoaderScene } from './Engine/DynamicLoader/DynamicLoaderScene'
import { UnitFrame } from './Engine/UI/UnitFrame';
import { UIScene } from './Engine/UI/UIScene';

export class InitPhaser 
{
    static gameRef: Phaser.Game;

    public static initGame() 
    {
        let config: Phaser.Types.Core.GameConfig =
        {
            type: Phaser.AUTO,
            width: 1024,
            height: 640,
            resolution: window.devicePixelRatio,
            scene: [TestScene],
            banner: true,
            title: 'miniRAID',
            url: 'https://updatestage.littlegames.app',
            version: 'er. CoreDev',
            parent: 'GameFrame',
            render: {
                pixelArt: true,
                roundPixels: true,
                antialias: false,
                antialiasGL: false,
            }
        }

        this.gameRef = new Phaser.Game(config);
        this.gameRef.scene.add('DynamicLoaderScene', DynamicLoaderScene.getSingleton(), true);
        this.gameRef.scene.add('UIScene', UIScene.getSingleton(), true);
    }
}

InitPhaser.initGame();
