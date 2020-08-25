var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
/**
 * @packageDocumentation
 * @module Events
 */
define("Engine/Events/EventSystem", ["require", "exports", "typescript-collections"], function (require, exports, Collections) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Collections = __importStar(Collections);
    class EventElement {
        constructor(parentSystem) {
            this.listenRecord = new Collections.Set();
            this.parentSystem = parentSystem;
            this.UID = this.parentSystem.getUID();
        }
        emit(evt, resCallback, ...args) {
            return this.parentSystem.emit(this, resCallback, evt, args);
        }
        emitArray(evt, resCallback, args) {
            return this.parentSystem.emit(this, resCallback, evt, args);
        }
        listen(src, evt, callback) {
            var result = this.parentSystem.listen(src, this, callback, evt);
            this.listenRecord.add({ src: src, evt: evt });
            // result?
            return result;
        }
        unlisten(src, evt) {
            if (this.listenRecord.contains({ src: src, evt: evt })) {
                this.parentSystem.discardListener(src, this, evt);
                this.listenRecord.remove({ src: src, evt: evt });
                return true;
            }
            return false;
        }
        // So lazy to use another dict omg
        unlistenAll(src) {
            var result = false;
            // Will "this" be correct here? idk
            this.listenRecord.forEach((obj) => {
                if (obj.src === src) {
                    result = true;
                    this.unlisten(obj.src, obj.evt);
                }
            });
            return result;
        }
        discardEmitter() {
            this.parentSystem.discardEmitter(this);
        }
        discardReceiver() {
            // Will "this" be correct here? idk
            this.listenRecord.forEach((element) => {
                this.parentSystem.discardListener(element.src, this, element.evt);
            });
        }
        discard() {
            this.discardEmitter();
            this.discardReceiver();
        }
        toString() {
            return "ER" + this.UID;
        }
    }
    exports.EventElement = EventElement;
    class EventSystem {
        constructor() {
            this.Ecounter = 0;
            this.Rcounter = 0;
            this.dict = new Collections.Dictionary();
            // nothing to do?
        }
        getUID(isE = true) {
            if (isE) {
                return this.Ecounter++;
            }
            else {
                return this.Rcounter++;
            }
        }
        listen(src, dst, callback, evt) {
            // Check if the source object is in our dict
            if (!this.dict.containsKey(src)) {
                this.dict.setValue(src, new Collections.Dictionary());
            }
            var srcDict = this.dict.getValue(src);
            // Check if the event type is in our dict
            if (!srcDict.containsKey(evt)) {
                srcDict.setValue(evt, new Collections.LinkedDictionary());
            }
            var evtList = srcDict.getValue(evt);
            // Check if the destnation is already be in the listener list
            var overlay = true;
            if (!evtList.containsKey(dst)) {
                overlay = false;
            }
            // Use new value anyway
            evtList.setValue(dst, callback);
            return overlay;
        }
        emit(src, resCallback, evt, args) {
            var totalCnt = 0;
            if (this.dict.containsKey(src)) {
                var srcDict = this.dict.getValue(src);
                if (srcDict.containsKey(evt)) {
                    var evtList = srcDict.getValue(evt);
                    // Pack argument array
                    var lst = [src];
                    lst.push.apply(lst, args);
                    // Call the event callback function for each destination
                    evtList.forEach((dst, callback) => {
                        let result = callback.apply(dst, args);
                        if (resCallback) {
                            resCallback(result);
                        }
                        totalCnt += 1;
                    });
                }
            }
            return totalCnt;
        }
        discardEmitter(src) {
            if (this.dict.containsKey(src)) {
                this.dict.remove(src);
            }
        }
        discardListener(src, dst, evt, clean = false) {
            if (this.dict.containsKey(src)) {
                var srcDict = this.dict.getValue(src);
                if (srcDict.containsKey(evt)) {
                    var evtList = srcDict.getValue(evt);
                    if (evtList.containsKey(dst)) {
                        evtList.remove(dst);
                    }
                    if (clean === true && evtList.isEmpty()) {
                        srcDict.remove(evt);
                    }
                }
                if (clean === true && srcDict.isEmpty()) {
                    this.dict.remove(src);
                }
            }
        }
    }
    exports.EventSystem = EventSystem;
});
/* Example usage
                                        // Create //
let tween = this.tweens.add({
                targets: this.logo,
                scaleX: { value: 1.0, duration: 2000, ease: 'Back.easeInOut' },
                scaleY: { value: 1.0, duration: 2000, ease: 'Back.easeInOut' },
                yoyo: true,
                repeat: -1
                });

for (var i:number = 0; i < 4000; i++)
{
    var tmpText = this.add.text(16 + (i % 40) * 20, 16 + Math.floor(i / 40) * 20, '哇哦', {fontSize: '9px'});
}

console.log('Building event system...')
// Init event system
// 50x {1 Main -> 9 Sub}
// this.num = 5000; // <-- This still runs at 60 FPS! with the update operation 7.88ms. Although the starting process is quite long (around 2min). This system is strong!
this.num = 500;
for(var i = 0; i < this.num * 10; i++)
{
    this.objs.push(new Events.EventElement(this.eventSystem));
}

// Create relationships
for(var i = 0; i < this.num * 10; i++)
{
    if(i % 10 >= 0)
    {
        this.objs[i].listen(this.objs[Math.floor(i / 10) * 10], 'update', (mob, dt) => {return 0;});
        this.objs[i].listen(this.objs[Math.floor(i / 10) * 10], 'onDamageReceived', (mob, src, dmg, hit, crit) => {console.log(dmg);});
        this.objs[i].listen(this.objs[Math.floor(i / 10) * 10], 'onDead', (mob, lastHit) => {return 0;});
        for(var j = 0; j < this.num; j++)
        {
            if(Math.random() < 0.5)
            {
                this.objs[i].listen(this.objs[j * 10], 'onDamageReceived', (mob, src, dmg, hit, crit) => {console.log(dmg);})
            }
        }
    }

    if(i % 1000 == 0)
    {
        console.log(i / 10);
    }
}

                                        Update //
this.cnt ++;
if(this.cnt > 20)
{
    console.log(1000.0 / dt);
    this.cnt = 0;
}
this.logo_scale = time / 10000.0;
this.logo.setScale(this.logo_scale, this.logo_scale);

this.ground_rt.scale -= 0.01;
this.ground_rt.draw(this.mesh0);

for(var i = 0; i < this.num; i++)
{
    this.objs[i * 10].emit('update', this.objs[i * 10], dt);
    if(Math.random() < 0.6)
    {
        var src = Math.floor(Math.random() * this.num);
        var dmg = Math.random() * 100.0;
        this.objs[i * 10].emit('onDamageReceived', this.objs[i * 10], src, dmg, true, false);
    }
}
*/ 
/** @packageDocumentation @module DynamicLoader */
define("Engine/DynamicLoader/DynamicLoadObject", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
/**
 * @packageDocumentation
 * @module UI
 */
define("Engine/UI/DraggableScene", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class DraggableScene extends Phaser.Scene {
        constructor(config) {
            super(config);
        }
        create() {
            this.cameras.main.setViewport(this.screenX, this.screenY, this.sizeX, this.sizeY);
        }
        update(time, dt) {
        }
    }
    exports.DraggableScene = DraggableScene;
});
/** @packageDocumentation @module DynamicLoader */
define("Engine/DynamicLoader/DynamicLoaderScene", ["require", "exports", "Engine/UI/DraggableScene"], function (require, exports, DraggableScene_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class DynamicLoaderScene extends DraggableScene_1.DraggableScene {
        constructor() {
            super({ key: 'DynamicLoaderScene' });
            this.queue = [];
            this.pending = new Map();
            this.isLoading = false;
            this.pools = new Map();
            this.screenX = 0;
            this.screenY = 0;
            this.sizeX = 1024;
            this.sizeY = 640;
        }
        preload() {
            this.load.json('assetList', './assets/assetList.json');
            this.load.bitmapFont('smallPx', './assets/fonts/smallPx_C_0.png', './assets/fonts/smallPx_C.fnt');
        }
        create() {
            super.create();
            this.label = this.add.bitmapText(1014, 10, 'smallPx', 'Loading ... [100.0%]');
            this.label.setOrigin(1, 0);
            // this.label.setBackgroundColor('#000000');
            // this.label.setFontFamily('宋体, SimSun, Consolas');
            // this.label.setFontSize(12);
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
        update(time, dt) {
            this.isLoading = this.scene.scene.load.isLoading();
            if (this.isLoading) {
                this.label.setVisible(true);
                this.label.text = `Loading ... [${(this.scene.scene.load.progress / 1.0 * 100.0).toFixed(1)}]`;
            }
            else {
                // this.label.setVisible(false);
                this.label.setVisible(true);
                this.label.text = `Dynamic loader idle ...`;
            }
            if (this.queue.length > 0) {
                for (let i = 0; i < this.queue.length; i++) {
                    let item = this.queue[i];
                    if (this.assetList.hasOwnProperty(item.key)) {
                        let resource = this.assetList[item.key];
                        let target;
                        let IOObj = this.pools.get(resource.type);
                        if (IOObj.pool.exists(item.key)) {
                            // We already have this
                            item.callback(item.key, resource.type, IOObj.pool.get(item.key));
                        }
                        // We don't want to load a file many times (Phaser will throw a warning and actually it won't load multiple times for same keys, but hey we hate warnings (x))
                        else if (!this.pending.has(item.key)) {
                            console.log(`[DynamicLoader] Loading resource ${item.key} as type ${resource.type}`);
                            resource.key = item.key;
                            IOObj.load.apply(this.scene.scene.load, [resource]);
                            this.pending.set(item.key, [item]);
                        }
                        else {
                            this.pending.get(item.key).push(item);
                        }
                    }
                    else {
                        console.warn(`[DynamicLoader] Resource not found: ${item.key}, discarding`);
                    }
                }
                // Since we are done for all items
                this.queue.length = 0;
            }
            // Look for not yet loaded requests
            if (!this.isLoading && this.pending.size > 0) {
                this.scene.scene.load.start();
            }
        }
        loadSingle(req) {
            this.queue.push(req);
        }
        loadMultiple(reqs) {
            this.queue.push.apply(this.queue, reqs);
        }
        loadComplete() {
            // Since we are done for all pending requests
            let self = this;
            this.pending.forEach(function (value, key, map) {
                // Maybe we don't want to get it again for performance ...
                let resource = self.assetList[key];
                let IOObj = self.pools.get(resource.type);
                if (resource.type === "spritesheet") {
                    if (resource.animations) {
                        for (let anim_key in resource.animations) {
                            self.anims.create({ key: key + '_' + anim_key, frames: self.anims.generateFrameNumbers(key, { start: resource.animations[anim_key][0], end: resource.animations[anim_key][1], first: resource.animations[anim_key][2] }), frameRate: 8, repeat: -1 });
                        }
                    }
                }
                value.forEach(element => {
                    element.callback(key, resource.type, IOObj.pool.get(key));
                });
            });
            // Again, we are done so goodbye
            this.pending.clear();
        }
        pendLoad(requirement) {
            this.queue.push(requirement);
        }
        static getSingleton() {
            if (!DynamicLoaderScene.instance) {
                DynamicLoaderScene.instance = new DynamicLoaderScene();
                console.log("registering dynamic loader...");
            }
            return DynamicLoaderScene.instance;
        }
    }
    exports.DynamicLoaderScene = DynamicLoaderScene;
});
/** @packageDocumentation @module DynamicLoader */
define("Engine/DynamicLoader/dSprite", ["require", "exports", "Engine/DynamicLoader/DynamicLoaderScene"], function (require, exports, DynamicLoaderScene_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class dSprite extends Phaser.GameObjects.Sprite {
        constructor(scene, x, y, texture, subsTexture, frame) {
            var textureToLoad;
            var frameToLoad;
            if (!scene.textures.exists(texture)) {
                textureToLoad = texture;
                frameToLoad = frame;
                texture = subsTexture;
                frame = 0;
            }
            if (!texture) {
                texture = 'default';
            }
            super(scene, x, y, texture, frame);
            // Since we cannot put "super" to the very beginning ...
            this.resources = [];
            this.currentAnim = { 'key': '', 'startFrame': 0 };
            if (textureToLoad) {
                this.resources.push({ 'key': textureToLoad, 'metadata': {}, 'callback': this.onLoadComplete.bind(this) });
                this.textureToLoad = textureToLoad;
                this.frameToLoad = frameToLoad;
            }
            if (texture == 'default') {
                this.setVisible(false);
            }
            DynamicLoaderScene_1.DynamicLoaderScene.getSingleton().loadMultiple(this.resources);
        }
        fetchChildren() {
            return [];
        }
        onLoadComplete(key, type, fileObj) {
            if (key == this.textureToLoad) {
                this.loadComplete = true;
                this.setTexture(this.textureToLoad, this.frameToLoad);
                // Play cached animation
                if (this.currentAnim.key) {
                    this.play(this.currentAnim.key, true, this.currentAnim.startFrame);
                }
                this.setVisible(true);
            }
        }
        // override to allow play() calls when not loaded (not sure if without this it will work or not, never tried)
        play(key, ignoreIfPlaying, startFrame) {
            this.currentAnim.key = key;
            this.currentAnim.startFrame = startFrame;
            if (this.loadComplete == true) {
                super.play(key, ignoreIfPlaying, startFrame);
            }
            return this;
        }
    }
    exports.dSprite = dSprite;
});
/** @packageDocumentation @module DynamicLoader */
define("Engine/DynamicLoader/dPhysSprite", ["require", "exports", "Engine/DynamicLoader/DynamicLoaderScene"], function (require, exports, DynamicLoaderScene_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class dPhysSprite extends Phaser.Physics.Arcade.Sprite {
        /**
         *
         * @param scene scene that this sprite belongs to
         * @param x x coordinate
         * @param y y coordinate
         * @param texture texture to load
         * @param subsTexture Texture that can be used as a substitute when the real texture is loading.
         * @param frame
         */
        constructor(scene, x, y, texture, subsTexture, frame) {
            var textureToLoad;
            var frameToLoad;
            if (!scene.textures.exists(texture)) {
                textureToLoad = texture;
                frameToLoad = frame;
                texture = subsTexture;
                frame = 0;
            }
            if (!texture) {
                texture = 'default';
            }
            super(scene, x, y, texture, frame);
            this.scene = scene;
            // Since we cannot put "super" to the very beginning ...
            this.resources = [];
            this.currentAnim = { 'key': '', 'startFrame': 0 };
            if (textureToLoad) {
                this.resources.push({ 'key': textureToLoad, 'metadata': {}, 'callback': this.onLoadComplete.bind(this) });
                this.textureToLoad = textureToLoad;
                this.frameToLoad = frameToLoad;
            }
            if (texture == 'default') {
                this.setVisible(false);
            }
            DynamicLoaderScene_2.DynamicLoaderScene.getSingleton().loadMultiple(this.resources);
        }
        fetchChildren() {
            return [];
        }
        onLoadComplete(key, type, fileObj) {
            if (key == this.textureToLoad) {
                this.loadComplete = true;
                this.setTexture(this.textureToLoad, this.frameToLoad);
                // Play cached animation
                if (this.currentAnim.key) {
                    this.play(this.currentAnim.key, true, this.currentAnim.startFrame);
                }
                this.setVisible(true);
            }
        }
        // override to allow play() calls when not loaded (not sure if without this it will work or not, never tried)
        play(key, ignoreIfPlaying, startFrame) {
            this.currentAnim.key = key;
            this.currentAnim.startFrame = startFrame;
            if (this.loadComplete == true) {
                super.play(key, ignoreIfPlaying, startFrame);
            }
            return this;
        }
        getPosition() {
            return new Phaser.Math.Vector2(this.x, this.y);
        }
    }
    exports.dPhysSprite = dPhysSprite;
});
/** @packageDocumentation @module Core */
define("Engine/Core/SpellData", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Data backend for spells.
     * This is different from Spell outside databackend, this is only for spells could cast by mob (& player).
     * And this is the data "backend" for spells, they don't have any renderable and physics body.
     * When used, they create a Spell in the game world, and reset cooldown time etc.
     */
    class SpellData {
        constructor(settings) {
            // CD (sec)
            this.coolDown = settings.coolDown || 10.0;
            this.manaCost = settings.manaCost || 0;
            this.name = settings.name || "Spell";
            // Available when init
            this.coolDownRemain = 0;
            this.globalCoolDown = 0;
            // priority should be calculated on the fly
            this.priority = 0;
            this.available = true;
            this.isChannel = false;
            this.isCast = false;
            this.castTime = 0;
            this.channelTime = 0;
        }
        update(mob, dt) {
            if (this.coolDownRemain >= 0) {
                this.coolDownRemain -= dt;
            }
            this.available = this.isAvailable(mob);
            this.onUpdate(mob, dt);
        }
        onUpdate(mob, dt) { }
        onCast(mob, target) { }
        onChanneling(mob, target, dt) { }
        preCast(mob, target) {
            if (this.available && mob.mobData.canCastSpell() && mob.mobData.hasMana(this.getManaCost(mob))) {
                return true;
            }
            return false;
        }
        cast(mob, target) {
            if (this.available && mob.mobData.useMana(this.getManaCost(mob))) {
                this.coolDownRemain = this.coolDown;
                this.onCast(mob, target);
            }
        }
        forceCast(mob, target) {
            this.onCast(mob, target);
        }
        isAvailable(mob) {
            return (this.coolDownRemain <= 0);
        }
        getManaCost(mob) {
            return this.manaCost;
        }
    }
    exports.SpellData = SpellData;
});
/** @packageDocumentation @module Struct */
define("Engine/Structs/QuerySet", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class QuerySet {
        constructor(key) {
            this.queries = new Map();
            /** Used to determine are the queries dirty or not. */
            this.currentTimestamp = 0;
            if (key) {
                this.keyFn = key;
                this.data = new Map();
            }
            else {
                this.keyFn = undefined;
                this.data = new Set();
            }
        }
        /**
         * Get all data inside this set as an array.
         */
        getAll() {
            return this.data.values();
        }
        has(item) {
            if (this.keyFn) {
                return this.data.has(this.keyFn(item));
            }
            else {
                return this.data.has(item);
            }
        }
        /**
         * Add a query to the QuerySet.
         * @param name Name for this query, will be used in query() function.
         * @param filter filtering function as in Array.filter. It defines a criteia that whether an element in the query should be keeped or discarded. Returns false to filter out that element.
         * @param sort compareFunction as in Array.sort. You want to return a negative value if lhs < rhs and vice versa. The result then will come with an ascending order if you do so (smaller first).
         */
        addQuery(name, filter, sort) {
            // Note that every time you call this will force the query to be refreshed even if it is the same query
            this.queries.set(name, {
                'filter': filter,
                'sort': sort,
                'latest': -1,
                'result': [],
            });
        }
        /**
         * Add an item to this QuerySet.
         *
         * @param item The item needs to be added
         * @param failCallback Callback if the item was already in this QuerySet. This callback takes the item (inside the QuerySet) as input and returns whether the item in this QuerySet is modified or not by the callback function (e.g. buffs might want to +1 stack if already exists), and updates currentTimeStep if modification was done.
         * @returns If the item has been added (no duplicates).
         */
        addItem(item, failCallback) {
            if (!this.keyFn) {
                if (!this.data.has(item)) {
                    this.data.add(item);
                    return true;
                }
                else if (failCallback) {
                    let modified = failCallback(item); // since this condition implies item === item in the Set
                    if (modified) {
                        this.currentTimestamp += 1;
                    }
                    return false;
                }
            }
            else {
                let key = this.keyFn(item);
                if (!this.data.has(key)) {
                    this.data.set(key, item);
                    return true;
                }
                else if (failCallback) {
                    let modified = failCallback(this.data.get(key));
                    if (modified) {
                        this.currentTimestamp += 1;
                    }
                    return false;
                }
            }
        }
        removeItem(item) {
            if (!this.keyFn) {
                if (this.data.delete(item)) {
                    this.currentTimestamp += 1;
                    return true;
                }
            }
            else {
                if (this.data.delete(this.keyFn(item))) {
                    this.currentTimestamp += 1;
                    return true;
                }
            }
            return false;
        }
        /**
         * Apply a query and return the results.
         *
         * @param name The query needs to be performed.
         * @returns An array contains a sorted query results.
         */
        query(name) {
            let q = this.queries.get(name);
            if (q.latest < this.currentTimestamp) {
                q.result = this.liveQuery(q.filter, q.sort);
                q.latest = this.currentTimestamp;
            }
            return q.result;
        }
        /**
         * Perform an online query with input functions.
         * @param filter Filter function
         * @param sort Compare function
         */
        liveQuery(filter, sort) {
            let arr = Array.from(this.data.values());
            if (filter) {
                arr = arr.filter(filter);
            }
            if (sort) {
                arr.sort(sort);
            }
            return arr;
        }
    }
    exports.QuerySet = QuerySet;
});
/** @packageDocumentation @module Core */
define("Engine/Core/InventoryCore", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Inventory {
        constructor() {
        }
    }
    exports.Inventory = Inventory;
    class ItemManager {
        constructor() { }
        static getCurrent() {
            if (!ItemManager.instance) {
                return new ItemManager();
            }
            return ItemManager.instance;
        }
        static setData(itemData, itemList) {
            this.itemList = itemList;
            ItemManager.datastorage = JSON.parse(JSON.stringify(itemData)); // Deep copy
            for (let key in ItemManager.datastorage) {
                ((ItemManager.datastorage)[key]).tags = new Set(((ItemManager.datastorage)[key]).tags);
                ((ItemManager.datastorage)[key]).color = Phaser.Display.Color.HexStringToColor(((ItemManager.datastorage)[key]).color);
            }
        }
        static getData(itemID) {
            return ItemManager.datastorage[itemID];
        }
        static newItem(itemID) {
            return (new this.itemList[itemID](itemID));
        }
    }
    exports.ItemManager = ItemManager;
});
/** @packageDocumentation @module Core */
define("Engine/Core/DataBackend", ["require", "exports", "Engine/Events/EventSystem", "Engine/Core/InventoryCore"], function (require, exports, EventSystem, InventoryCore_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    EventSystem = __importStar(EventSystem);
    class DataBackend {
        constructor() {
            this.eventSystem = new EventSystem.EventSystem();
            // Save all available players (characters).
            // Character mobs (sprites) will be spawned by PlayerSpawnPoint,
            // playerList[0:playerCount-1] will be spawned. (e.g. 4 player map = the first 4 players in list)    
            this.playerList = [];
            // Array saving Inventory(bag) data.
            this.inventory = new InventoryCore_1.Inventory();
            // Used to generate ID for mobs.
            this.mobCount = -1;
        }
        static getSingleton() {
            if (!DataBackend.instance) {
                DataBackend.instance = new DataBackend();
                console.log("registering data backend...");
            }
            return DataBackend.instance;
        }
        addPlayer(player) {
            if (this.playerList.length < 8) {
                this.playerList.push(player);
            }
        }
        removePlayer(idx) {
            this.playerList.splice(idx, 1);
        }
        adjuestPlayer(idx, offset) {
            if (idx + offset >= this.playerList.length || idx + offset < 0) {
                return false;
            }
            var tmp = this.playerList[idx + offset];
            this.playerList[idx + offset] = this.playerList[idx];
            this.playerList[idx] = tmp;
            return true;
        }
        getID() {
            this.mobCount++;
            return this.mobCount;
        }
    }
    exports.DataBackend = DataBackend;
});
/** @packageDocumentation @module Core */
define("Engine/Core/GameData", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var GameData;
    (function (GameData) {
        GameData.damageType = {
            slash: "physical",
            knock: "physical",
            pierce: "physical",
            fire: "elemental",
            ice: "elemental",
            water: "elemental",
            nature: "elemental",
            wind: "elemental",
            thunder: "elemental",
            // Let them just add 0 (as themselves when calculating) for convinence
            light: "pure",
            dark: "pure",
            physical: "pure",
            elemental: "pure",
            heal: "pure",
            pure: "pure",
        };
        GameData.critMultiplier = {
            slash: 2.0,
            knock: 1.6,
            pierce: 2.5,
            fire: 2.0,
            ice: 2.0,
            water: 1.6,
            nature: 2.0,
            wind: 2.5,
            thunder: 2.5,
            light: 1.6,
            dark: 1.6,
            heal: 2.0,
        };
        let Elements;
        (function (Elements) {
            Elements["slash"] = "slash";
            Elements["knock"] = "knock";
            Elements["pierce"] = "pierce";
            Elements["fire"] = "fire";
            Elements["ice"] = "ice";
            Elements["water"] = "water";
            Elements["nature"] = "nature";
            Elements["wind"] = "wind";
            Elements["thunder"] = "thunder";
            Elements["light"] = "light";
            Elements["dark"] = "dark";
            Elements["heal"] = "heal";
        })(Elements = GameData.Elements || (GameData.Elements = {}));
        GameData.LeafTypesZERO = { fire: 0, water: 0, ice: 0, wind: 0, nature: 0, light: 0, thunder: 0, slash: 0, pierce: 0, knock: 0, dark: 0, heal: 0 };
        GameData.ElementColors = {
            slash: Phaser.Display.Color.HexStringToColor("#ffffff"),
            knock: Phaser.Display.Color.HexStringToColor("#ffffff"),
            pierce: Phaser.Display.Color.HexStringToColor("#ffffff"),
            fire: Phaser.Display.Color.HexStringToColor("#ffa342"),
            ice: Phaser.Display.Color.HexStringToColor("#72ffe2"),
            water: Phaser.Display.Color.HexStringToColor("#5b8fff"),
            nature: Phaser.Display.Color.HexStringToColor("#b1ed1a"),
            wind: Phaser.Display.Color.HexStringToColor("#aaffc8"),
            thunder: Phaser.Display.Color.HexStringToColor("#fffb21"),
            light: Phaser.Display.Color.HexStringToColor("#fffbd1"),
            dark: Phaser.Display.Color.HexStringToColor("#8d47bf"),
            miss: Phaser.Display.Color.HexStringToColor("#ff19e0"),
            heal: Phaser.Display.Color.HexStringToColor("#66f95c"),
        };
        GameData.playerMax = 8;
        GameData.playerSparse = 12;
        GameData.playerSparseInc = 2;
        GameData.useAutomove = true;
        GameData.moveThreshold = 150;
        GameData.popUpSmallFont = true;
        GameData.healTaunt = 2;
    })(GameData = exports.GameData || (exports.GameData = {}));
});
/** @packageDocumentation @module UI */
define("Engine/UI/ProgressBar", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TextAlignment;
    (function (TextAlignment) {
        TextAlignment[TextAlignment["Left"] = 0] = "Left";
        TextAlignment[TextAlignment["Center"] = 1] = "Center";
        TextAlignment[TextAlignment["Right"] = 2] = "Right";
    })(TextAlignment = exports.TextAlignment || (exports.TextAlignment = {}));
    class ProgressBar extends Phaser.GameObjects.Container {
        constructor(scene, x, y, fetchValue = undefined, width = 100, height = 10, border = 1, hasBG = true, outlineColor = 0xffffff, bgColor = 0x20604f, fillColor = 0x1b813e, showText = true, fontKey = 'smallPx_HUD', align = TextAlignment.Left, textX = 0, textY = 0, textColor = 0xffffff, getText = undefined) {
            super(scene, x, y);
            this.fetchFunc = fetchValue;
            this.getText = getText;
            this.out = new Phaser.GameObjects.Rectangle(this.scene, 0, 0, width, height, outlineColor);
            this.out.setOrigin(0);
            this.bg = new Phaser.GameObjects.Rectangle(this.scene, border, border, width - border * 2, height - border * 2, bgColor);
            this.bg.setOrigin(0);
            this.bg.setPosition(border, border);
            this.fill = new Phaser.GameObjects.Rectangle(this.scene, border, border, width - border * 2, height - border * 2, fillColor);
            this.fill.setOrigin(0);
            this.fill.setPosition(border, border);
            this.text = new Phaser.GameObjects.BitmapText(this.scene, textX, textY, fontKey, '0/0');
            this.text.setOrigin(align * 0.5, 0);
            this.text.setTint(textColor);
            if (border > 0) {
                this.add(this.out);
            }
            if (hasBG) {
                this.add(this.bg);
            }
            this.add(this.fill);
            if (showText) {
                this.add(this.text);
            }
            this.fillMaxLength = width - border * 2;
            this.maxV = 100;
            this.curV = 100;
        }
        update(time, dt) {
            if (this.fetchFunc) {
                let v = this.fetchFunc();
                this.setValue(v[0], v[1]);
            }
        }
        setValue(value, max = undefined) {
            if (max === undefined) {
                max = this.maxV;
            }
            // this.fill.width = this.fillMaxLength * (value / max);
            this.scene.tweens.add({
                targets: this.fill,
                width: this.fillMaxLength * (value / max),
                yoyo: false,
                repeat: 0,
                duration: 100,
            });
            if (this.getText) {
                this.text.text = this.getText();
            }
            else {
                this.text.text = value.toFixed(0) + "/" + max.toFixed(0);
            }
        }
    }
    exports.ProgressBar = ProgressBar;
});
/** @packageDocumentation @moduleeDocumentation @module Agent */
define("Agents/PlayerAgents", ["require", "exports", "Engine/Agents/MobAgent", "Engine/GameObjects/Mob", "Engine/Core/GameData", "Engine/Core/UnitManager", "Engine/UI/PopUpManager"], function (require, exports, MobAgent_1, Mob_1, GameData_1, UnitManager_1, PopUpManager_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class PlayerAgentBase extends MobAgent_1.MobAgent {
        constructor(parentMob) {
            super(parentMob);
        }
        setTargetPos(player, position, dt) { }
        setTargetMob(player, target, dt) { }
    }
    exports.PlayerAgentBase = PlayerAgentBase;
    class Simple extends PlayerAgentBase {
        constructor(parentMob) {
            super(parentMob);
            this.OOMwarned = false;
            // Will the player move automatically (to nearest mob) if it is free ?
            this.autoMove = GameData_1.GameData.useAutomove;
            // this.autoMove = true;
            // idleCount will count down from idleFrame if player is in idle (-1 / frame) to smooth the animation.
            // Only if idleCount = 0, the player will be "idle".
            // idleFrame is seperated for targeting Mob (which may move = need more smooth)
            // and targeting a static position (don't move and need high precision)
            // WTF? I cannot understood what have I wrote ...
            this.idleFrameMob = 10;
            this.idleFramePos = 0;
            this.idleCount = 0;
            this.speedFriction = 0.9;
            this.unitMgr = UnitManager_1.UnitManager.getCurrent();
            // TODO: smooth when hit world object ?
        }
        updateMob(player, dt) {
            this.autoMove = GameData_1.GameData.useAutomove;
            this.footPos = new Phaser.Math.Vector2(player.x, player.y);
            if (Mob_1.Mob.checkAlive(player) === true) {
                // Low Mana warning
                if (player.mobData.currentMana < (player.mobData.currentWeapon.manaCost * player.mobData.modifiers.resourceCost)) {
                    if (!this.OOMwarned) {
                        let _p = player.getTopCenter();
                        PopUpManager_1.PopUpManager.getSingleton().addText("*OOM*", _p.x, _p.y, Phaser.Display.Color.HexStringToColor("#45beff"), 1.0, 0);
                    }
                    this.OOMwarned = true;
                }
                else {
                    this.OOMwarned = false;
                }
                if (typeof this.targetPos !== "undefined") {
                    if (this.targetPos.distance(this.footPos) > 1.5) {
                        let velocity = this.targetPos.clone().subtract(this.footPos).normalize().scale(player.mobData.getMovingSpeed());
                        player.setVelocity(velocity.x, velocity.y);
                        this.isMoving = true;
                        // Reset the anim counter
                        this.idleCount = this.idleFramePos;
                    }
                    else {
                        this.targetPos = undefined;
                        this.isMoving = false;
                    }
                }
                else if (Mob_1.Mob.checkAlive(this.targetMob) == true) {
                    // we need move to goin the range of our current weapon
                    if (player.mobData.currentWeapon.isInRange(player, this.targetMob) == false) {
                        let targetPos = new Phaser.Math.Vector2(this.targetMob.x, this.targetMob.y);
                        let velocity = targetPos.subtract(this.footPos).normalize().scale(player.mobData.getMovingSpeed());
                        player.setVelocity(velocity.x, velocity.y);
                        this.isMoving = true;
                        // Reset the anim counter
                        this.idleCount = this.idleFrameMob;
                    }
                    // and then we don't move anymore.
                    else {
                        this.targetMob = undefined;
                        this.isMoving = false;
                    }
                }
                else {
                    // We lose the target.
                    this.targetPos = undefined;
                    this.targetMob = undefined;
                    this.isMoving = false;
                }
                if (this.isMoving === true) {
                    // Fix our face direction when moving
                    if (player.body.velocity.x > 0) {
                        player.flipX = true;
                    }
                    else {
                        player.flipX = false;
                    }
                    if (!(player.anims.currentAnim && player.anims.currentAnim.key == player.moveAnim)) {
                        player.play(player.moveAnim);
                    }
                }
                else {
                    // Count the frames
                    if (this.idleCount > 0) {
                        this.idleCount--;
                        // Also smooth the speed
                        player.setVelocity(player.body.velocity.x * this.speedFriction, player.body.velocity.y * this.speedFriction);
                    }
                    else {
                        player.setVelocity(0, 0);
                        if (!(player.anims.currentAnim && player.anims.currentAnim.key == player.idleAnim)) {
                            player.play(player.idleAnim);
                        }
                    }
                    if (this.autoMove === true) {
                        if (player.mobData.currentWeapon) {
                            let targetList = player.mobData.currentWeapon.grabTargets(player);
                            if (targetList.length > 0) {
                                this.setTargetMob(player, targetList[0], dt);
                            }
                        }
                    }
                }
                // Attack !
                // Todo: attack single time for multi targets, they should add same amount of weapon gauge (basically)
                if (player.doAttack(dt) === true) {
                    // console.log("canAttack");
                    let targets = player.mobData.currentWeapon.grabTargets(player); // This will ensure that targets are within the range
                    if (targets.length > 0) {
                        // for(var target of targets.values())
                        // {
                        // if(player.mobData.currentWeapon.isInRange(player, targets))
                        // {
                        if (player.mobData.currentMana > player.mobData.currentWeapon.manaCost) {
                            let result = player.mobData.currentWeapon.attack(player, targets);
                            if (result) {
                                player.mobData.currentMana -= player.mobData.currentWeapon.manaCost;
                            }
                        }
                        // }
                        // }
                    }
                }
                // Use any spells available
                for (let spell in player.mobData.spells) {
                    if (player.mobData.spells.hasOwnProperty(spell)) {
                        if (this.isMoving == false) {
                            if (player.mobData.spells[spell].available) {
                                player.mobData.cast(player, null, player.mobData.spells[spell]);
                            }
                        }
                    }
                }
            }
            // YOU DIED !
            else {
                this.isMoving = false;
                player.setVelocity(0, 0);
                player.flipX = false;
                player.play(player.deadAnim);
            }
        }
        setTargetPos(player, position) {
            // console.log(position);
            this.targetPos = position;
        }
        setTargetMob(player, mob, dt) {
            this.targetMob = mob;
        }
    }
    exports.Simple = Simple;
});
/** @packageDocumentation @module Core */
define("Engine/Core/UnitManager", ["require", "exports", "Engine/GameObjects/Mob", "Engine/Core/GameData"], function (require, exports, Mob_2, GameData_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class UnitManager {
        constructor(scene) {
            this.name = "Unit Manager";
            // TODO: change this to QuerySet ?
            this.player = new Set();
            this.enemy = new Set();
            this.selectedPlayerCount = 0;
            this.isDown = false;
            this.isDragging = false;
            this.timeCounter = 0;
            this.origin = new Phaser.Math.Vector2(0, 0);
            this.rectOrigin = new Phaser.Math.Vector2(0, 0);
            this.rectTarget = new Phaser.Math.Vector2(0, 0);
            this.selectingRect = new Phaser.Geom.Rectangle(0, 0, 0, 0);
            scene.input.on('pointerdown', (pt) => this.pointerDown(pt));
            scene.input.on('pointerup', (pt) => this.pointerUp(pt));
            // scene.input.on('pointerleave', (pt:any) => this.pointerLeave(pt));
            scene.input.on('pointermove', (pt) => this.pointerMove(pt));
            this.sparseKey = scene.input.keyboard.addKey('F');
            this.rotateKey = scene.input.keyboard.addKey('R');
            this.playerRotation = 0;
            //Add a rectangle to the scene
            this.renderContainer = scene.add.container(0, 0);
            this.renderRect = new Phaser.GameObjects.Rectangle(scene, 0, 0, 0, 0, 0x90D7EC, 0.2);
            this.renderContainer.add(this.renderRect);
            // this.renderContainer.add(new Phaser.GameObjects.Line(scene, 0, 200, 0, 0, 1000, 0, 0xFF0000));
            this.renderContainer.depth = 100000;
            this.playerGroup = scene.physics.add.group();
            this.enemyGroup = scene.physics.add.group();
            this.allyGroup = scene.physics.add.group();
            this.thirdGroup = scene.physics.add.group();
        }
        static resetScene(scene) {
            if (UnitManager.instance) {
                delete UnitManager.instance;
            }
            UnitManager.instance = new UnitManager(scene);
        }
        static getCurrent() {
            if (!UnitManager.instance) {
                return undefined;
            }
            return UnitManager.instance;
        }
        update(dt) {
            if (this.isDragging == true) {
                this.renderRect.setVisible(true);
                this.renderRect.setPosition(this.selectingRect.x, this.selectingRect.y);
                this.renderRect.setSize(this.selectingRect.width, this.selectingRect.height);
                var minX = Math.min(this.rectOrigin.x, this.rectTarget.x);
                var minY = Math.min(this.rectOrigin.y, this.rectTarget.y);
                var maxX = Math.max(this.rectOrigin.x, this.rectTarget.x);
                var maxY = Math.max(this.rectOrigin.y, this.rectTarget.y);
                var playerCount = 0;
                // console.log(this.player);
                for (let player of this.player) {
                    if (Mob_2.Mob.checkAlive(player)) {
                        var pt = new Phaser.Math.Vector2(player.x, player.y);
                        // var frame = game.UI.unitFrameSlots.slots[playerCount];
                        // TODO: use box intersection instead of containsPoint
                        if (this.selectingRect.contains(pt.x, pt.y)) {
                            player.mobData.inControl = true;
                        }
                        // else if(this.selectingRect.containsPoint(frame.pos.x - minX, frame.pos.y - minY))
                        // {
                        //     player.data.inControl = true;
                        // }
                        else {
                            player.mobData.inControl = false;
                        }
                    }
                    playerCount++;
                }
            }
            else {
                this.renderRect.setVisible(false);
            }
        }
        isMouseLeft(pointer) {
            if ("which" in pointer.event) // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
                return pointer.event.which == 1;
            else if ("button" in pointer.event) // IE, Opera 
                return pointer.event.button == 0;
        }
        isMouseMiddle(pointer) {
            if ("which" in pointer.event) // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
                return pointer.event.which == 2;
            else if ("button" in pointer.event) // IE, Opera 
                return pointer.event.button == 1;
        }
        isMouseRight(pointer) {
            if ("which" in pointer.event) // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
                return pointer.event.which == 3;
            else if ("button" in pointer.event) // IE, Opera 
                return pointer.event.button == 2;
        }
        pointerDown(pointer) {
            // console.log(pointer);
            pointer.event.preventDefault();
            // Drag a rect
            if (this.isMouseLeft(pointer)) {
                this.isDown = true;
                this.isDragging = true;
                // console.log("Drag start");
                this.rectOrigin.set(pointer.x, pointer.y);
                this.rectTarget.set(pointer.x, pointer.y);
                this.selectingRect.setPosition(pointer.x, pointer.y);
                this.selectingRect.setSize(0, 0);
                return true;
            }
            // Move player
            if (this.isMouseRight(pointer)) {
                this.selectedPlayerCount = 0;
                for (var player of this.player) {
                    if (player.mobData.inControl == true) {
                        this.selectedPlayerCount += 1;
                    }
                }
                this.origin.set(pointer.x, pointer.y);
                var playerNum = 0;
                var playerSparse = GameData_2.GameData.playerSparse + GameData_2.GameData.playerSparseInc * this.selectedPlayerCount;
                if (this.sparseKey.isDown) {
                    playerSparse = 60;
                }
                if (this.rotateKey.isDown) {
                    this.playerRotation += 2;
                }
                if (this.selectedPlayerCount == 1) {
                    playerSparse = 0;
                }
                for (var player of this.player) {
                    if (player.mobData.inControl == true) {
                        (player.agent).setTargetPos(player, this.origin.clone().add((new Phaser.Math.Vector2(0, 0)).setToPolar(((playerNum + this.playerRotation) / this.selectedPlayerCount * 2 * Math.PI), playerSparse)));
                        playerNum++;
                    }
                }
                return false;
            }
        }
        pointerMove(pointer) {
            // this.timeCounter += me.timer.lastUpdate;
            if (this.isDragging) {
                this.rectTarget.set(pointer.x, pointer.y);
                // this.selectingRect.setPosition(this.rectOrigin.x, this.rectOrigin.y);
                this.selectingRect.setSize(this.rectTarget.x - this.rectOrigin.x, this.rectTarget.y - this.rectOrigin.y);
            }
        }
        pointerUp(pointer) {
            this.isDown = false;
            if (this.isMouseLeft(pointer)) {
                this.isDragging = false;
                // console.log("Drag end");
            }
            return true;
        }
        pointerLeave(pointer) {
            // console.log("leave");
            this.isDown = false;
            this.isDragging = false;
            return true;
        }
        addPlayer(player) {
            console.log("Added player:");
            console.log(player);
            this.player.add(player);
            this.playerGroup.add(player);
        }
        addEnemy(enemy) {
            this.enemy.add(enemy);
            this.enemyGroup.add(enemy);
        }
        removePlayer(player) {
            this.player.delete(player);
        }
        removeEnemy(enemy) {
            this.enemy.delete(enemy);
        }
        _getUnitList(targetSet, sortMethod, availableTest, containsDead = false) {
            var result = [];
            for (var unit of targetSet) {
                // TODO: how to do with raise skills ?
                if ((containsDead || Mob_2.Mob.checkAlive(unit)) && availableTest(unit) === true) {
                    result.push(unit);
                }
            }
            result.sort(sortMethod);
            return result;
        }
        // Get a list of units, e.g. attack target list etc.
        // You will get a list that:
        // * The list was sorted using sortMethod,
        // * The list will contain units only if they have passed availableTest. (availableTest(unit) returns true)
        getPlayerList(sortMethod, availableTest, containsDead = false) {
            sortMethod = sortMethod || function (a, b) { return 0; };
            availableTest = availableTest || function (a) { return true; };
            return this._getUnitList(this.player, sortMethod, availableTest, containsDead);
        }
        getPlayerListWithDead(sortMethod, availableTest) {
            sortMethod = sortMethod || function (a, b) { return 0; };
            availableTest = availableTest || function (a) { return true; };
            return this._getUnitList(this.player, sortMethod, availableTest, true);
        }
        getEnemyList(sortMethod, availableTest) {
            sortMethod = sortMethod || function (a, b) { return 0; };
            availableTest = availableTest || function (a) { return true; };
            return this._getUnitList(this.enemy, sortMethod, availableTest);
        }
        getUnitList(sortMethod, availableTest, isPlayer = false) {
            if (isPlayer === true) {
                return this._getUnitList(this.player, sortMethod, availableTest);
            }
            else {
                return this._getUnitList(this.enemy, sortMethod, availableTest);
            }
        }
        getUnitListAll(sortMethod, availableTest) {
            sortMethod = sortMethod || function (a, b) { return 0; };
            availableTest = availableTest || function (a) { return true; };
            return this._getUnitList(this.enemy, sortMethod, availableTest).concat(this._getUnitList(this.player, sortMethod, availableTest)).sort(sortMethod);
        }
        // Shorthand to get k-nearest (as a parameter "count") player around a position using above API.
        getNearest(position, isPlayer = false, count = 1) {
            var result = this.getUnitList(UnitManager.sortNearest(position), UnitManager.NOOP, isPlayer);
            return result.slice(0, Math.min(count, result.length));
        }
        getNearestUnitAll(position, count = 1) {
            var result = this.getUnitListAll(UnitManager.sortNearest(position), UnitManager.NOOP);
            return result.slice(0, Math.min(count, result.length));
        }
        static sortNearest(position) {
            return (a, b) => {
                return (new Phaser.Math.Vector2(a.x, a.y).distance(position)
                    - new Phaser.Math.Vector2(b.x, b.y).distance(position));
            };
        }
    }
    exports.UnitManager = UnitManager;
    UnitManager.sortByHealth = (a, b) => {
        return a.mobData.currentHealth - b.mobData.currentHealth;
    };
    UnitManager.sortByHealthPercentage = (a, b) => {
        return (((a.mobData.currentHealth / a.mobData.maxHealth) - 0.4 * (a.mobData.healPriority ? 1.0 : 0.0)) -
            ((b.mobData.currentHealth / b.mobData.maxHealth) - 0.4 * (b.mobData.healPriority ? 1.0 : 0.0)));
    };
    UnitManager.IDENTITY = (a, b) => 0;
    UnitManager.NOOP = (a) => true;
});
/**
 * @packageDocumentation
 * @module UI
 */
