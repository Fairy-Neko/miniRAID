/** @module GameScene */

import {ExampleScene} from './ExampleScene'
import {DynamicLoaderScene} from './DynamicLoader/DynamicLoaderScene'
import { PopUpManager } from './UI/PopUpManager';

export class InitPhaser 
{
    static gameRef:Phaser.Game;

    public static initGame() 
    {
        let config:Phaser.Types.Core.GameConfig = 
        {
            type: Phaser.AUTO,
            width: 1024,
            height: 640,
            scene: [ExampleScene],
            banner: true,
            title: 'Playground',
            url: 'https://updatestage.littlegames.app',
            version: '-1.0',
            parent: 'GameFrame',
        }

        this.gameRef = new Phaser.Game(config);
        this.gameRef.scene.add('DynamicLoaderScene', DynamicLoaderScene.getSingleton(), true);
        this.gameRef.scene.add('PopupManagerScene', PopUpManager.getSingleton(), true);
    }
}

InitPhaser.initGame();
