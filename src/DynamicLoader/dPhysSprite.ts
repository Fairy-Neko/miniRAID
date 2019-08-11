/** @module DynamicLoader */

import DynamicLoadObject from './DynamicLoadObject'
import * as dl from './DynamicLoadObject'
import DynamicLoaderScene from './DynamicLoaderScene';

interface DSAnimCache
{
    key: string;
    startFrame: number;
}

export default class dPhysSprite extends Phaser.Physics.Arcade.Sprite implements DynamicLoadObject
{
    loadComplete: boolean;
    resources: dl.ResourceRequirements[];

    textureToLoad:  string;
    frameToLoad:    string | integer;
    currentAnim:    DSAnimCache;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, subsTexture?: string, frame?: string | integer)
    {
        var textureToLoad:  string;
        var frameToLoad:    string | integer;

        if(!scene.textures.exists(texture))
        {
            textureToLoad = texture;
            frameToLoad = frame;
            texture = subsTexture;
            frame = 0;
        }
        if(!texture)
        {
            texture = 'default';
        }
        
        super(scene, x, y, texture, frame);

        // Since we cannot put "super" to the very beginning ...
        this.resources = [];
        this.currentAnim = {'key': '', 'startFrame': 0};

        if(textureToLoad)
        {
            this.resources.push({'key': textureToLoad, 'metadata': {}, 'callback': this.onLoadComplete.bind(this)});
            this.textureToLoad = textureToLoad;
            this.frameToLoad = frameToLoad;
        }
        if(texture == 'default')
        {
            this.setVisible(false);
        }

        DynamicLoaderScene.getSingleton().loadMultiple(this.resources);
    }

    fetchChildren(): DynamicLoadObject[]
    {
        return [];
    }

    onLoadComplete(key:string, type:string, fileObj:any): void
    {
        if(key == this.textureToLoad)
        {
            this.loadComplete = true;
            this.setTexture(this.textureToLoad, this.frameToLoad);

            // Play cached animation
            if (this.currentAnim.key)
            {
                this.play(this.currentAnim.key, true, this.currentAnim.startFrame);
            }

            this.setVisible(true);
        }
    }

    // override to allow play() calls when not loaded (not sure if without this it will work or not, never tried)
    play(key: string, ignoreIfPlaying?: boolean, startFrame?: number): Phaser.GameObjects.Sprite
    {
        this.currentAnim.key = key;
        this.currentAnim.startFrame = startFrame;

        if(this.loadComplete == true)
        {
            super.play(key, ignoreIfPlaying, startFrame);
        }

        return this;
    }
}