define("Engine/UI/UnitFrame", ["require", "exports", "Engine/UI/ProgressBar", "Engine/DynamicLoader/dSprite"], function (require, exports, ProgressBar_1, dSprite_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class UnitFrame extends Phaser.GameObjects.Container {
        constructor(scene, x, y, target) {
            super(scene, x, y);
            this.targetMob = target;
            // this.add(new Phaser.GameObjects.BitmapText(this.scene, 0, 0, 'simsun_o', target.mobData.name + ": 魔法值"));
            // this.add(new Phaser.GameObjects.BitmapText(this.scene, 0, 3, 'smallPx', "Mana of testGirl0"));
            // Name
            let txt = new Phaser.GameObjects.BitmapText(this.scene, 0, 9, 'smallPx', target.mobData.name);
            txt.setOrigin(0, 1);
            this.add(txt);
            // Avatar
            let avatar = new Phaser.GameObjects.Image(this.scene, 0, 10, 'elf', 0);
            avatar.setOrigin(1, 0);
            this.add(avatar);
            // Weapon, TODO: switch weapons on click
            this.wpCurrent = new dSprite_1.dSprite(this.scene, 75, 11, 'img_weapon_icon_test');
            this.wpCurrent.setOrigin(0);
            this.wpCurrent.setInteractive();
            this.add(this.wpCurrent);
            this.wpAlter = new dSprite_1.dSprite(this.scene, 105, 11, 'img_weapon_icon_test');
            this.wpAlter.setOrigin(0);
            this.wpAlter.setTint(0x888888);
            this.wpAlter.setInteractive();
            this.add(this.wpAlter);
            // Health
            this.add(new ProgressBar_1.ProgressBar(this.scene, 0, 10, () => {
                return [target.mobData.currentHealth, target.mobData.maxHealth];
            }, 70, 16, 1, true, 0x222222, 0x20604F, 0x1B813E, true, 'smallPx_HUD', ProgressBar_1.TextAlignment.Left, 5, 6, 0xffffff));
            // Mana
            this.add(new ProgressBar_1.ProgressBar(this.scene, 0, 25, () => {
                return [target.mobData.currentMana, target.mobData.maxMana];
            }, 70, 11, 1, true, 0x222222, 0x20604F, 0x33A6B8, true, 'smallPx_HUD', ProgressBar_1.TextAlignment.Left, 5, 2, 0xffffff));
            // Current Spell
            this.add(new ProgressBar_1.ProgressBar(this.scene, 10, 35, () => {
                return [0.3, 1.8];
            }, 60, 4, 1, false, 0x222222, 0x20604F, 0xffe8af, true, 'smallPx', ProgressBar_1.TextAlignment.Right, 58, 7, 0xffffff, () => "Wind Blade"));
        }
        update(time, dt) {
            this.each((obj) => { obj.update(); });
        }
    }
    exports.UnitFrame = UnitFrame;
});
/**
 * @packageDocumentation
 * @module UI
 */
