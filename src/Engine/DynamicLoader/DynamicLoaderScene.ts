/** @packageDocumentation @module DynamicLoader */

// import * as Phaser from 'phaser'
import { DraggableScene } from '../UI/DraggableScene'
import * as DLO from './DynamicLoadObject'
import * as Collections from 'typescript-collections'

interface DLResourcePool
{
    exists(key: string): boolean;
    get(key: string): any;
}

interface DLResourceIO
{
    load: (confObj: any) => Phaser.Loader.LoaderPlugin;
    pool: DLResourcePool;
}

export class DynamicLoaderScene extends DraggableScene
{
    private static instance: DynamicLoaderScene;

    assetList: any;
    label: Phaser.GameObjects.Text;
    queue: DLO.ResourceRequirements[] = [];
    pending: Map<string, DLO.ResourceRequirements[]> = new Map();
    isLoading: boolean = false;
    pools: Map<string, DLResourceIO> = new Map();

    private constructor()
    {
        super({ key: 'DynamicLoaderScene' });

        this.screenX = 10;
        this.screenY = 10;
        this.sizeX = 800;
        this.sizeY = 40;
    }

    preload()
    {
        this.load.json('assetList', './assets/assetList.json');
    }

    create()
    {
        super.create();
        this.label = this.add.text(0, 0, 'Loading ... [100.0%]');

        this.assetList = this.cache.json.get('assetList');

        this.pools.set("image", {
            "load": this.scene.scene.load.image,
            "pool": this.scene.scene.textures
        });
        this.pools.set("spritesheet", {
            "load": this.scene.scene.load.spritesheet,
            "pool": this.scene.scene.textures
        });
        this.pools.set("audio", {
            "load": this.scene.scene.load.audio,
            "pool": this.scene.scene.cache.audio
        });
        this.pools.set("bitmapFont", {
            "load": this.scene.scene.load.bitmapFont,
            "pool": this.scene.scene.cache.bitmapFont
        });
        this.pools.set("binary", {
            "load": this.scene.scene.load.binary,
            "pool": this.scene.scene.cache.binary
        });
        this.pools.set("json", {
            "load": this.scene.scene.load.json,
            "pool": this.scene.scene.cache.json
        });
        this.pools.set("JSONtilemap", {
            "load": this.scene.scene.load.tilemapTiledJSON,
            "pool": this.scene.scene.cache.tilemap
        });
        this.pools.set("glsl", {
            "load": this.scene.scene.load.glsl,
            "pool": this.scene.scene.cache.shader
        });
        this.pools.set("text", {
            "load": this.scene.scene.load.text,
            "pool": this.scene.scene.cache.text
        });

        this.scene.scene.load.on('complete', this.loadComplete.bind(this));
    }

    update(time: number, dt: number)
    {
        this.isLoading = this.scene.scene.load.isLoading();

        if (this.isLoading)
        {
            this.label.setVisible(true);
            this.label.text = `Loading ... [${(this.scene.scene.load.progress / 1.0 * 100.0).toFixed(1)}]`;
        }
        else
        {
            // this.label.setVisible(false);
            this.label.setVisible(true);
            this.label.text = `(DEBUG MESSAGE) Dynamic loader idle ...`;
        }

        if (this.queue.length > 0)
        {
            for (let i = 0; i < this.queue.length; i++)
            {
                let item = this.queue[i];
                if (this.assetList.hasOwnProperty(item.key))
                {
                    let resource = this.assetList[item.key];
                    let target: any;

                    let IOObj = this.pools.get(resource.type);

                    if (IOObj.pool.exists(item.key))
                    {
                        // We already have this
                        item.callback(item.key, resource.type, IOObj.pool.get(item.key));
                    }
                    // We don't want load a file many times (Phaser will throw a warning and actually it won't load multiple times for same keys, but hey we hate warnings (x))
                    else if (!this.pending.has(item.key))
                    {
                        console.log(`[DynamicLoader] Loading resource ${item.key} as type ${resource.type}`);
                        resource.key = item.key;
                        IOObj.load.apply(this.scene.scene.load, [resource]);
                        this.pending.set(item.key, [item]);
                    }
                    else
                    {
                        this.pending.get(item.key).push(item);
                    }
                }
                else
                {
                    console.warn(`[DynamicLoader] Resource not found: ${item.key}, discarding`);
                }
            }

            // Since we are done for all items
            this.queue.length = 0;
        }

        // Look for not yet loaded requests
        if (!this.isLoading && this.pending.size > 0)
        {
            this.scene.scene.load.start();
        }
    }

    loadSingle(req: DLO.ResourceRequirements)
    {
        this.queue.push(req);
    }

    loadMultiple(reqs: DLO.ResourceRequirements[])
    {
        this.queue.push.apply(this.queue, reqs);
    }

    loadComplete()
    {
        // Since we are done for all pending requests
        let self = this;
        this.pending.forEach(
            function (value: DLO.ResourceRequirements[], key: string, map: Map<string, DLO.ResourceRequirements[]>)
            {
                // Maybe we don't want to get it again for performance ...
                let resource = self.assetList[key];
                let IOObj = self.pools.get(resource.type);

                value.forEach(element =>
                {
                    element.callback(key, resource.type, IOObj.pool.get(key));
                });
            }
        );

        // Again, we are done so goodbye
        this.pending.clear();
    }

    pendLoad(requirement: DLO.ResourceRequirements)
    {
        this.queue.push(requirement);
    }

    static getSingleton(): DynamicLoaderScene
    {
        if (!DynamicLoaderScene.instance)
        {
            DynamicLoaderScene.instance = new DynamicLoaderScene();
            console.log("registering dynamic loader...");
        }
        return DynamicLoaderScene.instance;
    }
}
