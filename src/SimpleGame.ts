/** @packageDocumentation @module GameScene */

import { TestScene } from './TestScene'
import { DynamicLoaderScene } from './Engine/DynamicLoader/DynamicLoaderScene'
import { UnitFrame } from './Engine/UI/UnitFrame';
import { UIScene } from './Engine/UI/UIScene';
import { GamePreloadScene } from './Engine/ScenePrototypes/GamePreloadScene';

export class InitPhaser 
{
    static gameRef: Phaser.Game;

    public static initGame() 
    {
        let config: Phaser.Types.Core.GameConfig =
        {
            type: Phaser.AUTO,
            width: 1024,
            height: 660,
            resolution: 1,
            scene: [GamePreloadScene],
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
    }
}

InitPhaser.initGame();