define("Engine/UI/UIScene", ["require", "exports", "Engine/UI/PopUpManager", "Engine/UI/UnitFrame", "Engine/Core/UnitManager"], function (require, exports, PopUpManager_2, UnitFrame_1, UnitManager_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class UIScene extends Phaser.Scene {
        constructor() {
            super(...arguments);
            this.loaded = false;
            this.unitFrames = [];
        }
        static getSingleton() {
            if (!UIScene.instance) {
                UIScene.instance = new UIScene({ key: 'UIScene' });
                console.log("registering UI Scene...");
            }
            return UIScene.instance;
        }
        preload() {
            this.load.bitmapFont('smallPx', './assets/fonts/smallPx_C_0.png', './assets/fonts/smallPx_C.fnt');
            this.load.bitmapFont('smallPx_HUD', './assets/fonts/smallPx_HUD_0.png', './assets/fonts/smallPx_HUD.fnt');
            this.load.bitmapFont('mediumPx', './assets/fonts/mediumPx_04b03_0.png', './assets/fonts/mediumPx_04b03.fnt');
            this.load.bitmapFont('simsun', './assets/fonts/simsun_0.png', './assets/fonts/simsun.fnt');
            this.load.bitmapFont('simsun_o', './assets/fonts/simsun_outlined_0.png', './assets/fonts/simsun_outlined.fnt');
            this.add.existing(PopUpManager_2.PopUpManager.register(this));
        }
        create() {
            this.loaded = true;
            this.initUnitFrames();
        }
        clearUnitFrame() {
            for (let u of this.unitFrames) {
                u.destroy();
            }
            this.unitFrames = [];
        }
        resetPlayers() {
            this.clearUnitFrame();
            this.playerCache = Array.from(UnitManager_2.UnitManager.getCurrent().player.values());
            if (this.loaded) {
                this.initUnitFrames();
            }
        }
        initUnitFrames() {
            if (this.playerCache === undefined) {
                return;
            }
            let cnt = 0;
            for (let player of this.playerCache) {
                let tmp = new UnitFrame_1.UnitFrame(this, 35 + (cnt % 4) * 180, 524 + Math.floor(cnt / 4) * 70, player);
                // let tmp = new UnitFrame(this, 20, 20 + cnt * 70, player);
                this.add.existing(tmp);
                this.unitFrames.push(tmp);
                cnt += 1;
            }
        }
        update(time, dt) {
            this.children.each((item) => { item.update(time / 1000.0, dt / 1000.0); });
        }
    }
    exports.UIScene = UIScene;
});
/**
 * @packageDocumentation
 * @module UI
 */
define("Engine/UI/PopUpManager", ["require", "exports", "Engine/Core/GameData"], function (require, exports, GameData_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // import * as Phaser from 'phaser'
    class PopupText extends Phaser.GameObjects.BitmapText {
        constructor(scene, x, y, text, color, time = 1.0, velX = -64, velY = -256, accX = 0.0, accY = 512.0) {
            super(scene, x, y, GameData_3.GameData.popUpSmallFont ? 'smallPx' : 'mediumPx', text);
            this.time = time * 1.5;
            this.velX = velX;
            this.velY = velY;
            this.accX = accX;
            this.accY = accY;
            this.dead = false;
            this.setTint(color);
            this.setLetterSpacing(1);
            this.setOrigin(0.5, 0.0);
        }
        update(dt) {
            // perhaps we don't need this?
            super.update();
            this.time -= dt;
            if (this.time < 0) {
                this.dead = true;
                return;
            }
            this.x += this.velX * dt;
            this.y += this.velY * dt;
            this.velX += this.accX * dt;
            this.velY += this.accY * dt;
            this.alpha = this.time;
        }
    }
    exports.PopupText = PopupText;
    class PopUpManager extends Phaser.GameObjects.Container {
        constructor(scene, x, y) {
            super(scene, x, y);
            this.loaded = false;
            this.textList = new Set();
            this.loaded = true;
        }
        static getSingleton() {
            if (!PopUpManager.instance) {
                return undefined;
                console.log("registering Popup Manager...");
            }
            return PopUpManager.instance;
        }
        static register(scene, x = 0, y = 0) {
            PopUpManager.instance = new PopUpManager(scene, x, y);
            return PopUpManager.instance;
        }
        addText(text, posX = 100, posY = 100, color = new Phaser.Display.Color(255, 255, 255, 255), time = 1.0, velX = -64, velY = -256, // jumping speed
        accX = 0.0, // gravity
        accY = 512) {
            if (this.loaded) {
                let txt = new PopupText(this.scene, posX, posY, text, color.color, time, velX, velY, accX, accY);
                this.add(txt);
            }
        }
        preUpdate(time, dt) {
            this.each((item) => {
                item.update(dt / 1000.0);
                if (item instanceof PopupText) {
                    if (item.dead) {
                        item.destroy();
                    }
                }
            });
        }
    }
    exports.PopUpManager = PopUpManager;
});
/** @packageDocumentation @module Core */
define("Engine/Core/Buff", ["require", "exports", "Engine/Core/MobListener", "Engine/UI/PopUpManager"], function (require, exports, MobListener_1, PopUpManager_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Buff extends MobListener_1.MobListener {
        constructor(settings) {
            super();
            //Name of the buff
            this.name = settings.name || "buff";
            //This listener is a buff
            this.type = MobListener_1.MobListenerType.Buff;
            //Does this buff counts time?
            this.countTime = ((settings.countTime === undefined) ? true : settings.countTime);
            //time in seconds, indicates the durtion of buff
            this.timeMax = settings.time || 1.0;
            //time in seconds, will automatically reduce by time
            this.timeRemain = settings.time || this.timeMax;
            //Is the buff over? (should be removed from buff list)
            this.isOver = false;
            //stacks of the buff (if any)
            this.stacks = settings.stacks || 1;
            this.stackable = settings.stackable || false;
            this.maxStack = settings.maxStack || 3;
            //cellIndex of this buff in the buffIcons image, might be shown under boss lifebar / player lifebar
            this.iconId = settings.iconId || 0;
            //the color used for UI rendering
            this.color = settings.color || Phaser.Display.Color.HexStringToColor('#56CDEF');
            //when the buff was attached or triggered, a small text will pop up like damages e.g. "SLOWED!"
            this.popupName = settings.popupName || "buff";
            //Color for the popup text. default is this.color.
            this.popupColor = settings.popupColor || this.color;
            //Where does this buff come from?
            this.source = settings.source || undefined;
            this.toolTip = { title: "Buff", text: "lol." };
        }
        popUp(mob) {
            let popUpPos = mob.getTopCenter();
            PopUpManager_3.PopUpManager.getSingleton().addText(this.popupName, popUpPos.x, popUpPos.y, this.popupColor, 1.0, 0, -64, 0, 64);
        }
        update(self, dt) {
            super.update(self, dt);
            if (this.countTime == true) {
                this.timeRemain -= dt;
                if (this.timeRemain < 0) {
                    this.isOver = true;
                }
            }
        }
        showToolTip() {
            // TODO
        }
        /**
         * Addes one stack of itself.
         */
        addStack() {
        }
    }
    exports.Buff = Buff;
});
/** @packageDocumentation @module Core */
define("Engine/Core/BattleMonitor", ["require", "exports", "Engine/Core/GameData", "Engine/Core/UnitManager"], function (require, exports, GameData_4, UnitManager_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class BattleMonitor {
        constructor() {
            this.time = 0;
            this.damageDict = {};
            this.healDict = {};
        }
        static getSingleton() {
            if (!BattleMonitor.instance) {
                BattleMonitor.instance = new BattleMonitor();
            }
            return BattleMonitor.instance;
        }
        update(dt) {
            // If there are any enemy on the field
            if (UnitManager_3.UnitManager.getCurrent().enemy.size > 0) {
                this.time += dt;
            }
        }
        clear(dt) {
            this.time = 0;
            this.damageDict = {};
            this.healDict = {};
        }
        add(dmg) {
            if (dmg.source) {
                let source = dmg.source;
                let value = dmg.value;
                let spell = undefined;
                if (dmg.spell) {
                    spell = dmg.spell.name;
                }
                if (source.isPlayer === true) {
                    if (dmg.type !== GameData_4.GameData.Elements.heal) {
                        // Create a dict if it does not exist
                        this.damageDict[source.name] = this.damageDict[source.name] ||
                            {
                                total: 0,
                                normal: 0,
                                crit: 0,
                                targetDict: {},
                                typeDict: {},
                                spellDict: {},
                                player: source,
                            };
                        //Category: spell
                        if (typeof spell !== "undefined") {
                            this.damageDict[source.name].spellDict[spell] = this.damageDict[source.name].spellDict[spell] || { total: 0, normal: 0, crit: 0 };
                        }
                        this.damageDict[source.name].total += value;
                        if (spell) {
                            this.damageDict[source.name].spellDict[spell].total += value;
                        }
                        if (dmg.isCrit === true) {
                            this.damageDict[source.name].crit += value;
                            if (spell) {
                                this.damageDict[source.name].spellDict[spell].crit += value;
                            }
                        }
                        else {
                            this.damageDict[source.name].normal += value;
                            if (spell) {
                                this.damageDict[source.name].spellDict[spell].normal += value;
                            }
                        }
                        //TODO: Category - target, type
                    }
                    else {
                        // Calculate the propotion of overheal
                        let overhealPropotion = dmg.overdeal / dmg.value;
                        // Create a dict if it does not exist
                        this.healDict[source.name] = this.healDict[source.name] ||
                            {
                                total: 0,
                                real: 0,
                                over: 0,
                                // TODO: crit
                                targetDict: {},
                                spellDict: {},
                                player: source,
                            };
                        let realHeal = value;
                        let overHeal = dmg.overdeal;
                        this.healDict[source.name].total += realHeal + overHeal;
                        this.healDict[source.name].real += realHeal;
                        this.healDict[source.name].over += overHeal;
                        //Category: spell
                        if (typeof spell !== "undefined") {
                            this.healDict[source.name].spellDict[spell] = this.healDict[source.name].spellDict[spell] || { total: 0, real: 0, over: 0 };
                            this.healDict[source.name].spellDict[spell].total += realHeal + overHeal;
                            this.healDict[source.name].spellDict[spell].real += realHeal;
                            this.healDict[source.name].spellDict[spell].over += overHeal;
                        }
                    }
                }
            }
        }
        getDamageList() {
            var dmgList = [];
            for (let player in this.damageDict) {
                dmgList.push({
                    number: this.damageDict[player].total,
                    length: this.damageDict[player].total,
                    slices: [
                        this.damageDict[player].normal,
                        this.damageDict[player].crit
                    ],
                    colors: [
                        "#ffc477",
                        "#ff7777"
                    ],
                    player: this.damageDict[player].player
                });
            }
            dmgList.sort((a, b) => { return b.number - a.number; });
            return dmgList;
        }
        getDPSList() {
            var dmgList = this.getDamageList();
            for (let element in dmgList) {
                dmgList[element].number = Math.round(dmgList[element].number / this.time);
            }
            return dmgList;
        }
        getHealList() {
            var healList = [];
            for (let player in this.healDict) {
                healList.push({
                    number: this.healDict[player].real,
                    length: this.healDict[player].total,
                    slices: [
                        this.healDict[player].real,
                        this.healDict[player].over
                    ],
                    colors: [
                        "#00ff00",
                        "#ff0000"
                    ],
                    player: this.healDict[player].player
                });
            }
            healList.sort((a, b) => { return b.number - a.number; });
            return healList;
        }
        getHPSList() {
            var healList = this.getHealList();
            for (let element in healList) {
                healList[element].number = Math.round(healList[element].number / this.time);
            }
            return healList;
        }
    }
    exports.BattleMonitor = BattleMonitor;
});
/** @packageDocumentation @module Core */
define("Engine/Core/MobData", ["require", "exports", "Engine/Events/EventSystem", "Engine/Core/EquipmentCore", "Engine/Structs/QuerySet", "Engine/Core/MobListener", "Engine/Core/DataBackend", "Engine/Core/Buff", "Engine/Core/GameData", "Engine/Core/BattleMonitor"], function (require, exports, EventSystem, EquipmentCore_1, QuerySet_1, MobListener_2, DataBackend_1, Buff_1, GameData_5, BattleMonitor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    EventSystem = __importStar(EventSystem);
    /*
    Idle (canCastSpell):
        globalCDRemain <= 0
        inCasting == false
        inChanneling == false
    
    Cast a spell:
        mob.cast(spell):
            * start GCD timer
            if(spell.isCast)
                inCasting = true
                castTime = xxx
                castRemain = castTime
                currentSpell = spell
            else
                mob.finishCast(spell)
        ->
        mob.update():
            if(castRemain >= 0) castRemain -= dt
        ->
        mob.finishCast(currentSpell):
            if(spell.isChannel)
                inCasting = false
                inChanneling = true
                channelTime = xxx
                channelTimeFactor = xxx
                channelRemain = channelTime
            else
                inCasting = false
    
            spell.cast(mob, target)
        ->
        mob.update():
            if(channelRemain >= 0) channelRemain -= dt
            spell.onChanneling(mob, target, dt * channelTimeFactor)
        ->
        inChanneling = false
    */
    class MobData extends EventSystem.EventElement {
        constructor(settings) {
            super(DataBackend_1.DataBackend.getSingleton().eventSystem);
            this.inControl = false;
            this.name = settings.name || "noname";
            // this.position = {x: this.body.left, y: this.body.top};
            this.image = settings.image || "unknown";
            // Stats
            this.race = settings.race || "unknown";
            this.class = settings.class || "unknown";
            this.level = settings.level || 1;
            this.availableBP = settings.availableBP || 0;
            this.availableSP = settings.availableSP || 0;
            this.baseStats = {
                vit: settings.vit || 1,
                str: settings.str || 1,
                dex: settings.dex || 1,
                tec: settings.tec || 1,
                int: settings.int || 1,
                mag: settings.mag || 1,
            };
            // Used to store the player base stats before any modifiers (but after lvlup, talent selections etc.)
            this.baseStatsFundemental = Object.assign({}, this.baseStats);
            // health related
            this.maxHealth = settings.health || 100;
            this.currentHealth = this.maxHealth - settings.damage || settings.health || 100;
            this.alive = true;
            this.maxMana = settings.mana || 100;
            this.currentMana = this.maxMana || settings.mana || 100;
            this.manaRegen = settings.manaRegen || 5;
            // speed related (1.0 means 100% (NOT a value but a ratio))
            this.modifiers = {
                speed: settings.speed || 1.0,
                movingSpeed: settings.movingSpeed || 1.0,
                attackSpeed: settings.attackSpeed || 1.0,
                spellSpeed: settings.spellSpeed || 1.0,
                resourceCost: settings.resourceCost || 1.0,
            };
            this.baseSpeed = settings.baseSpeed || 80.0;
            this.baseAttackSpeed = settings.baseAttackSpeed || 20.0;
            this.isMoving = false;
            this.globalCDRemain = 0;
            this.inCasting = false;
            this.castTime = 0;
            this.castRemain = 0;
            this.inChanneling = false;
            this.channelTime = 0;
            this.channelTimeFactor = 1.0;
            this.channelRemain = 0;
            this.currentSpell = undefined;
            this.currentSpellTarget = undefined;
            // Stats (cannot increase directly)
            this.battleStats = {
                resist: {
                    physical: 0,
                    elemental: 0,
                    pure: 0,
                    slash: 0,
                    knock: 0,
                    pierce: 0,
                    fire: 0,
                    ice: 0,
                    water: 0,
                    nature: 0,
                    wind: 0,
                    thunder: 0,
                    light: 0,
                    dark: 0,
                    heal: 0,
                },
                attackPower: {
                    physical: 0,
                    elemental: 0,
                    pure: 0,
                    slash: 0,
                    knock: 0,
                    pierce: 0,
                    fire: 0,
                    ice: 0,
                    water: 0,
                    nature: 0,
                    wind: 0,
                    thunder: 0,
                    light: 0,
                    dark: 0,
                    heal: 0,
                },
                // Write a helper to get hit / avoid / crit percentage from current level and parameters ?
                // Percentage
                // Those are basic about overall hit accuracy & avoid probabilities, critical hits.
                // Advanced actions (avoid specific spell) should be calculated inside onReceiveDamage() etc.
                // Same for shields, healing absorbs (Heal Pause ====...===...==...=>! SS: [ABSORB]!!! ...*&@^#), etc.
                hitAcc: 100,
                avoid: 0,
                // Percentage
                crit: 0,
                antiCrit: 0,
                // Parry for shield should calculate inside the shield itself when onReceiveDamage().
                attackRange: 0,
                extraRange: 0,
            };
            // Equipment related
            this.weaponLeft = settings.weaponLeft; // || new game.weapon(settings);
            this.weaponRight = settings.weaponRight; // || new game.weapon(settings);
            this.armor = settings.armor; // || new game.Armor(settings);
            this.accessory = settings.accessory; // || new game.Accessory(settings);
            if (this.weaponLeft) {
                this.weaponLeft.equipper = this;
            }
            if (this.weaponRight) {
                this.weaponRight.equipper = this;
            }
            if (this.armor) {
                this.armor.equipper = this;
            }
            if (this.accessory) {
                this.accessory.equipper = this;
            }
            this.currentWeapon = this.weaponLeft;
            this.anotherWeapon = this.weaponRight;
            // Should we switch the weapon now ?
            this.shouldSwitchWeapon = false;
            // Is this mob a player?
            this.isPlayer = settings.isPlayer || false;
            // How much taunt will this mob generate?
            this.tauntMul = settings.tauntMul || 1.0;
            this.beingAttack = 0;
            this.healPriority = false;
            // A Specific identify name only for this mob
            this.ID = DataBackend_1.DataBackend.getSingleton().getID();
            // ref for MobListeners (buffs, agent, weapons, armor, ...)
            /** test */
            this.listeners = new QuerySet_1.QuerySet();
            this.listeners.addQuery('buff', (arg) => (arg.type == MobListener_2.MobListenerType.Buff), undefined);
            this.listeners.addQuery('priority', undefined, (l, r) => (r.priority - l.priority));
            // buff list, only for rendering UI
            // buffs are actually plain mob listeners
            // maybe they have something different (x)
            // this.buffList = new Set();
            // spell list, only for spells with cooldowns.
            this.spells = {};
            // Which class should be used when realize this mob ?
            this.mobConstructor = settings.mobConstructor; // || game.Mobs.TestMob;
            // I finally added this ... (x)
            this.parentMob = undefined;
        }
        switchWeapon() {
            this.shouldSwitchWeapon = true;
        }
        getPercentage(parameter) {
            // TODO: convert parameter to percentage from level
            return parameter;
        }
        getMovingSpeed() {
            return this.modifiers.speed * this.modifiers.movingSpeed * this.baseSpeed;
        }
        getAttackSpeed() {
            if (this.currentWeapon) {
                return (1 / this.modifiers.speed) * (1 / this.modifiers.attackSpeed) * this.currentWeapon.baseAttackSpeed;
            }
            else {
                return (1 / this.modifiers.speed) * (1 / this.modifiers.attackSpeed);
            }
        }
        getEquipableTags(equipmentType) {
            if (this.parentMob) {
                return this.parentMob.getEquipableTags(equipmentType);
            }
            return [EquipmentCore_1.EquipmentTag.Equipment];
        }
        // To be continued - dataBackend.js:301
        updateMobBackend(mob, dt) {
            // Register parent mob
            if (typeof this.parentMob == undefined) {
                this.parentMob = mob;
            }
            // Switch weapon ?
            if (this.shouldSwitchWeapon === true) {
                this.shouldSwitchWeapon = false;
                if (typeof this.anotherWeapon !== "undefined") {
                    var tmp = this.currentWeapon;
                    this.currentWeapon = this.anotherWeapon;
                    this.anotherWeapon = tmp;
                }
                this.removeListener(this.anotherWeapon);
                this.addListener(this.currentWeapon);
                // I switched my weapon !!!
                this.updateListeners(this, 'switchWeapon', this, this.currentWeapon);
            }
            // Update all listeners
            this.updateListeners(this, 'update', this, dt);
            for (let listener of this.listeners.getAll()) {
                if (listener.isOver == true) {
                    //this buff is over. delete it from the list.
                    // this.buffList.delete(buff);
                    this.removeListener(listener);
                }
                else {
                    listener.update(this, dt);
                }
            }
            // Mana Regen
            this.currentMana += dt * this.manaRegen;
            // if (typeof this.currentWeapon !== "undefined")
            // {
            // }
            if (this.currentMana > this.maxMana) {
                this.currentMana = this.maxMana;
            }
            // Spell Casting
            if (this.globalCDRemain > 0) {
                this.globalCDRemain -= dt;
            }
            else {
                this.globalCDRemain = 0;
            }
            if (this.isMoving == true) {
                // TODO: check if this can cast during moving
                this.inCasting = false;
                this.inChanneling = false;
                this.castRemain = 0;
                this.channelRemain = 0;
            }
            if (this.inCasting == true) {
                if (this.castRemain > 0) {
                    this.castRemain -= dt;
                }
                else {
                    this.inCasting = false;
                    this.finishCast(mob, this.currentSpellTarget, this.currentSpell);
                }
            }
            if (this.inChanneling == true) {
                if (this.channelRemain > 0) {
                    this.channelRemain -= dt;
                    this.currentSpell.onChanneling(mob, this.currentSpellTarget, dt * this.channelTimeFactor);
                }
                else {
                    this.inChanneling = false;
                }
            }
            // Now we only calc stats when needed to save computational resource, controlled by the event system.
            // calculate Stats
            // TODO: seperate calculation to 2 phase, base and battle stats.
            // this.calcStats(mob);
            // update spells
            for (let spell in this.spells) {
                if (this.spells.hasOwnProperty(spell)) {
                    this.spells[spell].update(mob, dt);
                }
            }
        }
        addBuff(buff) {
            this.addListener(buff, buff.source, (arg) => {
                if (arg instanceof Buff_1.Buff) {
                    if (arg.stackable === true) {
                        arg.addStack();
                        // arg.emit('added', undefined, this, arg.source);
                    }
                }
                return false;
            });
        }
        hasBuff(buff) {
            return this.listeners.has(buff);
        }
        findBuffIncludesName(buffname) {
            return this.listeners.liveQuery((arg) => (arg instanceof Buff_1.Buff && arg.name.includes(buffname)), undefined);
        }
        addListener(listener, source, callback) {
            if (this.listeners.addItem(listener, callback)) {
                this.listen(listener, 'statChange', (arg) => this.onStatChange(arg));
                // listener.emit('add', undefined, this, source);
                listener._beAdded(this, source);
            }
        }
        removeListener(listener, source) {
            if (!listener) {
                return;
            }
            // TODO: Who removed this listener ?
            if (this.listeners.removeItem(listener)) {
                // listener.emit('remove', undefined, this, source);
                listener._beRemoved(this, source);
                this.unlistenAll(listener);
            }
        }
        cast(mob, target, spell) {
            // Check if ready to cast
            if (mob.mobData.canCastSpell() == false || spell.preCast(mob, target) == false) {
                return;
            }
            // TODO: Check mana cost, cooldown etc.
            // May combined into readyToCast().
            // Start GCD Timer
            mob.mobData.globalCDRemain = spell.globalCoolDown / mob.mobData.modifiers.spellSpeed;
            if (spell.isCast == true) {
                // Start casting
                mob.mobData.inCasting = true;
                mob.mobData.castTime = spell.castTime / mob.mobData.modifiers.spellSpeed;
                mob.mobData.castRemain = mob.mobData.castTime;
                mob.mobData.currentSpell = spell;
            }
            else {
                mob.mobData.finishCast(mob, target, spell);
            }
        }
        finishCast(mob, target, spell) {
            mob.mobData.inCasting = false;
            if (spell.isChannel == true) {
                // Start channeling
                mob.mobData.inChanneling = true;
                mob.mobData.channelTimeFactor = mob.mobData.modifiers.spellSpeed;
                mob.mobData.channelTime = spell.channelTime / mob.mobData.channelTimeFactor;
                mob.mobData.channelRemain = mob.mobData.channelTime;
            }
            spell.cast(mob, target);
        }
        /**
         * Event 'statChange' - emitted while a listener (buff, weapon, etc.) needs to change the stat of parent mob.
         * @param listener The listener that triggered a stat change
         * @event
         */
        onStatChange(listener) {
            this.calcStats(this.parentMob); // Listeners were notified inside this method.
        }
        calcStats(mob) {
            // TODO: Stats calculation:
            // 1. Calculate (get) base stats from self
            for (let stat in this.baseStats) {
                this.baseStats[stat] = this.baseStatsFundemental[stat];
            }
            // 2. Add equipment base stats to self by listener.calcBaseStats()
            this.updateListeners(this, 'baseStatCalculation', this);
            // 3. Reset battle stats
            this.battleStats = {
                resist: {
                    physical: 0,
                    elemental: 0,
                    pure: 0,
                    slash: 0,
                    knock: 0,
                    pierce: 0,
                    fire: 0,
                    ice: 0,
                    water: 0,
                    nature: 0,
                    wind: 0,
                    thunder: 0,
                    light: 0,
                    dark: 0,
                    heal: 0,
                },
                attackPower: {
                    physical: 0,
                    elemental: 0,
                    pure: 0,
                    slash: 0,
                    knock: 0,
                    pierce: 0,
                    fire: 0,
                    ice: 0,
                    water: 0,
                    nature: 0,
                    wind: 0,
                    thunder: 0,
                    light: 0,
                    dark: 0,
                    heal: 0,
                },
                // Write a helper to get hit / avoid / crit percentage from current level and parameters ?
                // Percentage
                // Those are basic about overall hit accuracy & avoid probabilities, critical hits.
                // Advanced actions (avoid specific spell) should be calculated inside onReceiveDamage() etc.
                // Same for shields, healing absorbs (Heal Pause ====...===...==...=>! SS: [ABSORB]!!! ...*&@^#), etc.
                hitAcc: 100,
                avoid: 0,
                // Percentage
                crit: 0,
                antiCrit: 0,
                // Parry for shield should calculate inside the shield itself when onReceiveDamage().
                attackRange: 0,
                extraRange: 0,
            };
            this.tauntMul = 1.0;
            // Go back to base speed
            this.modifiers.speed = 1.0;
            this.modifiers.movingSpeed = 1.0;
            this.modifiers.attackSpeed = 1.0;
            this.modifiers.spellSpeed = 1.0;
            this.modifiers.resourceCost = 1.0;
            // Calculate health from stats
            this.healthRatio = this.currentHealth / this.maxHealth;
            this.maxHealth =
                this.baseStats.vit * 10
                    + this.baseStats.str * 8
                    + this.baseStats.dex * 4
                    + this.baseStats.tec * 4
                    + this.baseStats.int * 4
                    + this.baseStats.mag * 4;
            // TODO - 4. Calculate battle (advanced) stats from base stats (e.g. atkPower = INT * 0.7 * floor( MAG * 1.4 ) ... )
            // 5. Add equipment by listener.calcStats()
            // Actually, those steps were combined in a single call,
            // as the calculation step of each class will happen in their player classes,
            // which should be the first called listener in updateListeners().
            this.updateListeners(this, 'statCalculation', this);
            this.updateListeners(this, 'statCalculationFinish', this);
            // 5. Finish
            this.maxHealth = Math.ceil(this.maxHealth);
            this.currentHealth = Math.max(0, Math.ceil(this.healthRatio * this.maxHealth));
        }
        receiveDamage(damageInfo) {
            // Calculate crit based on parameters
            if (!damageInfo.isCrit) {
                damageInfo.isCrit = (100 * Math.random()) < (damageInfo.source.getPercentage(damageInfo.source.battleStats.crit) -
                    damageInfo.target.getPercentage(damageInfo.target.battleStats.antiCrit));
                damageInfo.isAvoid = (100 * Math.random()) > (damageInfo.source.getPercentage(damageInfo.source.battleStats.hitAcc) -
                    damageInfo.target.getPercentage(damageInfo.target.battleStats.avoid));
            }
            this.updateListeners(damageInfo.target, 'receiveDamage', damageInfo);
            if (damageInfo.source) {
                damageInfo.source.updateListeners(damageInfo.source, 'dealDamage', damageInfo);
            }
            // Check if it was avoided (we check it before final calculation, so when onReceiveDamageFinal(), damage are guaranteed not avoided)
            if (damageInfo.isAvoid === true) {
                // Tell mob this attack was avoided
                damageInfo.value = 0;
                return damageInfo;
            }
            // N.B. if you want do something if target avoid, e.g. deal extra on avoid,
            // you should let it change the damage at onDealDamage() when isAvoid == true. (e.g. set other to 0 and add extra damage)
            // then set isAvoid to false. You can also pop some text when you add the extra damage.
            // Do the calculation
            // damage% = 1.0353 ^ power
            // 20pts of power = 100% more damage
            if (damageInfo.source) {
                damageInfo.value = Math.ceil(damageInfo.value *
                    (Math.pow(1.0353, damageInfo.source.battleStats.attackPower[GameData_5.GameData.damageType[damageInfo.type]] +
                        damageInfo.source.battleStats.attackPower[damageInfo.type])));
            }
            // damage% = 0.9659 ^ resist
            // This is, every 1 point of resist reduces corresponding damage by 3.41%, 
            // which will reach 50% damage reducement at 20 points.
            // TODO: it should all correspond to current level (resist based on source level, atkPower based on target level, same as healing)
            damageInfo.value = Math.ceil(damageInfo.value *
                (Math.pow(0.9659, this.battleStats.resist[GameData_5.GameData.damageType[damageInfo.type]] +
                    this.battleStats.resist[damageInfo.type])));
            // Apply criticals
            damageInfo.value = Math.ceil(damageInfo.value *
                (damageInfo.isCrit ? GameData_5.GameData.critMultiplier[damageInfo.type] : 1.0));
            // Overdeals
            let realDmg = Math.min(this.currentHealth, damageInfo.value);
            damageInfo.overdeal = damageInfo.value - realDmg;
            damageInfo.value = realDmg;
            // Let everyone know what is happening
            this.updateListeners(damageInfo.target, 'receiveDamageFinal', damageInfo);
            if (damageInfo.source) {
                damageInfo.source.updateListeners(damageInfo.source, 'dealDamageFinal', damageInfo);
            }
            // Decrese HP
            this.currentHealth -= realDmg;
            // Register this to BattleMonitor
            BattleMonitor_1.BattleMonitor.getSingleton().add(damageInfo);
            // Check if I am dead
            if (this.currentHealth <= 0) {
                // Let everyone know what is happening
                this.updateListeners(damageInfo.target, 'death', damageInfo);
                if (damageInfo.source) {
                    damageInfo.source.updateListeners(damageInfo.source, 'kill', damageInfo);
                }
                // If still I am dead
                if (this.currentHealth <= 0) {
                    // I die cuz I am killed
                    this.alive = false;
                }
            }
            // It hits!
            return damageInfo;
        }
        // TODO: merge receiveHeal and receiveDamage.
        receiveHeal(healInfo) {
            // Calculate crit based on parameters
            if (!healInfo.isCrit) {
                healInfo.isCrit = (100 * Math.random()) < (healInfo.source.getPercentage(healInfo.source.battleStats.crit) -
                    healInfo.target.getPercentage(healInfo.target.battleStats.antiCrit));
            }
            // Let everyone know what is happening
            this.updateListeners(healInfo.target, 'receiveHeal', healInfo);
            if (healInfo.source) {
                healInfo.source.updateListeners(healInfo.source, 'dealHeal', healInfo);
            }
            // Do the calculation
            // _finalHeal: total amount of healing (real + over)
            // healInfo.value = healInfo.heal.real;
            if (healInfo.source) {
                healInfo.value = Math.ceil(healInfo.value *
                    (Math.pow(1.0353, healInfo.source.battleStats.attackPower.heal)));
            }
            // damage% = 0.9659 ^ resist
            // This is, every 1 point of resist reduces corresponding damage by 3.41%, 
            // which will reach 50% damage reducement at 20 points.
            healInfo.value = Math.ceil(healInfo.value *
                (Math.pow(0.9659, this.battleStats.resist.heal)));
            healInfo.value = Math.ceil(healInfo.value
                * (healInfo.isCrit ? GameData_5.GameData.critMultiplier.heal : 1.0));
            // calculate overHealing using current HP and max HP.
            let realHeal = Math.min(healInfo.target.maxHealth - healInfo.target.currentHealth, healInfo.value);
            healInfo.overdeal = healInfo.value - realHeal;
            healInfo.value = realHeal;
            // Let buffs and agents know what is happening
            this.updateListeners(healInfo.target, 'receiveHealFinal', healInfo);
            if (healInfo.source) {
                healInfo.source.updateListeners(healInfo.source, 'dealHealFinal', healInfo);
            }
            // Increase the HP.
            this.currentHealth += healInfo.value;
            // Register this to BattleMonitor
            BattleMonitor_1.BattleMonitor.getSingleton().add(healInfo);
            return healInfo;
        }
        // Function used to tell buffs and agents what was going on
        // when damage and heal happens. They can modify them.
        updateListeners(mobData, event, ...args) {
            var flag = false;
            this.emitArray(event, (res) => { if (typeof res == "boolean") {
                flag = flag || res;
            } }, args);
            return flag;
        }
        canCastSpell() {
            if (this.globalCDRemain <= 0 && this.inCasting == false && this.inChanneling == false) {
                return true;
            }
            return false;
        }
        useMana(mana) {
            if (this.currentMana >= mana) {
                this.currentMana -= mana;
                return true;
            }
            return false;
        }
        hasMana(mana) {
            if (this.currentMana >= mana) {
                return true;
            }
            return false;
        }
        die(lastHit) {
            this.beingAttack = 0;
            this.alive = false;
        }
    }
    exports.MobData = MobData;
});
/** @packageDocumentation @module Core */
define("Engine/Core/Helper", ["require", "exports", "Engine/Core/UnitManager", "Engine/GameObjects/Spell", "Engine/Core/GameData"], function (require, exports, UnitManager_4, Spell_1, GameData_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function HealDmg(info) {
        if (info.type === GameData_6.GameData.Elements.heal) {
            return info.target.receiveHeal(info);
        }
        else {
            return info.target.receiveDamage(info);
        }
    }
    exports.HealDmg = HealDmg;
    /**
     * Helper function for easily performing Area of Effects (AoE). Currently only supports a circle area.
     *
     * Example:
     * ```typescript
     * AoE(
     *     (m: Mob, list: Mob[]) =>
     *     {
     *         // In fact it is not good to perform a HealDmg without assigning a source.
     *         HealDmg({'target': m, 'value': 200 / list.length, 'type': 'fire'});
     *     },
     *     new Phaser.Math.Vector2(200, 200),
     *     100,
     *     Targeting.Both
     * );
     * ```
     * Above code will perform a fire type AoE attack, centered at (200, 200) with range 100, dealing a splitable 200 damage (in total) to all targets inside its range.
     *
     * @param func Callback that will be applied for each mob once, who got captured by this AoE.
     * @param pos Center of this AoE
     * @param range Range of this AoE in px
     * @param targets Which type of mobs is this AoE capturing. Rather player, enemy or both.
     * @param maxCapture Maximum units that this AoE can capture, <= 0 means no limit. It is recommended to set a non-identity compareFunc when a maxCapture number is set.
     * @param compareFunc The compareing function that will be used when quering the captured unit list. If set, target list will be sorted wrt this function, default is Identity (no sort).
     */
    function AoE(func, pos, range, targets, maxCapture = -1, compareFunc = UnitManager_4.UnitManager.IDENTITY) {
        let AoEList = targets == Spell_1.Targeting.Both ?
            UnitManager_4.UnitManager.getCurrent().getUnitListAll(compareFunc, (a) => { return (a.footPos().distance(pos) < range); })
            :
                UnitManager_4.UnitManager.getCurrent().getUnitList(compareFunc, (a) => { return (a.footPos().distance(pos) < range); }, targets == Spell_1.Targeting.Player);
        if (maxCapture > 0) {
            AoEList = AoEList.slice(0, maxCapture);
        }
        AoEList.forEach((m, i, l) => { func(m, l, i); });
    }
    exports.AoE = AoE;
    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }
    exports.getRandomInt = getRandomInt;
    function getRandomFloat(min, max) {
        return Math.random() * (max - min) + min;
    }
    exports.getRandomFloat = getRandomFloat;
    function radian(degree) {
        return degree / 180.0 * Math.PI;
    }
    exports.radian = radian;
    function reverseTarget(target) {
        if (target == Spell_1.Targeting.Both) {
            return Spell_1.Targeting.Both;
        }
        if (target == Spell_1.Targeting.Player) {
            return Spell_1.Targeting.Enemy;
        }
        if (target == Spell_1.Targeting.Enemy) {
            return Spell_1.Targeting.Player;
        }
    }
    exports.reverseTarget = reverseTarget;
});
/** @packageDocumentation @module GameObjects */
define("Engine/GameObjects/Spell", ["require", "exports", "Engine/DynamicLoader/dPhysSprite", "Engine/GameObjects/Mob", "Engine/Core/Helper"], function (require, exports, dPhysSprite_1, Mob_3, Helper_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var SpellFlags;
    (function (SpellFlags) {
        SpellFlags[SpellFlags["isDamage"] = 0] = "isDamage";
        SpellFlags[SpellFlags["isHeal"] = 1] = "isHeal";
        SpellFlags[SpellFlags["hasTarget"] = 2] = "hasTarget";
        SpellFlags[SpellFlags["areaEffect"] = 3] = "areaEffect";
        SpellFlags[SpellFlags["overTime"] = 4] = "overTime";
        SpellFlags[SpellFlags["targetingEverything"] = 5] = "targetingEverything";
    })(SpellFlags = exports.SpellFlags || (exports.SpellFlags = {}));
    var Targeting;
    (function (Targeting) {
        Targeting[Targeting["Player"] = 0] = "Player";
        Targeting[Targeting["Enemy"] = 1] = "Enemy";
        Targeting[Targeting["Both"] = 2] = "Both";
    })(Targeting = exports.Targeting || (exports.Targeting = {}));
    /**
     * Spell class, which is different from core/SpellData.
     * Spells are renderable, moveable entities that directly appears in the game screen,
     * and is responsible for dealing damage / heals from its source to its target.
     *
     * Spells must have a source, so it must be casted from a mob.
     * Spells will be automatically added into its source's scene.
     *
     * use SpellFlags.targetingEverything to make the spell to hit with everything.
     */
    class Spell extends dPhysSprite_1.dPhysSprite {
        constructor(x, y, sprite, settings, useCollider = true, maxLifeSpan = 30.0, subsprite, frame) {
            super(settings.source.scene, x, y, sprite, subsprite, frame);
            this.useCollider = useCollider;
            this.info = settings.info;
            this.flags = this.info.flags;
            this.name = this.info.name;
            this.lifeRemain = maxLifeSpan;
            this.destroying = false;
            this.source = settings.source;
            this.target = settings.target;
            if (this.target instanceof Mob_3.Mob) {
                this.targeting = this.target.mobData.isPlayer ? Targeting.Player : Targeting.Enemy;
            }
            this.targeting = this.flags.has(SpellFlags.targetingEverything) ? Targeting.Both : this.targeting;
            if (this.useCollider === false) {
                this.disableBody();
            }
            else {
                if (this.targeting == Targeting.Both) {
                    this.scene.everyoneTargetingObjectGroup.add(this);
                }
                else if (this.targeting == Targeting.Player) {
                    this.scene.playerTargetingObjectGroup.add(this);
                }
                else {
                    this.scene.enemyTargetingObjectGroup.add(this);
                }
            }
            // Apply tint color
            this.setTint(Phaser.Display.Color.GetColor(settings.color.red, settings.color.green, settings.color.blue));
            // Register events
            this._onHit = settings.onHit;
            this._onMobHit = settings.onMobHit;
            this._onWorldHit = settings.onWorldHit;
            this._onDestroy = settings.onDestroy;
            this._onUpdate = settings.onUpdate;
            this.scene.add.existing(this);
        }
        checkInCamera() {
            // TODO
            return true;
        }
        update(dt) {
            // Life counter
            this.lifeRemain -= dt;
            if (this.lifeRemain < 0) {
                this.selfDestroy();
            }
            else {
                // Check is target alive
                // If target dead, set it to undefined
                if (this.target instanceof Mob_3.Mob && Mob_3.Mob.checkAlive(this.target) !== true) {
                    this.target = undefined;
                }
                // Cannot see me so die
                if (this.checkInCamera() === false) {
                    this.selfDestroy();
                }
                this.updateSpell(dt);
            }
        }
        dieAfter(foo, arg, other) {
            foo.apply(this, arg);
            this.selfDestroy(other);
        }
        selfDestroy(other = this) {
            if (!this.destroying) {
                if (this.body) {
                    this.disableBody(true, true);
                }
                this.onDestroy(other);
                this.destroy();
            }
        }
        HealDmg(target, dmg, type) {
            return Helper_1.HealDmg({
                'source': this.source,
                'target': target,
                'value': dmg,
                'type': type,
                'popUp': true,
                'spell': this.info,
            });
        }
        updateSpell(dt) { if (this._onUpdate) {
            this._onUpdate(this, dt);
        } }
        onHit(obj) { if (this._onHit) {
            this._onHit(this, obj);
        } }
        onMobHit(mob) { if (this._onMobHit) {
            this._onMobHit(this, mob);
        } }
        onWorldHit(obj) { if (this._onWorldHit) {
            this._onWorldHit(this, obj);
        } }
        onDestroy(obj = this) { if (this._onDestroy) {
            this._onDestroy(this, obj);
        } }
    }
    exports.Spell = Spell;
    /**
     * Dummy spell instance which is not represented as a Projectile (e.g. sword slash, melee attacks etc.)
     */
    class DummySpell extends Spell {
        constructor(x, y, sprite, settings, subsprite, frame) {
            settings.info.name = settings.info.name || "DummySpell";
            super(x, y, sprite, settings, false, 60.0, subsprite, frame);
            this.triggerTime = -1 || settings.triggerTime;
            this._onSpell = settings.onSpell;
            this._onSpellVec2 = settings.onSpellVec2;
            this.spellDone = false;
            if (this.triggerTime < 0) {
                this.onSpell(this.source, this.target);
            }
        }
        updateSpell(dt) {
            this.triggerTime -= dt;
            if (this.spellDone == false && this.triggerTime < 0) {
                this.onSpell(this.source, this.target);
            }
            super.updateSpell(dt);
        }
        onSpell(source, target) {
            this.spellDone = true;
            if (this._onSpell && target instanceof Mob_3.Mob) {
                this._onSpell(this, source, target);
            }
            else if (this._onSpellVec2 && target instanceof Phaser.Math.Vector2) {
                this._onSpellVec2(this, source, target);
            }
        }
    }
    exports.DummySpell = DummySpell;
});
/** @packageDocumentation @module Core */
define("Engine/Core/EquipmentCore", ["require", "exports", "Engine/Core/MobListener", "Engine/Core/InventoryCore"], function (require, exports, MobListener_3, InventoryCore_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var EquipmentType;
    (function (EquipmentType) {
        EquipmentType["All"] = "EQTYPE_ALL";
        EquipmentType["Accessory"] = "accessory";
        EquipmentType["Armor"] = "armor";
        EquipmentType["Weapon"] = "weapon";
        EquipmentType["Unknown"] = "EQTYPE_UNKNOWN";
    })(EquipmentType = exports.EquipmentType || (exports.EquipmentType = {}));
    var WeaponType;
    (function (WeaponType) {
        WeaponType["Staff"] = "staff";
        WeaponType["Unknown"] = "WPTYPE_UNKNOWN";
    })(WeaponType = exports.WeaponType || (exports.WeaponType = {}));
    var WeaponSubType;
    (function (WeaponSubType) {
        WeaponSubType["Unknown"] = "WPTYPE_UNKNOWN";
    })(WeaponSubType = exports.WeaponSubType || (exports.WeaponSubType = {}));
    var EquipmentTag;
    (function (EquipmentTag) {
        EquipmentTag["Equipment"] = "equipment";
    })(EquipmentTag = exports.EquipmentTag || (exports.EquipmentTag = {}));
    class Equipable extends MobListener_3.MobListener {
        constructor(itemID) {
            super();
            this.itemID = itemID;
            this.itemData = InventoryCore_2.ItemManager.getData(this.itemID);
            this.name = this.itemData.showName;
            this.assignTags();
        }
        syncStats(mob) { }
        _beAdded(mob, source) {
            this.syncStats(mob);
            this.listen(mob, 'statCalculationFinish', this.onStatCalculationFinish);
            super._beAdded(mob, source);
            this.emitArray('statChange', (res) => { }, [this]);
        }
        onStatCalculationFinish(mob) {
            super.onStatCalculationFinish(mob);
            this.syncStats(mob);
        }
        showToolTip() {
            return {
                'title': 'Equipment',
                'text': 'Tooltip',
            };
        }
        assignTags() {
            let tags = this.itemData.tags;
            tags.forEach(t => {
                if (t in EquipmentType) {
                    this.eqType = EquipmentType[t];
                }
            });
        }
    }
    exports.Equipable = Equipable;
    class Armor extends Equipable {
    }
    exports.Armor = Armor;
    class Weapon extends Equipable {
        constructor(itemID) {
            super(itemID);
            this.weaponGauge = 0;
            this.weaponGaugeMax = -1;
        }
        isInRange(mob, target) {
            return (mob.footPos().distance(target.footPos()) < (this.activeRange + mob.mobData.battleStats.attackRange));
        }
        grabTargets(mob) {
            return [];
        }
        triggerCD() {
            this.isReady = false;
            this.cooldown = 0;
        }
        assignTags() {
            super.assignTags();
            this.wpType = WeaponType[this.itemData.pClass];
            this.wpsubType = WeaponType[this.itemData.sClass];
        }
        attack(source, target, triggerCD = true) {
            let flag = false;
            this.isReadyWrapper(() => {
                target = target.filter((v) => this.isInRange(source, v));
                if (target.length <= 0) {
                    return;
                }
                this.doRegularAttack(source, target);
                if (triggerCD) {
                    this.triggerCD();
                }
                if (this.weaponGaugeMax > 0) {
                    this.weaponGauge += this.weaponGaugeIncreasement(source);
                    if (this.weaponGauge > this.weaponGaugeMax) {
                        this.weaponGauge -= this.weaponGaugeMax;
                        this.doSpecialAttack(source, target);
                    }
                }
                flag = true;
            })();
            return flag;
        }
        syncStats(mob) {
            this.cooldownMax = mob.getAttackSpeed();
        }
        // onAdded(mob: MobData, source: MobData)
        // {
        //     super.onAdded(mob, source);
        //     // console.log("be added to " + mob.name);
        // }
        doRegularAttack(source, target) {
            throw new Error("Method not implemented.");
        }
        doSpecialAttack(source, target) { }
    }
    exports.Weapon = Weapon;
    class Accessory extends Equipable {
    }
    exports.Accessory = Accessory;
});
/** @packageDocumentation @module Core */
define("Engine/Core/mRTypes", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
/** @packageDocumentation @module Core */
define("Engine/Core/MobListener", ["require", "exports", "Engine/Core/DataBackend", "Engine/Events/EventSystem"], function (require, exports, DataBackend_2, EventSystem) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    EventSystem = __importStar(EventSystem);
    var MobListenerType;
    (function (MobListenerType) {
        MobListenerType[MobListenerType["Buff"] = 0] = "Buff";
        MobListenerType[MobListenerType["Weapon"] = 1] = "Weapon";
        MobListenerType[MobListenerType["Armor"] = 2] = "Armor";
        MobListenerType[MobListenerType["Accessory"] = 3] = "Accessory";
        /** Attachable things on top of weapon / armor etc. (e.g. Gems, ...) */
        MobListenerType[MobListenerType["Attachment"] = 4] = "Attachment";
        /** Mob Agent (The action controller of the actual mob, both for player and enemies) */
        MobListenerType[MobListenerType["Agent"] = 5] = "Agent";
        /** Job characteristics modifier, e.g. ForestElfMyth, FloraFairy, etc. */
        MobListenerType[MobListenerType["Characteristics"] = 6] = "Characteristics";
    })(MobListenerType = exports.MobListenerType || (exports.MobListenerType = {}));
    // onXXX event functions are optional - just register them and use if necessary. By default events will not be connected with the onXXX methods.
    class MobListener extends EventSystem.EventElement {
        constructor() {
            super(DataBackend_2.DataBackend.getSingleton().eventSystem);
            this.enabled = true;
            this.isOver = false;
            this.focusList = new Set();
            this.priority = 0;
            this.enabled = true;
            this.cooldownMax = 0.0;
            this.cooldown = 0.0;
            this.isReady = true;
            // let tst = new MobData({'name': 'test'});
            // this.listen(tst, 'dealDamage', this.isReadyWrapper(this.onDealDamage));
        }
        isReadyWrapper(func) {
            return (...args) => // In order to catch the correct "this" (really?) ref: https://github.com/Microsoft/TypeScript/wiki/'this'-in-TypeScript
             {
                if (this.enabled && (!this.isOver)) {
                    func.apply(this, args);
                }
            };
        }
        focus(mob) {
        }
        unfocus(mob) {
        }
        // Will only be triggered by parent mob.
        update(self, dt) {
            for (let mob of this.focusList) {
                // if(!Mob.checkExist(mob))
                // {
                // this.focusList.delete(mob);
                // }
            }
            if (this.isReady == false) {
                this.cooldown += dt;
            }
            if (this.cooldown >= (this.cooldownMax)) {
                // this.cooldown = 0;
                // this.isReady = false; // <-- This is the original version. Why did I wrote this ?
                this.isReady = true;
            }
        }
        // N.B.
        // In javascript, parameters were passed via "call-by-sharing".
        // In this case, if you change the parameter itself in a function, it will not make sense;
        // However, if you change a member of the parameter in a function, it will make sense.
        // e.g. func(x) { x = {sth}; } => DOES NOT change x
        //      func(x) { x.y = sth; } => DOES change x.y
        // Be triggered when the mob is calculating its stats.
        // Typically, this will trigged on start of each frame.
        // On every frame, the stats of the mob will be recalculated from its base value.
        onBaseStatCalculation(mob) { }
        onStatCalculation(mob) { }
        onStatCalculationFinish(mob) { }
        // When this listener was added to the mob by source
        // Buffs will also be triggered when new stack comes.
        _beAdded(mob, source) {
            this.parentMob = mob;
            this.onAdded(mob, source);
        }
        onAdded(mob, source) { }
        // When this listener was removed from the mob by source. By default this will remove the listener from the eventsystem.
        _beRemoved(mob, source) {
            this.discard();
            this.onRemoved(mob, source);
        }
        onRemoved(mob, source) { }
        // Be triggered when the mob is attacking.
        // This is triggered before the mob's attack.
        onAttack(mob) { }
        // Be triggered when the mob has finished an attack.
        onAfterAttack(mob) { }
        // Be triggered when the mob is making a special attack.
        // This is triggered before the attack.
        onSpecialAttack(mob) { }
        // Be triggered when the mob has finished a special attack.
        onAfterSpecialAttack(mob) { }
        // Be triggered when the mob is going to be rendered.
        // e.g. change sprite color here etc.
        onCreate(mob, scene) { }
        onFrontEndUpdate(mob, dt) { }
        onRender(mob, scene) { }
        onFrontEndDestroy(mob, scene) { }
        /**
         * Be triggered when the mob is updating, not to be confused with "MobListener.update()".
         * This will be triggered before "onStatCalculation".
         * @param mob the mob that updates
         * @param dt deltaTime in secs
         * @event
         */
        onUpdate(mob, dt) { }
        /**
         * 'switchWeapon', be triggered when the mob switches its weapon.
         * @param mobData the mob data
         * @param weapon the weapon that the mob currently holds (after switching).
         * @event
         */
        onSwitchWeapon(mob, weapon) { }
        // Following functions return a boolean.
        // True:    the damage / heal was modified.
        // False:   the damage / heal was not modified.
        // XXFinal will happen after resist calculation, and vice versa.
        // You can modify the values in damage / heal in order to change the final result.
        // Damage/Heal Info: { source, target, value, overdeal, isCrit, isAvoid, isBlock, spell } = {}
        onDealDamage(damageInfo) { return false; }
        onDealDamageFinal(damageInfo) { return false; }
        onDealHeal(healInfo) { return false; }
        onDealHealFinal(healInfo) { return false; }
        onReceiveDamage(damageInfo) { return false; }
        onReceiveDamageFinal(damageInfo) { return false; }
        onReceiveHeal(healInfo) { return false; }
        onReceiveHealFinal(healInfo) { return false; }
        onKill(damageInfo) { return false; }
        onDeath(damageInfo) { return false; }
    }
    exports.MobListener = MobListener;
});
/**
 * Agents are used to control the action of mobs (players, enemies). They are also MobListeners so that they could handle events like dealDamage etc.
 * They are the "brain" of a mob, and a mob will not make any action without an agent.
 *
 * @packageDocumentation
 * @module Agent
 * @preferred
 */
define("Engine/Agents/MobAgent", ["require", "exports", "Engine/Core/MobListener"], function (require, exports, MobListener_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MobAgent extends MobListener_4.MobListener {
        constructor(parentMob) {
            super();
        }
        updateMob(mob, dt) { }
    }
    exports.MobAgent = MobAgent;
});
/** @packageDocumentation @module Core */
define("Engine/Core/ObjectPopulator", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ObjectPopulator {
        constructor() { }
        static setData(objList, agentList) {
            ObjectPopulator.objList = objList;
            ObjectPopulator.agentList = agentList;
        }
        static newObject(scene, objID, obj) {
            let f = this.objList[objID];
            if (f) {
                let prop = {};
                for (let key of obj.properties) {
                    prop[key.name] = key.value;
                }
                return f(scene, obj, prop);
            }
            return undefined;
        }
    }
    exports.ObjectPopulator = ObjectPopulator;
});
/** @packageDocumentation @module GameEntity */
define("Engine/GameObjects/Mob", ["require", "exports", "Engine/DynamicLoader/dPhysSprite", "Engine/Core/MobData", "Engine/Core/UnitManager", "Engine/Core/EquipmentCore", "Engine/UI/PopUpManager", "Engine/Core/ObjectPopulator", "Engine/Core/GameData"], function (require, exports, dPhysSprite_2, MobData_1, UnitManager_5, EquipmentCore_2, PopUpManager_4, ObjectPopulator_1, GameData_7) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Mob extends dPhysSprite_2.dPhysSprite {
        constructor(scene, x, y, sprite, settings, subsprite, frame) {
            super(scene, x, y, sprite, subsprite, frame);
            this.setOrigin(0.5, 0.8);
            this.mobData = settings.backendData;
            this.mobData.parentMob = this;
            this.moveAnim = settings.moveAnim;
            this.idleAnim = settings.idleAnim;
            this.deadAnim = settings.deadAnim;
            if (this.idleAnim) {
                this.play(this.idleAnim);
            }
            this.isPlayer = this.mobData.isPlayer;
            if (this.isPlayer === true) {
                // Is player
                UnitManager_5.UnitManager.getCurrent().addPlayer(this);
            }
            else {
                // Is enemy
                UnitManager_5.UnitManager.getCurrent().addEnemy(this);
            }
            this.setGravity(0, 0);
            if (settings.agent) {
                this.agent = new settings.agent(this);
                this.mobData.addListener(this.agent);
            }
            this.attackCounter = 0;
            // HPBar
        }
        static fromTiled(scene, obj, prop) {
            let settings_backend = (prop);
            settings_backend.name = settings_backend.name || obj.name || 'Unnamed_mob';
            let charsheet_key = 'sheet_' + prop['image'] || 'sheet_default_mob';
            let settings = {
                'moveAnim': charsheet_key + '_move',
                'idleAnim': charsheet_key + '_idle',
                'deadAnim': charsheet_key + '_dead',
                'backendData': new MobData_1.MobData(settings_backend),
                'agent': ObjectPopulator_1.ObjectPopulator.agentList[prop['agentType'] || prop['agent'] || 'default'],
            };
            return new Mob(scene, obj.x, obj.y, charsheet_key, settings);
        }
        update(dt) {
            // this.sprite.x += dt / 1000.0 * 10;
            if (this.body.velocity.length() > 0) {
                this.mobData.isMoving = true;
            }
            else {
                this.mobData.isMoving = false;
            }
            this.mobData.updateMobBackend(this, dt);
            // Physics update?
            if (this.agent) {
                this.agent.updateMob(this, dt);
            }
        }
        doAttack(dt) {
            if (typeof this.mobData.currentWeapon === "undefined") {
                return false;
            }
            if (this.mobData.canCastSpell() == false) {
                return false;
            }
            return this.mobData.currentWeapon.isReady;
        }
        getEquipableTags(equipmentType) {
            return [EquipmentCore_2.EquipmentTag.Equipment];
        }
        // Will be called when a buff is going to affect the mob.
        // If anything some object with buff ability (e.g. fireball can fire sth up) hits has method receiveBuff(),
        // receiveBuff() will be called and the mob will be buffed.
        // receiveBuff() should be the final step of being buffed, and if the mob resists some buff this should not be called.
        // e.g. in some inherited classes use:
        //                                       if(...){ nothing happens; } else { super.receiveBuff() }.
        // N.B. recieveBuff should also work like recieveDamage(), that triggers listener events and decide
        // if we should keep the buff or ignore it.
        // But I have not write it.
        // TODO: add onReceiveBuff & onFocusReceiveBuff for game.MobListeners.
        // ...Maybe we should let them auto trigger onFocusXXX for any events ?
        receiveBuff(source = undefined, buff = undefined, popUp = true) {
            if (Mob.checkAlive(this) == false) {
                return false;
            }
            if (buff != undefined) {
                // Set source if not
                if (typeof buff.source === "undefined") {
                    buff.source = source.mobData;
                }
                // Call backend to add the buff.
                // Actually, for the backend, a buff is same as a plain listener (this.data.addListener(listener)).
                this.mobData.addBuff(buff);
                // Initial popUp
                if (popUp == true) {
                    buff.popUp(this);
                }
            }
            return true;
        }
        fillDHF(_damageInfo) {
            if (_damageInfo.isAvoid == undefined) {
                _damageInfo.isAvoid = false;
            }
            if (_damageInfo.isCrit == undefined) {
                _damageInfo.isCrit = false;
            }
            if (_damageInfo.isBlock == undefined) {
                _damageInfo.isBlock = false;
            }
            if (_damageInfo.popUp == undefined) {
                _damageInfo.popUp = true;
            }
            return _damageInfo;
        }
        // Same as receiveBuff(),
        // this method will be used to receive damage from any object.
        // this method will also trigger events for listeners, and let them modify the damage.
        // e.g. mob equiped fire resist necklace -> it's event will be triggered ...
        // (actually for fire resist necklace, change parameters in onStatsChange() is convinent, though. lol.)
        // This method will also popup a text with the final amount of damage, 
        // with corresponding color defined in gama.data.damageColor.
        // this action could be disabled by setting popUp = false.
        /**
         * Params of damageInfo (default value)
         * source:          damage source
         * damage ({}):     actual damage. e.g. {fire: 165, ice: 100, thunder: 600}
         * isCrit (false):  is this damage crits ? It will be calculated automatically if it is false.
         * isAvoid (false): Same as above.
         * spell:           the spell used at this attack
         * popUp (true):    Should this damage popup a text ?
         */
        receiveDamage(_damageInfo) {
            // Fill optional slots with their default values.
            _damageInfo = this.fillDHF(_damageInfo);
            let damageInfo = {
                'source': _damageInfo.source.mobData,
                'target': this.mobData,
                'spell': _damageInfo.spell,
                'value': _damageInfo.value,
                'isCrit': _damageInfo.isCrit,
                'isAvoid': _damageInfo.isAvoid,
                'isBlock': _damageInfo.isBlock,
                'type': _damageInfo.type,
                // 'type'   : _damageInfo.type,
                'overdeal': 0,
            };
            if (Mob.checkAlive(this) == false) {
                damageInfo.isAvoid = true;
                damageInfo.value = 0;
                return damageInfo;
            }
            // The actual damage calculate and event trigger moved into backend
            // If mob dead finally, this.data.alive will become false
            let result = this.mobData.receiveDamage(damageInfo);
            // It does not hit !
            if (result.isAvoid) {
                if (_damageInfo.popUp == true) {
                    var popUpPos = this.getTopCenter();
                    PopUpManager_4.PopUpManager.getSingleton().addText('MISS', popUpPos.x, popUpPos.y, GameData_7.GameData.ElementColors['miss']);
                }
                return result;
            }
            // Mob itself only do rendering popUp texts
            if (_damageInfo.popUp == true && result.value > 0) {
                var popUpPos = this.getTopCenter();
                PopUpManager_4.PopUpManager.getSingleton().addText(result.value.toString() + (result.isCrit ? "!" : ""), popUpPos.x, popUpPos.y, GameData_7.GameData.ElementColors[result.type]);
                // // popUp texts on unit frames
                // // fade from the edge of currentHealth to the left
                // if(this.data.isPlayer)
                // {
                //     for(var i = 0; i < game.units.getPlayerListWithDead().length; i++)
                //     {
                //         if(this === game.units.getPlayerListWithDead()[i])
                //         {
                //             popUpPos = game.UI.unitFrameSlots.slots[i].pos;
                //             game.UI.popupMgr.addText({
                //                 text: "-" + damageInfo.damage[dmgType].toString(),
                //                 time: 0.75,
                //                 color: game.data.damageColor[dmgType],
                //                 posX: popUpPos.x + 126,// * (this.data.currentHealth / this.data.maxHealth), // Maybe this is better ? (or cannot see if sudden death)
                //                 posY: popUpPos.y - 10,
                //                 velX: -256,
                //                 velY: 0.0,
                //                 accX: 384,
                //                 accY: 0.0,
                //             });
                //         }
                //     }
                // }
            }
            // However, it should also check if self dead here
            // since it should remove the renderable (actual object) from the scene and mob list
            // Check if I am alive
            if (this.mobData.alive == false) {
                this.die(_damageInfo.source, result);
            }
            return result;
        }
        // Receive healing, same as recieve damage.
        /**
         * Params of healInfo (default value)
         * source:          heal source
         * heal (0):        actual heal, a number.
         * isCrit (false):  is this heal crits ? It will be calculated automatically if it is false.
         * spell:           the spell used at this attack
         * popUp (true):    Should this heal popup a text ?
         */
        receiveHeal(_healInfo) {
            // Fill optional slots with their default values.
            _healInfo = this.fillDHF(_healInfo);
            // Same as above
            let healInfo = {
                'source': _healInfo.source.mobData,
                'target': this.mobData,
                'spell': _healInfo.spell,
                'value': _healInfo.value,
                'isCrit': _healInfo.isCrit,
                'isAvoid': _healInfo.isAvoid,
                'isBlock': _healInfo.isBlock,
                'type': GameData_7.GameData.Elements.heal,
                'overdeal': 0
            };
            if (Mob.checkAlive(this) == false) {
                healInfo.isAvoid = true;
                healInfo.value = 0;
                return healInfo;
            }
            let result = this.mobData.receiveHeal(healInfo);
            // Show popUp text with overhealing hint
            if (_healInfo.popUp == true && (result.value + result.overdeal) > 0) {
                // var popUpPos = this.getRenderPos(0.5, 0.0);
                // if(healInfo.heal.over > 0)
                // {
                //     game.UI.popupMgr.addText({
                //         text: healInfo.heal.real.toString() + (healInfo.isCrit ? " !" : "") + " <" + healInfo.heal.over.toString() + ">",
                //         color: game.data.damageColor.heal,
                //         velX: 64,
                //         posX: popUpPos.x,
                //         posY: popUpPos.y,
                //     });
                // }
                // else
                // {
                //     game.UI.popupMgr.addText({
                //         text: healInfo.heal.real.toString() + (healInfo.isCrit ? " !" : ""),
                //         color: game.data.damageColor.heal,
                //         velX: 64,
                //         posX: popUpPos.x,
                //         posY: popUpPos.y,
                //     });
                // }
                var popUpPos = this.getTopCenter();
                if (result.overdeal > 0) {
                    PopUpManager_4.PopUpManager.getSingleton().addText(result.value.toString() + (result.isCrit ? "!" : "") + " <" + result.overdeal.toString() + ">", popUpPos.x, popUpPos.y, GameData_7.GameData.ElementColors['heal'], 1.0, 64, -256);
                }
                else {
                    PopUpManager_4.PopUpManager.getSingleton().addText(result.value.toString() + (result.isCrit ? "!" : ""), popUpPos.x, popUpPos.y, GameData_7.GameData.ElementColors['heal'], 1.0, 64, -256);
                }
                // // popUp texts on unit frames
                // // fade from left to the the edge of currentHealth
                // if(this.data.isPlayer && healInfo.heal.real > 0){
                //     for(var i = 0; i < game.units.getPlayerListWithDead().length; i++)
                //     {
                //         if(this === game.units.getPlayerListWithDead()[i])
                //         {
                //             popUpPos = game.UI.unitFrameSlots.slots[i].pos;
                //             game.UI.popupMgr.addText({
                //                 text: "+" + healInfo.heal.real.toString(),
                //                 time: 0.75,
                //                 color: game.data.damageColor.heal,
                //                 posX: popUpPos.x + 30,
                //                 posY: popUpPos.y + 10,
                //                 velX: 256,
                //                 velY: 0.0,
                //                 accX: -384,
                //                 accY: 0.0,
                //             });
                //         }
                //     }
                // }
            }
            return result;
        }
        die(source, damage) {
            this.mobData.die(damage);
            // this.body.collisionType = me.collision.types.NO_OBJECT;
            if (this.mobData.isPlayer === true) {
                // Don't remove it, keep it dead
                // game.units.removePlayer(this);
            }
            else {
                // throw new Error("Remove the mob here");
                console.log(this.mobData.name + " has DEAD!");
                // me.game.world.removeChild(this.HPBar);
                // game.units.removeEnemy(this);
                // me.game.world.removeChild(this);
                this.agent.parentMob = undefined;
                this.agent = undefined;
                this.destroy();
            }
        }
        footPos() {
            return new Phaser.Math.Vector2(this.x, this.y);
        }
        static checkExist(mob) {
            return (mob != null);
        }
        static checkAlive(mob) {
            return (Mob.checkExist(mob) && (mob.mobData.alive === true));
        }
    }
    exports.Mob = Mob;
});
/** @packageDocumentation @module BattleScene */
define("Engine/ScenePrototypes/BattleScene", ["require", "exports", "Engine/GameObjects/Mob", "Engine/Core/UnitManager", "Engine/Core/ObjectPopulator", "Engine/Core/BattleMonitor", "Engine/UI/UIScene"], function (require, exports, Mob_4, UnitManager_6, ObjectPopulator_2, BattleMonitor_2, UIScene_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class BattleScene extends Phaser.Scene {
        constructor(debug = false, mapToLoad = "playground") {
            super({
                key: 'BattleScene',
                physics: {
                    default: 'arcade',
                    'arcade': {
                        debug: debug,
                    }
                }
            });
            this.tilesetImgPrefix = 'assets/tilemaps/tiles/';
            this.mapToLoad = mapToLoad;
        }
        preload() {
            this.width = this.sys.game.canvas.width;
            this.height = this.sys.game.canvas.height;
            this.load.tilemapTiledJSON(this.mapToLoad, "assets/tilemaps/playground.json");
        }
        addMob(mob) {
            this.add.existing(mob);
            if (mob.mobData.isPlayer) {
                this.playerGroup.add(mob);
            }
            else {
                this.enemyGroup.add(mob);
            }
        }
        create() {
            UnitManager_6.UnitManager.resetScene(this);
            this.unitMgr = UnitManager_6.UnitManager.getCurrent();
            // Create groups
            this.worldGroup = this.physics.add.group();
            this.commonGroup = this.physics.add.group();
            this.fxGroup = this.physics.add.group();
            this.playerGroup = this.physics.add.group();
            this.enemyGroup = this.physics.add.group();
            this.playerTargetingObjectGroup = this.physics.add.group();
            this.enemyTargetingObjectGroup = this.physics.add.group();
            this.everyoneTargetingObjectGroup = this.physics.add.group();
            this.physics.add.overlap(this.playerTargetingObjectGroup, this.playerGroup, this.spellHitMobCallback);
            this.physics.add.overlap(this.everyoneTargetingObjectGroup, this.playerGroup, this.spellHitMobCallback);
            this.physics.add.overlap(this.enemyTargetingObjectGroup, this.enemyGroup, this.spellHitMobCallback);
            this.physics.add.overlap(this.everyoneTargetingObjectGroup, this.enemyGroup, this.spellHitMobCallback);
            this.physics.add.overlap(this.playerTargetingObjectGroup, this.worldGroup, this.spellHitWorldCallback);
            this.physics.add.overlap(this.enemyTargetingObjectGroup, this.worldGroup, this.spellHitWorldCallback);
            this.physics.add.overlap(this.everyoneTargetingObjectGroup, this.worldGroup, this.spellHitWorldCallback);
            // Prepare for load the tilemap
            this.loadingScreen = this.add.image(512, 640 / 2, 'loadscreen_BG');
            this.loadingScreen.displayWidth = 1024;
            this.loadingScreen.displayHeight = 640;
            this.loadingScreen.setDepth(100);
            this.map = this.make.tilemap({ key: this.mapToLoad });
            console.log(this.map);
            for (let tileset of this.map.tilesets) {
                let path = this.tilesetImgPrefix + tileset.name + ".png";
                this.load.image(tileset.name, path);
                console.log(path);
            }
            this.load.on('complete', () => { this.loadComplete(); UIScene_1.UIScene.getSingleton().resetPlayers(); });
            this.load.start();
        }
        loadComplete() {
            this.tweens.add({
                targets: this.loadingScreen,
                alpha: { value: 0, duration: 1000, ease: 'Power1' },
                yoyo: false,
                repeat: 0
            });
            for (let tileset of this.map.tilesets) {
                this.map.addTilesetImage(tileset.name, tileset.name);
            }
            for (let layer of this.map.layers) {
                let tmp_layer = this.map.createStaticLayer(layer.name, this.map.tilesets, 0, 0);
                tmp_layer.depth = -1; // TODO: adjust this value
            }
            for (let objLayer of this.map.objects) {
                for (let obj of objLayer.objects) {
                    let objPopulated = ObjectPopulator_2.ObjectPopulator.newObject(this, obj.type == "" ? obj.name : obj.type, obj);
                    if (objPopulated instanceof Mob_4.Mob) {
                        this.addMob(objPopulated);
                    }
                    else if (objPopulated) {
                        this.add.existing(objPopulated);
                    }
                }
            }
            console.log(this.map);
            this.mapReady = true;
            this.battleMonitor = BattleMonitor_2.BattleMonitor.getSingleton();
        }
        // Handle when spell hits a mob it targets
        spellHitMobCallback(obj1, obj2) {
            let spell = obj1;
            let mob = obj2;
            spell.onHit(mob);
            spell.onMobHit(mob);
        }
        // Handle when spell hits some world object that it may interact
        spellHitWorldCallback(obj1, obj2) {
            let spell = obj1;
            spell.onHit(obj2);
            spell.onWorldHit(obj2);
        }
        update(time, dt) {
            if (this.mapReady) {
                this.children.each((item) => { item.update(dt / 1000.0); });
                this.unitMgr.update(dt / 1000.0);
                this.updateScene(time, dt / 1000.0);
                BattleMonitor_2.BattleMonitor.getSingleton().update(dt / 1000.0);
            }
        }
        updateScene(time, dt) { }
    }
    exports.BattleScene = BattleScene;
});
/** @packageDocumentation @module GameObjects */
define("Engine/GameObjects/Projectile", ["require", "exports", "Engine/GameObjects/Spell", "Engine/GameObjects/Mob"], function (require, exports, Spell_2, Mob_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Projectile extends Spell_2.Spell {
        constructor(x, y, sprite, settings, useCollider = true, subsprite, frame) {
            super(x, y, sprite, settings, useCollider, 7.0, subsprite, frame);
            this.chasingRange = settings.chasingRange || 0;
            this.chasingPower = settings.chasingPower || 0;
            this.speed = settings.speed || 200;
            if (this.target instanceof Phaser.Math.Vector2) {
                this.moveDirc = this.target.clone().subtract(this.getPosition()).normalize();
                this.target = undefined;
            }
            else {
                this.moveDirc = this.target.footPos().clone().subtract(this.getPosition()).normalize();
            }
        }
        updateSpell(dt) {
            // Homing
            if (this.target instanceof Mob_5.Mob && (this.chasingRange < 0 || this.target.footPos().clone().subtract(this.getPosition()).length() < this.chasingRange)) {
                let newDirc = this.target.footPos().clone().subtract(this.getPosition()).normalize();
                this.moveDirc = this.moveDirc.clone().scale(1 - dt * this.chasingPower).add(newDirc.clone().scale(dt * this.chasingPower));
            }
            this.setVelocity(this.moveDirc.x * this.speed, this.moveDirc.y * this.speed);
            super.updateSpell(dt);
        }
    }
    exports.Projectile = Projectile;
});
/** @packageDocumentation @module Buffs */
define("Buffs/HDOT", ["require", "exports", "Engine/Core/Buff", "Engine/Core/GameData", "Engine/Core/Helper", "Engine/GameObjects/Spell"], function (require, exports, Buff_2, GameData_8, Helper_2, Spell_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class HDOT extends Buff_2.Buff {
        constructor(settings, type, vMin = 1, vMax = 3, vGap = 0.57) {
            settings.name = settings.name || 'XOT';
            settings.popupName = settings.popupName || settings.name || 'XOT!';
            settings.color = settings.color || GameData_8.GameData.ElementColors[type] || Phaser.Display.Color.HexStringToColor('#0066ff');
            //settings.iconId
            super(settings);
            //this.toolTip
            this.vMin = vMin;
            this.vMax = vMax;
            this.vGap = vGap; // do not use cooldown for accurate timing
            this.vType = type;
            this.timer = 0;
            this.vCount = -1; // Initial tick
        }
        onAdded(mob, source) {
            this.listen(mob, 'update', this.onUpdate);
        }
        onUpdate(mob, dt) {
            this.timer += dt;
            for (; this.vCount < Math.floor(this.timer / this.vGap); this.vCount++) {
                Helper_2.HealDmg({
                    'source': this.source.parentMob,
                    'target': mob.parentMob,
                    'type': this.vType,
                    'value': Helper_2.getRandomInt(this.vMin, this.vMax),
                    'spell': { 'name': this.name, 'flags': new Set([Spell_3.SpellFlags.overTime]) },
                    'popUp': true,
                });
            }
        }
    }
    exports.HDOT = HDOT;
});
/** @packageDocumentation @module Weapons */
define("Weapons/Staff", ["require", "exports", "Engine/Core/EquipmentCore", "Engine/Core/UnitManager", "Engine/GameObjects/Spell", "Engine/GameObjects/Projectile", "Engine/Core/Helper", "Engine/Core/GameData", "Buffs/HDOT"], function (require, exports, EquipmentCore_3, UnitManager_7, Spell_4, Projectile_1, Helper_3, GameData_9, HDOT_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class CometWand extends EquipmentCore_3.Weapon {
        constructor(itemID = 'cometWand') {
            super(itemID);
            this.mainElement = 'ice';
            this.baseAttackMin = 6;
            this.baseAttackMax = 18;
            this.baseAttackSpeed = 1.5;
            this.targetCount = 4;
            this.activeRange = 2000;
            this.manaCost = 10;
            this.weaponGaugeMax = 25;
            this.weaponGaugeIncreasement = function (mob) { return mob.mobData.baseStats.mag; };
        }
        onAdded(mob, source) {
            this.listen(mob, 'baseStatCalculation', this.onBaseStatCalculation);
        }
        onBaseStatCalculation(mob) {
            // Add stats to the mob
            // mob.baseStats.mag += 200;
        }
        doRegularAttack(source, target) {
            for (let targetMob of target)
                new Projectile_1.Projectile(source.x, source.y, 'img_iced_fx', {
                    'info': { 'name': this.name, 'flags': new Set([Spell_4.SpellFlags.isDamage, Spell_4.SpellFlags.hasTarget]) },
                    'source': source,
                    'target': targetMob,
                    'speed': 150,
                    'onMobHit': (self, mob) => { self.dieAfter(self.HealDmg, [mob, Helper_3.getRandomInt(6, 18), GameData_9.GameData.Elements.ice], mob); },
                    // 'onMobHit': (self: Spell, mob: Mob) =>
                    // {
                    //     self.dieAfter(
                    //         () => AoE((m: Mob) =>
                    //         {
                    //             self.HealDmg(m, getRandomInt(6, 18), 'ice')
                    //         }, self.getPosition(), 100, self.targeting), [], mob);
                    // },
                    'color': Phaser.Display.Color.HexStringToColor("#77ffff"),
                    'chasingRange': 400,
                    'chasingPower': 1.0,
                });
        }
        doSpecialAttack(source, target) {
            for (let targetMob of target)
                new Projectile_1.Projectile(source.x, source.y, 'img_iced_fx', {
                    'info': { 'name': this.name, 'flags': new Set([Spell_4.SpellFlags.isDamage, Spell_4.SpellFlags.hasTarget]) },
                    'source': source,
                    'target': targetMob,
                    'speed': 250,
                    'onMobHit': (self, mob) => {
                        self.dieAfter(() => Helper_3.AoE((m) => {
                            // self.HealDmg(m, getRandomInt(30, 50), GameData.Elements.fire);
                            m.receiveBuff(source, new HDOT_1.HDOT({ 'source': source.mobData, 'countTime': true, 'popupColor': GameData_9.GameData.ElementColors[GameData_9.GameData.Elements.fire], 'popupName': 'Burnt' }, GameData_9.GameData.Elements.fire, 5, 8, 0.2));
                        }, self.getPosition(), 100, self.targeting), [], mob);
                    },
                    'color': Phaser.Display.Color.HexStringToColor("#ff3333"),
                    'chasingRange': 400,
                    'chasingPower': 5.0,
                });
        }
        grabTargets(mob) {
            return UnitManager_7.UnitManager.getCurrent().getNearest(mob.footPos(), !mob.mobData.isPlayer, this.targetCount);
        }
    }
    exports.CometWand = CometWand;
});
/** @packageDocumentation @module Agent */
define("Agents/SimpleAgents", ["require", "exports", "Engine/Agents/MobAgent"], function (require, exports, MobAgent_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class KeepMoving extends MobAgent_2.MobAgent {
        constructor(parentMob, range = 150, dirc = new Phaser.Math.Vector2(0, 1)) {
            super(parentMob);
            this.center = parentMob.getPosition();
            this.range = range;
            this.dirc = dirc.normalize();
        }
        updateMob(mob, dt) {
            if (mob.getPosition().add(this.dirc.clone().scale(20.0)).distance(this.center) > this.range) {
                this.dirc = this.dirc.negate();
            }
            mob.setVelocity(this.dirc.x * 100.0, this.dirc.y * 100.0);
        }
    }
    exports.KeepMoving = KeepMoving;
});
/** @packageDocumentation @module Lists */
define("Lists/ItemList", ["require", "exports", "Weapons/Staff"], function (require, exports, Staff_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ItemList = {
        "cometWand": Staff_1.CometWand,
    };
});
/** @packageDocumentation @module Lists */
define("Lists/ObjectList", ["require", "exports", "Engine/GameObjects/Mob"], function (require, exports, Mob_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ObjectList = {
        'mob': Mob_6.Mob.fromTiled,
    };
});
/** @packageDocumentation @module Lists */
define("Lists/AgentList", ["require", "exports", "Agents/SimpleAgents"], function (require, exports, SimpleAgents_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AgentList = {
        'default': undefined,
        'keepMoving': SimpleAgents_1.KeepMoving,
    };
});
/** @packageDocumentation @module BattleScene */
define("TestScene", ["require", "exports", "Engine/ScenePrototypes/BattleScene", "Engine/GameObjects/Mob", "Engine/Core/MobData", "Weapons/Staff", "Agents/PlayerAgents", "Agents/SimpleAgents", "Engine/Core/Helper", "Engine/Core/InventoryCore", "Lists/ItemList", "Engine/Core/ObjectPopulator", "Lists/ObjectList", "Lists/AgentList", "Engine/Core/GameData", "Buffs/HDOT"], function (require, exports, BattleScene_1, Mob_7, MobData_2, Staff_2, PlayerAgents, SimpleAgents_2, Helper_4, InventoryCore_3, ItemList_1, ObjectPopulator_3, ObjectList_1, AgentList_1, GameData_10, HDOT_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    PlayerAgents = __importStar(PlayerAgents);
    class TestScene extends BattleScene_1.BattleScene {
        constructor() {
            super(false); // debug?
            this.hc = 0.5;
            this.hcM = 0.5;
        }
        preload() {
            ObjectPopulator_3.ObjectPopulator.setData(ObjectList_1.ObjectList, AgentList_1.AgentList);
            super.preload();
            this.load.image('logo', 'assets/BlueHGRMJsm.png');
            this.load.image('Grass_Overworld', 'assets/tilemaps/tiles/overworld_tileset_grass.png');
            this.load.tilemapTiledJSON('overworld', 'assets/tilemaps/Overworld_tst.json');
            this.load.spritesheet('elf', 'assets/img/spritesheets/forestElfMyst.png', { frameWidth: 32, frameHeight: 32, endFrame: 3 });
            this.load.json('itemData', 'assets/dataSheets/Items.json');
        }
        create() {
            // Create the ItemManager
            InventoryCore_3.ItemManager.setData(this.cache.json.get('itemData'), ItemList_1.ItemList);
            super.create();
        }
        loadComplete() {
            super.loadComplete();
            // this.map = this.make.tilemap({ key: 'overworld' });
            // this.tiles = this.map.addTilesetImage('Grass_Overworld', 'Grass_Overworld');
            // this.terrainLayer = this.map.createStaticLayer('Terrain', this.tiles, 0, 0);
            this.anims.create({ key: 'move', frames: this.anims.generateFrameNumbers('elf', { start: 0, end: 3, first: 0 }), frameRate: 8, repeat: -1 });
            for (let i = 0; i < 8; i++) {
                // this.alive.push(new Mob(this.add.sprite(100, 200, 'elf'), 'move'));
                this.girl = new Mob_7.Mob(this, 930, 220 + i * 30, 'sheet_forestelf_myst', {
                    'idleAnim': 'move',
                    'moveAnim': 'move',
                    'deadAnim': 'move',
                    'backendData': new MobData_2.MobData({ name: 'testGirl' + i, 'isPlayer': true, 'attackSpeed': 40 - 5 * i, 'mag': 13 - 2 * i, 'manaRegen': 2 + 6 * i }),
                    'agent': PlayerAgents.Simple,
                });
                this.girl.mobData.battleStats.attackPower.ice = 10;
                this.girl.mobData.battleStats.attackPower.fire = 40;
                this.girl.mobData.battleStats.crit = 5.0;
                this.girl.mobData.weaponRight = new Staff_2.CometWand();
                this.girl.mobData.currentWeapon = this.girl.mobData.weaponRight;
                this.girl.mobData.addListener(this.girl.mobData.weaponRight);
                this.girl.receiveBuff(this.girl, new HDOT_2.HDOT({ 'source': this.girl.mobData, 'countTime': false, 'name': 'GodHeal' }, GameData_10.GameData.Elements.heal, 10, 18, 1.66));
                this.addMob(this.girl);
            }
            let woodlog = new Mob_7.Mob(this, 300, 200, 'sheet_forestelf_myst', {
                'idleAnim': 'move',
                'moveAnim': 'move',
                'deadAnim': 'move',
                'backendData': new MobData_2.MobData({ name: 'woodLog', 'isPlayer': false, 'health': 1000, }),
                'agent': SimpleAgents_2.KeepMoving,
            });
            this.addMob(woodlog);
            woodlog = new Mob_7.Mob(this, 350, 200, 'sheet_forestelf_myst', {
                'idleAnim': 'move',
                'moveAnim': 'move',
                'deadAnim': 'move',
                'backendData': new MobData_2.MobData({ name: 'woodLog', 'isPlayer': false, 'health': 1000, }),
                'agent': SimpleAgents_2.KeepMoving,
            });
            this.addMob(woodlog);
            this.h = woodlog;
            woodlog = new Mob_7.Mob(this, 300, 250, 'sheet_forestelf_myst', {
                'idleAnim': 'move',
                'moveAnim': 'move',
                'deadAnim': 'move',
                'backendData': new MobData_2.MobData({ name: 'woodLog', 'isPlayer': false, 'health': 1000, }),
                'agent': SimpleAgents_2.KeepMoving,
            });
            this.addMob(woodlog);
        }
        updateScene(time, dt) {
            // console.log("Mana: " + this.girl.mobData.currentMana.toString() + " / " + this.girl.mobData.maxMana.toString());
            if (this.hc < 0) {
                this.hc = this.hcM;
                Helper_4.HealDmg({ 'source': this.h, 'target': this.h, type: GameData_10.GameData.Elements.heal, value: 5 });
            }
            this.hc -= dt * 0.001;
        }
    }
    exports.TestScene = TestScene;
});
/** @packageDocumentation @module GameScene */
define("SimpleGame", ["require", "exports", "TestScene", "Engine/DynamicLoader/DynamicLoaderScene", "Engine/UI/UIScene"], function (require, exports, TestScene_1, DynamicLoaderScene_3, UIScene_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class InitPhaser {
        static initGame() {
            let config = {
                type: Phaser.AUTO,
                width: 1024,
                height: 660,
                resolution: window.devicePixelRatio,
                scene: [TestScene_1.TestScene],
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
            };
            this.gameRef = new Phaser.Game(config);
            this.gameRef.scene.add('DynamicLoaderScene', DynamicLoaderScene_3.DynamicLoaderScene.getSingleton(), true);
            this.gameRef.scene.add('UIScene', UIScene_2.UIScene.getSingleton(), true);
        }
    }
    exports.InitPhaser = InitPhaser;
    InitPhaser.initGame();
});
//# sourceMappingURL=gameMain.js.map