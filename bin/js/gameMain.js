var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
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
        emitArrayReverted(evt, resCallback, args) {
            return this.parentSystem.emitReverted(this, resCallback, evt, args);
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
                    /* Do NOT WANT TO USE THE OFFICIAL METHOD ANYMORE
                    // Call the event callback function for each destination
                    evtList.forEach((dst, callback) =>
                    {
                        let result = callback.apply(dst, args);
                        if (resCallback)
                        {
                            resCallback(result);
                        }
    
                        totalCnt += 1;
                    });
                    */
                    var evtList = srcDict.getValue(evt);
                    let curr = (evtList)['head'].next;
                    while (curr.next) {
                        let result = curr.value.apply(curr.key, args);
                        if (resCallback) {
                            resCallback(result);
                        }
                        totalCnt += 1;
                        curr = curr.next;
                    }
                }
            }
            return totalCnt;
        }
        emitReverted(src, resCallback, evt, args) {
            var totalCnt = 0;
            if (this.dict.containsKey(src)) {
                var srcDict = this.dict.getValue(src);
                if (srcDict.containsKey(evt)) {
                    var evtList = srcDict.getValue(evt);
                    // Why is LinkedDictionary<K,V>.tail it private ahhhhhhHHHHHHHHHHHHHHHHHHH give me the tail omGGGGGGGGGGGGG
                    let curr = (evtList)['tail'].prev;
                    // Only head node does not have prev, and head node is always empty ([NULL (head)] <-> actual data <-> [NULL (tail)])
                    while (curr.prev) {
                        let result = curr.value.apply(curr.key, args);
                        if (resCallback) {
                            resCallback(result);
                        }
                        totalCnt += 1;
                        curr = curr.prev;
                    }
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
        create() {
            super.create();
            this.label = this.add.bitmapText(1014, 10, 'smallPx', 'Loading ... [100.0%]');
            this.label.setOrigin(1, 0);
            // this.label.setBackgroundColor('#000000');
            // this.label.setFontFamily('宋体, SimSun, Consolas');
            // this.label.setFontSize(12);
            // this.assetList = this.cache.json.get('assetList');
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
                texture = subsTexture || 'DOBJ_LOADING_PLACEHOLDER';
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
            if (key == this.textureToLoad && this.scene) {
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
                texture = subsTexture || 'DOBJ_LOADING_PLACEHOLDER';
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
            if (key == this.textureToLoad && this.scene) {
                this.loadComplete = true;
                this.setTexture(this.textureToLoad, this.frameToLoad);
                // Play cached animation
                if (this.currentAnim.key) {
                    this.play(this.currentAnim.key, true, this.currentAnim.startFrame);
                }
                this.setBodyShape();
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
        setBodyShape() {
            this.body.setSize(this.displayWidth * 0.8, this.displayHeight * 0.8, true);
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
            }
            else {
                this.keyFn = (a) => {
                    if (a.keyFn) {
                        return a.keyFn();
                    }
                    else {
                        return a.toString();
                    }
                };
            }
            this.data = new Map();
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
                    this.currentTimestamp += 1;
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
                    this.currentTimestamp += 1;
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
            // ItemManager.datastorage = JSON.parse(JSON.stringify(itemData)); // Deep copy
            ItemManager.datastorage = itemData;
            for (let key in ItemManager.datastorage) {
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
define("Engine/Core/GameData", ["require", "exports", "Engine/Core/mRTypes"], function (require, exports, mRTypes_1) {
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
        GameData.ElementColorsStr = {
            slash: "#ffffff",
            knock: "#ffffff",
            pierce: "#ffffff",
            fire: "#ffa342",
            ice: "#72ffe2",
            water: "#5b8fff",
            nature: "#b1ed1a",
            wind: "#aaffc8",
            thunder: "#fffb21",
            light: "#fffbd1",
            dark: "#8d47bf",
            miss: "#ff19e0",
            heal: "#66f95c",
        };
        GameData.ElementColors = {
            slash: Phaser.Display.Color.HexStringToColor(GameData.ElementColorsStr['slash']),
            knock: Phaser.Display.Color.HexStringToColor(GameData.ElementColorsStr['knock']),
            pierce: Phaser.Display.Color.HexStringToColor(GameData.ElementColorsStr['pierce']),
            fire: Phaser.Display.Color.HexStringToColor(GameData.ElementColorsStr['fire']),
            ice: Phaser.Display.Color.HexStringToColor(GameData.ElementColorsStr['ice']),
            water: Phaser.Display.Color.HexStringToColor(GameData.ElementColorsStr['water']),
            nature: Phaser.Display.Color.HexStringToColor(GameData.ElementColorsStr['nature']),
            wind: Phaser.Display.Color.HexStringToColor(GameData.ElementColorsStr['wind']),
            thunder: Phaser.Display.Color.HexStringToColor(GameData.ElementColorsStr['thunder']),
            light: Phaser.Display.Color.HexStringToColor(GameData.ElementColorsStr['light']),
            dark: Phaser.Display.Color.HexStringToColor(GameData.ElementColorsStr['dark']),
            miss: Phaser.Display.Color.HexStringToColor(GameData.ElementColorsStr['miss']),
            heal: Phaser.Display.Color.HexStringToColor(GameData.ElementColorsStr['heal']),
        };
        GameData.rarityColor = ["#888", "#fff", "#3f3", "#3af", "#fb3", "#faa"];
        GameData.rarityName = ["rare0", "rare1", "rare2", "rare3", "rare4", "rare5"];
        GameData.playerMax = 8;
        GameData.playerSparse = 12;
        GameData.playerSparseInc = 2;
        GameData.useAutomove = true;
        GameData.moveThreshold = 150;
        GameData.popUpSmallFont = true;
        GameData.popUpBuffLanguage = mRTypes_1.mRTypes.Languages.ENG;
        GameData.mainLanguage = mRTypes_1.mRTypes.Languages.ENG;
        GameData.showManaNumber = true;
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
        constructor(scene, x, y, fetchValue = undefined, width = 100, height = 10, border = 1, hasBG = true, outlineColor = 0xffffff, bgColor = 0x20604f, fillColor = 0x1b813e, showText = true, fontKey = 'smallPx_HUD', align = TextAlignment.Left, textX = 0, textY = 0, textColor = 0xffffff, getText = undefined, tween = true, textBG = 0x00000000) {
            super(scene, x, y);
            this.fetchFunc = fetchValue;
            this.getText = getText;
            this.align = align;
            this.fill = new Phaser.GameObjects.Rectangle(this.scene, border, border, width - border * 2, height - border * 2, fillColor);
            this.fill.setOrigin(0);
            this.fill.setPosition(border, border);
            if (border > 0) {
                this.out = new Phaser.GameObjects.Rectangle(this.scene, 0, 0, width, height, outlineColor);
                this.out.setOrigin(0);
                this.add(this.out);
            }
            if (hasBG) {
                this.bg = new Phaser.GameObjects.Rectangle(this.scene, border, border, width - border * 2, height - border * 2, bgColor);
                this.bg.setOrigin(0);
                this.bg.setPosition(border, border);
                this.add(this.bg);
            }
            this.add(this.fill);
            if (textBG !== 0x00000000) {
                this.textBG = new Phaser.GameObjects.Rectangle(this.scene, textX - 1 + align, textY - 1, 0, 0, textBG >> 8, (textBG & 0x000000FF) / 255);
                this.textBG.setOrigin(align * 0.5, 0);
                this.add(this.textBG);
            }
            if (showText) {
                this.text = new Phaser.GameObjects.BitmapText(this.scene, textX, textY, fontKey, '0/0');
                this.text.setOrigin(align * 0.5, 0);
                this.text.setTint(textColor);
                this.add(this.text);
            }
            this.fillMaxLength = width - border * 2;
            this.maxV = 100;
            this.curV = 100;
            this.prevText = "";
            this.useTween = tween;
        }
        update(time, dt) {
            if (this.fetchFunc) {
                let v = this.fetchFunc();
                if (v) {
                    this.setValue(v[0], v[1]);
                }
            }
        }
        setValue(value, max = undefined) {
            if (max === undefined) {
                max = this.maxV;
            }
            // this.fill.width = this.fillMaxLength * (value / max);
            if (this.useTween) {
                this.scene.tweens.add({
                    targets: this.fill,
                    width: this.fillMaxLength * Math.max(0.0, Math.min(1.0, value / max)),
                    yoyo: false,
                    repeat: 0,
                    duration: 100,
                });
            }
            else {
                this.fill.width = this.fillMaxLength * Math.max(0.0, Math.min(1.0, value / max));
            }
            if (this.text) {
                if (this.getText) {
                    this.text.text = this.getText();
                }
                else {
                    this.text.text = value.toFixed(0); // + "/" + max.toFixed(0);
                }
                if (typeof this.textBG !== 'undefined' && this.text.text !== this.prevText) {
                    this.prevText = this.text.text;
                    let bounds = this.text.getTextBounds();
                    this.textBG.width = bounds.global.width + 4;
                    this.textBG.height = bounds.global.height + 4;
                    this.textBG.x = bounds.global.x - 2;
                    this.textBG.y = bounds.global.y - 2;
                }
            }
        }
    }
    exports.ProgressBar = ProgressBar;
});
/** @packageDocumentation @moduleeDocumentation @module Agent */
define("Engine/Agents/PlayerAgents", ["require", "exports", "Engine/Agents/MobAgent", "Engine/GameObjects/Mob", "Engine/Core/GameData", "Engine/Core/UnitManager", "Engine/UI/PopUpManager"], function (require, exports, MobAgent_1, Mob_1, GameData_1, UnitManager_1, PopUpManager_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class PlayerAgentBase extends MobAgent_1.MoveableAgent {
        setTargetPos(player, position, dt) { }
        setTargetMob(player, target, dt) { }
    }
    exports.PlayerAgentBase = PlayerAgentBase;
    class Simple extends PlayerAgentBase {
        constructor() {
            super();
            this.OOMwarned = false;
            // Will the player move automatically (to nearest mob) if it is free ?
            this.autoMove = GameData_1.GameData.useAutomove;
            // this.autoMove = true;
            // idleCount will count down from idleFrame if player is in idle (-1 / frame) to smooth the animation.
            // Only if idleCount = 0, the player will be "idle".
            // idleFrame is seperated for targeting Mob (which may move = need more smooth)
            // and targeting a static position (don't move and need high precision)
            // WTF? I cannot understood what have I wrote ...
            this.idleFrames = 0;
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
                if (this.isMoving === false) {
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
                        player.attack(targets);
                    }
                }
                // Use any spells available
                for (let spell in player.mobData.spells) {
                    if (player.mobData.spells.hasOwnProperty(spell)) {
                        if (this.isMoving == false) {
                            if (player.mobData.spells[spell].available) {
                                player.mobData.cast(player, this.targetMob, player.mobData.spells[spell]);
                            }
                        }
                    }
                }
            }
            // YOU DIED !
            else {
                this.isMoving = false;
                player.setVelocity(0, 0);
            }
            super.updateMob(player, dt);
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
            if (sortMethod !== UnitManager.IDENTITY) {
                result.sort(sortMethod);
            }
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
define("Engine/UI/Localization", ["require", "exports", "Engine/Core/GameData"], function (require, exports, GameData_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Localization {
        static setData(data) {
            Localization.data = data;
        }
        static setOneData(key, data, isPopUp = false) {
            if (isPopUp) {
                Localization.data.popUpBuff[key] = data;
            }
            else {
                Localization.data.main[key] = data;
            }
        }
        static getStr(s, overrideLanguage) {
            if (Localization.data) {
                if (Localization.data.main.hasOwnProperty(s)) {
                    return Localization.data.main[s][overrideLanguage || GameData_3.GameData.mainLanguage];
                }
                else if (Localization.data.popUpBuff.hasOwnProperty(s)) {
                    return Localization.data.popUpBuff[s][overrideLanguage || GameData_3.GameData.popUpBuffLanguage];
                }
                return s;
            }
            return 'LOCAL_NOT_LOADED';
        }
    }
    exports.Localization = Localization;
    function _(s, overrideLanguage) {
        return Localization.getStr(s, overrideLanguage);
    }
    exports._ = _;
});
/**
 * @packageDocumentation
 * @module UI
 */
define("Engine/UI/ScrollMaskedContainer", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ScrollDirc;
    (function (ScrollDirc) {
        ScrollDirc["Vertical"] = "height";
        ScrollDirc["Horizontal"] = "width";
    })(ScrollDirc = exports.ScrollDirc || (exports.ScrollDirc = {}));
    class ScrollMaskedContainer extends Phaser.GameObjects.Container {
        constructor(scene, x, y, width, height, dirc = ScrollDirc.Vertical, globalX = undefined, globalY = undefined) {
            super(scene, x, y);
            this.rect = this.scene.make.image({ add: false });
            // this.rect.fillStyle(0x00ffff);
            // this.rect.fillRect(x, y, width, height);
            this.rect.x = globalX || x;
            this.rect.y = globalY || y;
            this.rect.displayWidth = width;
            this.rect.displayHeight = height;
            this.rect.setOrigin(0);
            let mask = new Phaser.Display.Masks.BitmapMask(this.scene, this.rect);
            this.mask = mask;
            this.setSize(width, height);
            this.setInteractive();
            this.input.hitArea.x = width / 2;
            this.input.hitArea.y = height / 2;
            this.on('wheel', this.onWheel);
            this.dirc = dirc;
            if (this.dirc == ScrollDirc.Vertical) {
                this.contentStart = this.rect.y;
            }
            if (this.dirc == ScrollDirc.Horizontal) {
                this.contentStart = this.rect.x;
            }
        }
        updateContentLength() {
            let rect = this.getBounds();
            if (this.dirc == ScrollDirc.Vertical) {
                this.contentLength = rect.height;
                this.contentPosition = this.rect.y - rect.y;
            }
            else {
                this.contentLength = rect.width;
                this.contentPosition = this.rect.x - rect.x;
            }
            // this.input.hitArea = rect;
            this.input.hitArea.width = rect.width;
            this.input.hitArea.height = rect.height;
            this.input.hitArea.x = rect.width / 2;
            this.input.hitArea.y = rect.height / 2;
            // Reset position
            if (this.dirc == ScrollDirc.Vertical) {
                this.contentPosition = Math.max(0, Math.min(this.contentPosition, this.contentLength - this.rect.displayHeight));
                this.y = this.rect.y - this.contentPosition;
            }
            else {
                this.contentPosition = Math.max(0, Math.min(this.contentPosition, this.contentLength - this.rect.displayWidth));
                this.x = this.rect.x - this.contentPosition;
            }
        }
        onWheel(evt) {
            if (this.rect.getBounds().contains(evt.position.x, evt.position.y)) {
                if (this.dirc == ScrollDirc.Vertical) {
                    this.contentPosition += evt.deltaY * 0.1;
                    this.contentPosition = Math.max(0, Math.min(this.contentPosition, this.contentLength - this.rect.displayHeight));
                    this.y = this.rect.y - this.contentPosition;
                }
                else {
                    this.contentPosition += evt.deltaY * 0.1;
                    this.contentPosition = Math.max(0, Math.min(this.contentPosition, this.contentLength - this.rect.displayWidth));
                    this.x = this.rect.x - this.contentPosition;
                }
            }
            evt.event.preventDefault();
            return false;
        }
    }
    exports.ScrollMaskedContainer = ScrollMaskedContainer;
});
/** @packageDocumentation @module GameObjects */
define("Engine/GameObjects/Spell", ["require", "exports", "Engine/DynamicLoader/dPhysSprite", "Engine/GameObjects/Mob"], function (require, exports, dPhysSprite_1, Mob_3) {
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
            // Capture data
            if (this.source) {
                this.mobCrit = this.source.mobData.battleStats.crit;
                this.mobHit = this.source.mobData.battleStats.hitAcc;
                this.mobAP = {};
                if (settings.mainType instanceof Array) {
                    for (let type of settings.mainType) {
                        this.mobAP[type] = this.source.mobData.getAtkPower(type);
                    }
                    this.mainType = settings.mainType[0];
                }
                else if (settings.mainType) {
                    this.mobAP[settings.mainType] = this.source.mobData.getAtkPower(settings.mainType);
                    this.mainType = settings.mainType;
                }
            }
            this.cachedMobData = settings.data;
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
            if (settings.color) {
                this.setTint(Phaser.Display.Color.GetColor(settings.color.red, settings.color.green, settings.color.blue));
            }
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
        HealDmg(target, dmg, type, applyCachedAP, crit, hit, level) {
            let finalDmg = dmg;
            if (this.mobAP && ((typeof applyCachedAP === 'undefined') || applyCachedAP)) {
                if (type in this.mobAP) {
                    finalDmg *= this.mobAP[type];
                }
            }
            return target.receiveDamageHeal({
                'source': this.source,
                'value': finalDmg,
                'type': type,
                'popUp': true,
                'spell': this.info,
                'crit': crit || this.mobCrit || 0,
                'hit': hit || this.mobHit || 0,
                'level': level || this.mobLevel || 0,
            });
        }
        updateSpell(dt) { if (this._onUpdate) {
            this._onUpdate(this, dt);
        } }
        onHit(obj) { if (this.body && this._onHit) {
            this._onHit(this, obj);
        } }
        onMobHit(mob) { if (this.body && this._onMobHit) {
            this._onMobHit(this, mob);
        } }
        onWorldHit(obj) { if (this.body && this._onWorldHit) {
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
define("Engine/Core/Helper", ["require", "exports", "Engine/Core/UnitManager", "Engine/GameObjects/Spell"], function (require, exports, UnitManager_2, Spell_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
    function AoE(func, pos, range, targets, maxCapture = -1, compareFunc = UnitManager_2.UnitManager.IDENTITY) {
        let AoEList = targets == Spell_1.Targeting.Both ?
            UnitManager_2.UnitManager.getCurrent().getUnitListAll(compareFunc, (a) => { return (a.footPos().distance(pos) < range); })
            :
                UnitManager_2.UnitManager.getCurrent().getUnitList(compareFunc, (a) => { return (a.footPos().distance(pos) < range); }, targets == Spell_1.Targeting.Player);
        if (maxCapture > 0) {
            AoEList = AoEList.slice(0, maxCapture);
        }
        AoEList.forEach((m, i, l) => { func(m, l, i); });
    }
    exports.AoE = AoE;
    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
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
    function ColorToStr(color) {
        return Phaser.Display.Color.RGBToString(color.red, color.green, color.blue);
    }
    exports.ColorToStr = ColorToStr;
    function getMobDataSafe(mobData, entry, defaultValue, additionalSettings) {
        if (mobData) {
            let len = entry.length;
            let currentObj = mobData;
            for (var i = 0; i < len; i++) {
                currentObj = currentObj[entry[i]];
                if (!currentObj) {
                    return defaultValue;
                }
            }
            return currentObj;
        }
        return defaultValue;
    }
    exports.getMobDataSafe = getMobDataSafe;
    var Helper;
    (function (Helper) {
        let toolTip;
        (function (toolTip) {
            function beginSection() {
                return "<div>";
            }
            toolTip.beginSection = beginSection;
            function switchSection() {
                return "</div><div>";
            }
            toolTip.switchSection = switchSection;
            function endSection() {
                return "</div>";
            }
            toolTip.endSection = endSection;
            function row(text, style, cls) {
                if (typeof cls === 'undefined') {
                    cls = '_row';
                }
                if (style) {
                    return "<p class = '" + cls + "' style = '" + style + "'>" + text + "</p>";
                }
                return "<p class = '" + cls + "'>" + text + "</p>";
            }
            toolTip.row = row;
            function column(text, style) {
                if (style) {
                    return "<span style = '" + style + "'>" + text + "</span>";
                }
                return "<span>" + text + "</span>";
            }
            toolTip.column = column;
            function colored(text, color, style) {
                if (style) {
                    return "<strong style='color:" + color + ";" + style + "'>" + text + "</strong>";
                }
                return "<strong style='color:" + color + ";'>" + text + "</strong>";
            }
            toolTip.colored = colored;
        })(toolTip = Helper.toolTip || (Helper.toolTip = {}));
    })(Helper = exports.Helper || (exports.Helper = {}));
});
/**
 * @packageDocumentation
 * @module UI
 */
define("Engine/UI/UnitFrame", ["require", "exports", "Engine/UI/ProgressBar", "Engine/DynamicLoader/dSprite", "Engine/UI/Localization", "Engine/UI/UIScene", "Engine/Core/Helper", "Engine/Core/GameData"], function (require, exports, ProgressBar_1, dSprite_1, Localization_1, UIScene_1, Helper_1, GameData_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class WeaponFrame extends Phaser.GameObjects.Container {
        constructor(scene, x, y, target) {
            super(scene, x, y);
            this.targetWeapon = target;
            this.bg = new Phaser.GameObjects.Rectangle(this.scene, 0, 4, 24, 24, 0x4f4b46);
            this.bg.setOrigin(0);
            this.add(this.bg);
            this.wpIcon = new dSprite_1.dSprite(this.scene, 0, 4, target.itemData.image, undefined, target.itemData.iconIdx);
            this.wpIcon.setOrigin(0);
            this.wpIcon.setTint((this.targetWeapon && this.targetWeapon.activated) ? 0xffffff : 0x888888);
            this.bg.fillColor = (this.targetWeapon && this.targetWeapon.activated) ? 0x4f4b46 : 0x35302a;
            this.add(this.wpIcon);
            this.add(new ProgressBar_1.ProgressBar(this.scene, 0, 0, () => {
                if (this.targetWeapon) {
                    return [this.targetWeapon.weaponGauge, this.targetWeapon.weaponGaugeMax];
                }
                else {
                    return [0, 0];
                }
            }, 24, 2, 0, true, 0x000000, 0x333333, 0x659ad2, true, 'smallPx', ProgressBar_1.TextAlignment.Center, 12, -10, 0x659ad2, () => {
                if (this.targetWeapon && this.targetWeapon.weaponGauge >= this.targetWeapon.weaponGaugeMax) {
                    return "MAX";
                }
                else if (this.targetWeapon && this.targetWeapon.weaponGauge < 0) {
                    return "<0?!";
                }
                else {
                    return "";
                }
            }));
            this.wpIcon.on('pointerover', () => {
                UIScene_1.UIScene.getSingleton().showToolTip(this.targetWeapon.getToolTip());
            });
            this.wpIcon.on('pointerout', () => {
                UIScene_1.UIScene.getSingleton().hideToolTip();
            });
        }
        setWeapon(target) {
            this.targetWeapon = target;
            this.wpIcon.setTexture(target.itemData.image, target.itemData.iconIdx);
        }
        update(time, dt) {
            this.wpIcon.setTint((this.targetWeapon && this.targetWeapon.activated) ? 0xffffff : 0x888888);
            this.bg.fillColor = (this.targetWeapon && this.targetWeapon.activated) ? 0x4f4b46 : 0x35302a;
            this.each((obj) => { obj.update(); });
        }
    }
    exports.WeaponFrame = WeaponFrame;
    class BuffIcon extends Phaser.GameObjects.Container {
        constructor(scene, x, y, buff, subsTexture, frame) {
            super(scene, x, y);
            this.buff = buff;
            this.isOver = false;
            this.len = buff.UIimportant ? 26 : 18;
            let rect = new Phaser.GameObjects.Rectangle(this.scene, 0, 0, buff.UIimportant ? 26 : 18, buff.UIimportant ? 26 : 18, buff.color.clone().darken(50).color);
            rect.setOrigin(0, 0);
            this.add(rect);
            if (scene === undefined) {
                console.warn("?!");
            }
            let dspr = new dSprite_1.dSprite(scene, 1, 1, buff.imageKey, subsTexture, buff.iconId);
            dspr.setOrigin(0);
            if (buff.tintIcon) {
                dspr.setTint(buff.color.color);
            }
            this.add(dspr);
            if (buff.countTime) {
                this.timeRemain = new Phaser.GameObjects.Rectangle(this.scene, this.len, 0, this.len, this.len, 0x000000, 0.45);
                this.timeRemain.setOrigin(1, 0);
                this.add(this.timeRemain);
            }
            if (buff.stackable) {
                this.stacks = new Phaser.GameObjects.BitmapText(this.scene, this.len - 1, buff.UIimportant ? this.len + 1 : this.len - 1, buff.UIimportant ? 'mediumPx' : 'smallPx_HUD', '1');
                this.stacks.setOrigin(1);
                this.stacks.setTint(0xffffff);
                this.stacks.depth = 10;
                this.add(this.stacks);
            }
            rect.setInteractive();
            rect.on('pointerover', () => {
                UIScene_1.UIScene.getSingleton().showToolTip(this.buff.getToolTip());
            });
            rect.on('pointerout', () => { UIScene_1.UIScene.getSingleton().hideToolTip(); });
        }
        update() {
            if (this.buff.countTime) {
                if (this.buff.timeRemain.length > 0) {
                    this.timeRemain.width = ((this.buff.timeMax - this.buff.timeRemain[0]) / this.buff.timeMax) * (this.len);
                }
                else {
                    this.timeRemain.width = this.len;
                }
                this.timeRemain.x = this.len;
                this.timeRemain.setOrigin(1, 0);
            }
            if (this.buff.stackable) {
                this.stacks.text = this.buff.stacks.toString();
            }
        }
    }
    exports.BuffIcon = BuffIcon;
    // export class BuffFrame extends ScrollMaskedContainer
    class BuffFrame extends Phaser.GameObjects.Container {
        constructor(scene, x, y, globalX, globalY, width, height, target) {
            // super(scene, x, y, width, height, ScrollDirc.Horizontal, globalX, globalY);
            super(scene, x, y);
            this.target = target;
            this.icons = [];
            let len = 0;
            this.more = new dSprite_1.dSprite(this.scene, 0, 1, 'img_more_buff');
            this.more.alpha = 0.0;
            this.more.setOrigin(0, 0);
            this.add(this.more);
            this.more.on('pointerover', () => { UIScene_1.UIScene.getSingleton().showToolTip(this.getToolTipAllBuffs()); });
            this.more.on('pointerout', () => { UIScene_1.UIScene.getSingleton().hideToolTip(); });
            let buffList = this.obtainList();
            let bLen = buffList.length;
            buffList = buffList.slice(0, 7);
            for (let buff of buffList) {
                let bI = new BuffIcon(this.scene, len, 0, buff);
                len += bI.len + 2;
                this.icons.push(bI);
                this.add(bI);
            }
            if (bLen > 7) {
                this.hasMore(len);
            }
            else {
                this.noMore();
            }
            // this.updateContentLength();
        }
        compare(a, b) {
            if (a.UIimportant && (!b.UIimportant)) {
                return -1;
            }
            else if ((!a.UIimportant) && b.UIimportant) {
                return 1;
            }
            else {
                return b.UIpriority - a.UIpriority;
            }
        }
        compareIcon(a, b) {
            return this.compare(a.buff, b.buff);
        }
        obtainList() {
            return this.target.buffList.slice().sort(this.compare);
        }
        // update(time: number, dt: number)
        // {
        //     if (this.target._buffListDirty)
        //     {
        //         this.removeAll(true);
        //         let len = 0;
        //         let buffList = this.obtainList();
        //         for (let buff of buffList)
        //         {
        //             let bI = new BuffIcon(this.scene, len, 0, buff);
        //             len += bI.len + 2;
        //             this.add(bI);
        //         }
        //         this.target._buffListDirty = false;
        //     }
        //     this.each((obj: Phaser.GameObjects.GameObject) => { obj.update(); });
        // }
        hasMore(len) {
            this.scene.tweens.add({
                targets: this.more,
                x: len,
                alpha: 1,
                duration: 250,
                ease: 'Power1'
            });
            this.more.setInteractive();
        }
        noMore() {
            this.scene.tweens.add({
                targets: this.more,
                alpha: 0,
                duration: 250,
                ease: 'Power1'
            });
            this.more.disableInteractive();
        }
        update(time, dt) {
            if (this.target._buffListDirty) {
                let newList = this.obtainList();
                let bLen = newList.length;
                newList = newList.slice(0, 7);
                let newIcons = [];
                let iOld = 0;
                let iNew = 0;
                while (iNew < newList.length || iOld < this.icons.length) {
                    if ((iNew < newList.length && iOld < this.icons.length) && newList[iNew].toString() === this.icons[iOld].buff.toString()) {
                        iNew++;
                        iOld++;
                    }
                    else if (iNew < newList.length) {
                        let iiOld = iOld + 1;
                        let flag = false;
                        while (iiOld < this.icons.length && this.compare(this.icons[iiOld].buff, newList[iNew]) <= 0) {
                            // We found the same buff
                            if (this.icons[iiOld].buff.toString() == newList[iNew].toString()) {
                                // We need to delete everything between iOld & iiOld
                                flag = true;
                                break;
                            }
                            iiOld++;
                        }
                        if (flag) {
                            // remove iOld ~ iiOld from the container
                            for (let ix = iOld; ix < iiOld; ix++) {
                                this.icons[ix].isOver = true;
                                this.removeBuffIcon(this.icons[ix]);
                            }
                            iOld = iiOld;
                        }
                        else {
                            // iNew is a new buff
                            // Add iNew to the container
                            let bI = new BuffIcon(this.scene, 0, 0, newList[iNew]);
                            bI.alpha = 0.0;
                            newIcons.push(bI);
                            this.add(bI);
                            iNew++;
                        }
                    }
                    else {
                        // Delete everything after iOld
                        for (let ix = iOld; ix < this.icons.length; ix++) {
                            this.icons[ix].isOver = true;
                            this.removeBuffIcon(this.icons[ix]);
                        }
                        iOld = this.icons.length;
                    }
                }
                this.icons = this.icons.filter((value) => !value.isOver);
                this.icons.push(...newIcons);
                // Calculate new positions
                this.icons = this.icons.sort((a, b) => this.compare(a.buff, b.buff));
                let len = 0;
                for (let icon of this.icons) {
                    if (true) {
                        this.scene.tweens.add({
                            targets: icon,
                            x: len,
                            alpha: 1.0,
                            duration: 250,
                            ease: 'Power1'
                        });
                    }
                    else {
                        icon.x = len;
                        icon.alpha = 1.0;
                    }
                    len += icon.len + 2;
                }
                if (bLen > 7) {
                    this.hasMore(len);
                }
                else {
                    this.noMore();
                }
                // this.updateContentLength();
            }
            this.each((obj) => { obj.update(); });
        }
        removeBuffIcon(bufficon) {
            this.scene.tweens.add({
                targets: bufficon,
                // x: -24,
                alpha: 0.0,
                duration: 100,
                onComplete: () => {
                    this.remove(bufficon, true);
                }
            });
        }
        getToolTipAllBuffs() {
            let list = this.obtainList();
            let tt = "";
            for (let buff of list) {
                tt += Helper_1.Helper.toolTip.colored(buff.getTitle(), Helper_1.ColorToStr(buff.color)) + "<br>";
            }
            return {
                "title": this.target.name,
                "text": tt,
                "color": "#ffffff"
            };
        }
    }
    exports.BuffFrame = BuffFrame;
    class UnitFrame extends Phaser.GameObjects.Container {
        constructor(scene, x, y, target) {
            super(scene, x, y);
            this.targetMob = target;
            // this.add(new Phaser.GameObjects.BitmapText(this.scene, 0, 0, 'simsun_o', target.mobData.name + ": 魔法值"));
            // this.add(new Phaser.GameObjects.BitmapText(this.scene, 0, 3, 'smallPx', "Mana of testGirl0"));
            // Name
            let txt = new Phaser.GameObjects.BitmapText(this.scene, 0, 9, Localization_1._('UIFont'), target.mobData.name);
            txt.setOrigin(0, 1);
            this.add(txt);
            // Avatar
            let avatar = new Phaser.GameObjects.Image(this.scene, 0, 3, 'elf', 0);
            avatar.setOrigin(1, 0);
            this.add(avatar);
            // Weapon, TODO: switch weapons on click
            this.wpCurrent = new WeaponFrame(this.scene, 85, 7, this.targetMob.mobData.currentWeapon);
            this.wpAlter = new WeaponFrame(this.scene, 115, 7, this.targetMob.mobData.anotherWeapon);
            this.wpCurrent.wpIcon.setInteractive();
            this.wpCurrent.wpIcon.on('pointerdown', () => { this.switchWeapon(); });
            this.wpAlter.wpIcon.setInteractive();
            this.wpAlter.wpIcon.on('pointerdown', () => { this.switchWeapon(); });
            this.add(this.wpCurrent);
            this.add(this.wpAlter);
            // Health
            this.add(new ProgressBar_1.ProgressBar(this.scene, 0, 10, () => {
                return [target.mobData.currentHealth, target.mobData.maxHealth];
            }, 80, 22, 1, true, 0x444444, 0x000000, 0x42a85d, true, 'smallPx_HUD', ProgressBar_1.TextAlignment.Left, 5, 3, 0xffffff));
            // Mana
            this.add(new ProgressBar_1.ProgressBar(this.scene, 0, 30, () => {
                return [target.mobData.currentMana, target.mobData.maxMana];
            }, 80, 5, 1, true, 0x444444, 0x222222, 0x33A6B8, GameData_4.GameData.showManaNumber, 'smallPx_HUD', ProgressBar_1.TextAlignment.Left, 5, -1, 0xffffff, undefined, true, 0x00000055));
            // // Buffs
            let bF = new BuffFrame(this.scene, -28, 37, x - 28, y + 37, 160, 30, this.targetMob.mobData);
            bF.depth = 0;
            this.add(bF);
            // Current Spell
            this.castingBar = new ProgressBar_1.ProgressBar(this.scene, 30, 27, () => {
                if (this.targetMob.mobData.inCasting) {
                    return [(this.targetMob.mobData.castTime - this.targetMob.mobData.castRemain), this.targetMob.mobData.castTime];
                }
                else if (this.targetMob.mobData.inChanneling) {
                    return [this.targetMob.mobData.channelRemain, this.targetMob.mobData.channelTime];
                }
                return undefined; // leave it unchanged
            }, 50, 4, 1, false, 0x444444, 0x20604F, 0xffe8af, true, Localization_1._('UIFont_o'), ProgressBar_1.TextAlignment.Left, 54, -8, 0xffffff, () => {
                if (this.targetMob.mobData.currentSpell) {
                    return Localization_1._(this.targetMob.mobData.currentSpell.name);
                }
                return undefined; // leave it unchanged
            }, false, 0x000000aa);
            this.add(this.castingBar);
            this.castingBar.depth = 40;
        }
        switchWeapon() {
            // TODO: switch the weapon
            let res = this.targetMob.mobData.switchWeapon();
            if (res === false) {
                return;
            }
            this.wpCurrent.setWeapon(this.targetMob.mobData.anotherWeapon);
            this.wpAlter.setWeapon(this.targetMob.mobData.currentWeapon);
            this.scene.add.tween({
                targets: this.wpCurrent,
                x: { from: 115, to: 85 },
                duration: 200,
            });
            this.scene.add.tween({
                targets: this.wpAlter,
                x: { from: 85, to: 115 },
                duration: 200,
            });
        }
        update(time, dt) {
            if (this.targetMob.mobData.inCasting) {
                this.scene.tweens.add({
                    targets: this.castingBar,
                    alpha: 1,
                    duration: 100,
                });
                this.castingBar.fill.fillColor = 0xff91d8;
            }
            else if (this.targetMob.mobData.inChanneling) {
                this.scene.tweens.add({
                    targets: this.castingBar,
                    alpha: 1,
                    duration: 100,
                });
                this.castingBar.fill.fillColor = 0xdcff96;
            }
            else {
                this.scene.tweens.add({
                    targets: this.castingBar,
                    alpha: 0,
                    duration: 100,
                });
            }
            this.each((obj) => { obj.update(); });
        }
    }
    exports.UnitFrame = UnitFrame;
});
/** @packageDocumentation @module Core */
define("Engine/Core/BattleMonitor", ["require", "exports", "Engine/Core/GameData", "Engine/Core/UnitManager"], function (require, exports, GameData_5, UnitManager_3) {
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
            if (UnitManager_3.UnitManager.getCurrent().enemy.size > 0 && UnitManager_3.UnitManager.getCurrent().getPlayerList(UnitManager_3.UnitManager.IDENTITY, UnitManager_3.UnitManager.NOOP, false).length > 0) {
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
                    if (dmg.type !== GameData_5.GameData.Elements.heal) {
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
                        0xffc477,
                        0xff7777
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
                        0x00ff00,
                        0xff0000
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
/**
 * @packageDocumentation
 * @module UI
 */
define("Engine/UI/MonitorFrame", ["require", "exports", "Engine/Core/BattleMonitor", "Engine/UI/Localization", "Engine/Core/GameData", "Engine/UI/ScrollMaskedContainer", "Engine/UI/UIScene"], function (require, exports, BattleMonitor_1, Localization_2, GameData_6, ScrollMaskedContainer_1, UIScene_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MonitorRow extends Phaser.GameObjects.Container {
        constructor(scene, x, y, refWidth = 100, bgColor = 0xff0000, height = 18, textGap = 1, getToolTip = MonitorRow.getDamageToolTip) {
            super(scene, x, y);
            this.consTotal = true;
            this.consSecond = false;
            this.refWidth = refWidth;
            this.bg = new Phaser.GameObjects.Rectangle(this.scene, 0, 0, 2 + this.refWidth, height, bgColor, 0.2);
            this.bg.setOrigin(0);
            this.bg.on('pointerover', () => { this.bg.fillAlpha = 0.6; UIScene_2.UIScene.getSingleton().showToolTip(this.getToolTip(this)); });
            this.bg.on('pointerout', () => { this.bg.fillAlpha = 0.2; UIScene_2.UIScene.getSingleton().hideToolTip(); });
            this.bg.on('pointerdown', () => { if (this.rowData) {
                console.log(this.rowData.player);
            } });
            this.bg.on('wheel', (evt) => { this.parentContainer.onWheel(evt); });
            this.add(this.bg);
            this.slTwo = new Phaser.GameObjects.Rectangle(this.scene, 1, height - 2, this.refWidth, 1, 0xffffff);
            this.slTwo.setOrigin(0);
            this.add(this.slTwo);
            this.slOne = new Phaser.GameObjects.Rectangle(this.scene, 1, height - 2, this.refWidth, 1, 0xffffff);
            this.slOne.setOrigin(0);
            this.add(this.slOne);
            this.playerName = new Phaser.GameObjects.BitmapText(this.scene, 2, height - 2 - textGap, Localization_2._("UIFont"), "Player");
            this.playerName.setAlpha(0.5);
            this.playerName.setOrigin(0, 1);
            this.valueText = new Phaser.GameObjects.BitmapText(this.scene, this.refWidth + 2, height - 2 - textGap, "smallPx_HUD", "255,630");
            this.valueText.setOrigin(1, 1);
            this.add(this.playerName);
            this.add(this.valueText);
            this.getToolTip = getToolTip;
            this.setRow(undefined, 0, 0);
        }
        getToolTip(self) { return { title: 'NO', text: 'NO' }; }
        static getDamageToolTip(self) {
            let text = "<div>";
            let playerData = BattleMonitor_1.BattleMonitor.getSingleton().damageDict[self.rowData.player.name];
            if (playerData) {
                let bySpell = playerData.spellDict;
                let allSpell = [];
                for (let spell in bySpell) {
                    allSpell.push({ spell: spell, val: bySpell[spell].total });
                }
                allSpell.sort((a, b) => {
                    return b.val - a.val;
                });
                for (let spV of allSpell) {
                    let spell = spV.spell;
                    text +=
                        `<p>
                    <span>${Localization_2._(spell)}</span><span style="min-width: 100px; text-align: right">${self.formatNumber(bySpell[spell].total, self.consTotal)}, ${(bySpell[spell].total / self.rowData.number * 100).toFixed(2)}%</span>
                </p>`;
                }
            }
            text +=
                `<p style = "margin-top: 10px; color: #ffc477">
                <span>${Localization_2._("totalDmg") + Localization_2._("col_normalDmg")}</span>
                <span style="min-width: 100px; text-align: right">${self.formatNumber(self.rowData.slices[0], self.consTotal)}, ${(self.rowData.slices[0] / self.rowData.number * 100).toFixed(2)}%</span>
            </p>
            <p style = "color: #ff7777">
                <span>${Localization_2._("totalDmg") + Localization_2._("col_critDmg")}</span>
                <span style="min-width: 100px; text-align: right">${self.formatNumber(self.rowData.slices[1], self.consTotal)}, ${(self.rowData.slices[1] / self.rowData.number * 100).toFixed(2)}%</span>
            </p>
            <p style = "color: coral">
                <span>${Localization_2._("totalDmg")}</span>
                <span style="min-width: 100px; text-align: right">${self.formatNumber(self.rowData.number, false)}</span>
            </p>`;
            text += "</div>";
            return {
                title: self.rowData.player.name + Localization_2._(':') + Localization_2._('damage'),
                text: text,
                color: "#ffffff",
            };
        }
        static getHealToolTip(self) {
            let text = "<div>";
            let playerData = BattleMonitor_1.BattleMonitor.getSingleton().healDict[self.rowData.player.name];
            if (playerData) {
                let bySpell = playerData.spellDict;
                let allSpell = [];
                for (let spell in bySpell) {
                    allSpell.push({ spell: spell, val: bySpell[spell].real });
                }
                allSpell.sort((a, b) => {
                    return b.val - a.val;
                });
                for (let spV of allSpell) {
                    let spell = spV.spell;
                    text +=
                        `<p>
                    <span>${Localization_2._(spell)}</span><span style="min-width: 100px; text-align: right">${self.formatNumber(bySpell[spell].real, self.consTotal)}, ${(bySpell[spell].real / self.rowData.number * 100).toFixed(2)}%</span>
                </p>`;
                }
            }
            text +=
                `<p style = "margin-top: 10px; color: #55ff55">
                <span>${Localization_2._("totalHeal")}</span>
                <span style="min-width: 100px; text-align: right">${self.formatNumber(self.rowData.slices[0], false)}</span>
            </p>
            <p style = "color: #ff5555">
                <span>${Localization_2._("totalOverHeal")}</span>
                <span style="min-width: 100px; text-align: right">${self.formatNumber(self.rowData.slices[1], false)}, ${(self.rowData.slices[1] / self.rowData.number * 100).toFixed(2)}%</span>
            </p>`;
            text += "</div>";
            return {
                title: self.rowData.player.name + Localization_2._(':') + Localization_2._('healing'),
                text: text,
                color: "#ffffff",
            };
        }
        formatNumber(num, cons) {
            let postfix = "";
            if (cons) {
                if (num > 1000) {
                    num = num / 1000;
                    postfix = "K";
                }
                if (num > 1000) {
                    num = num / 1000;
                    postfix = "M";
                }
            }
            if (postfix !== "") {
                return num.toFixed(1).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') + postfix;
            }
            return num.toFixed(0).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') + postfix;
        }
        setRow(rowData, maxLen, time) {
            this.rowData = rowData;
            if (rowData == undefined) {
                this.setVisible(false);
                this.bg.disableInteractive();
            }
            else {
                this.setVisible(true);
                this.bg.setInteractive();
                this.slOne.width = (rowData.slices[0] / maxLen * this.refWidth);
                this.slTwo.width = (rowData.length / maxLen * this.refWidth);
                this.slOne.fillColor = rowData.colors[0];
                this.slTwo.fillColor = rowData.colors[1];
                this.playerName.text = rowData.player.name;
                this.valueText.text = this.formatNumber(rowData.number, this.consTotal) + ` (${this.formatNumber(rowData.number / Math.max(0.01, time), this.consSecond)})`;
            }
        }
    }
    exports.MonitorRow = MonitorRow;
    class MonitorFrame extends ScrollMaskedContainer_1.ScrollMaskedContainer {
        constructor(scene, x, y, fetchFunc, width = 125, height = 120, getDetailTooltip) {
            super(scene, x, y, width, height);
            this.rows = [];
            let gap = Localization_2._('UIFont') === 'smallPx' ? 14 : 18;
            let tGap = gap === 18 ? 3 : 0;
            for (let i = 0; i < GameData_6.GameData.playerMax; i++) {
                let mr = new MonitorRow(this.scene, 0, i * gap, width - 2, i % 2 == 0 ? 0x92d7e7 : 0x92d7e7, gap, tGap, getDetailTooltip);
                this.rows.push(mr);
                this.add(mr);
            }
            this.fetchFunc = fetchFunc;
            this.updateContentLength();
        }
        update(time, dt) {
            let result = this.fetchFunc();
            let maxLen = 0;
            for (let i = 0; i < result.length; i++) {
                if (result[i].length > maxLen) {
                    maxLen = result[i].length;
                }
            }
            for (let i = 0; i < this.rows.length; i++) {
                if (i < result.length) {
                    this.rows[i].setRow(result[i], maxLen, BattleMonitor_1.BattleMonitor.getSingleton().time);
                }
            }
            this.each((obj) => { obj.update(); });
        }
    }
    exports.MonitorFrame = MonitorFrame;
});
/**
 * @packageDocumentation
 * @module UI
 */
define("Engine/UI/UIScene", ["require", "exports", "Engine/UI/PopUpManager", "Engine/UI/UnitFrame", "Engine/Core/UnitManager", "Engine/UI/Localization", "Engine/UI/MonitorFrame", "Engine/Core/BattleMonitor", "Engine/Core/mRTypes", "Engine/Core/GameData"], function (require, exports, PopUpManager_2, UnitFrame_1, UnitManager_4, Localization_3, MonitorFrame_1, BattleMonitor_2, mRTypes_2, GameData_7) {
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
            this.add.existing(PopUpManager_2.PopUpManager.register(this));
        }
        create() {
            let tT = document.getElementById("tooltip");
            this.toolTip = {
                toolTip: tT,
                title: tT.querySelector("#title"),
                body: tT.querySelector("#body"),
            };
            if (GameData_7.GameData.mainLanguage !== mRTypes_2.mRTypes.Languages.ENG || GameData_7.GameData.popUpBuffLanguage !== mRTypes_2.mRTypes.Languages.ENG) {
                this.orgMainFont = Localization_3.Localization.data.main.UIFont[GameData_7.GameData.mainLanguage];
                this.orgMainFont_o = Localization_3.Localization.data.main.UIFont_o[GameData_7.GameData.mainLanguage];
                this.orgPopUpFont = Localization_3.Localization.data.popUpBuff.buffFont[GameData_7.GameData.popUpBuffLanguage];
                Localization_3.Localization.data.main.UIFont[GameData_7.GameData.mainLanguage] = 'smallPx';
                Localization_3.Localization.data.main.UIFont_o[GameData_7.GameData.mainLanguage] = 'smallPx';
                Localization_3.Localization.data.popUpBuff.buffFont[GameData_7.GameData.popUpBuffLanguage] = 'smallPx';
                let txt = this.add.bitmapText(10, 10, 'smallPx', "HUD / UI: Loading Unicode Fonts ... ");
                if (GameData_7.GameData.mainLanguage === mRTypes_2.mRTypes.Languages.CHS || GameData_7.GameData.popUpBuffLanguage === mRTypes_2.mRTypes.Languages.CHS) {
                    this.load.bitmapFont('simsun', './assets/fonts/simsun_0.png', './assets/fonts/simsun.fnt');
                    this.load.bitmapFont('simsun_o', './assets/fonts/simsun_outlined_0.png', './assets/fonts/simsun_outlined.fnt');
                }
                if (GameData_7.GameData.mainLanguage === mRTypes_2.mRTypes.Languages.JPN || GameData_7.GameData.popUpBuffLanguage === mRTypes_2.mRTypes.Languages.JPN) {
                    this.load.bitmapFont('mspgothic', './assets/fonts/mspgothic_0.png', './assets/fonts/mspgothic.fnt');
                    this.load.bitmapFont('mspgothic_o', './assets/fonts/mspgothic_o_0.png', './assets/fonts/mspgothic_o.fnt');
                }
                this.load.on('complete', () => { this.loadComplete(); });
                this.load.on('progress', (value) => { txt.text = `[${(value * 100).toFixed(1)}%] HUD / UI: Loading Unicode Fonts ... `; });
                this.load.start();
            }
            this.loaded = true;
            PopUpManager_2.PopUpManager.getSingleton().hasLoaded();
            this.setupScene();
            // Used for checking window size changes
            this.mainCanvas = document.getElementById('GameFrame');
            this.prevLeft = this.mainCanvas.offsetLeft;
        }
        loadComplete() {
            Localization_3.Localization.data.main.UIFont[GameData_7.GameData.mainLanguage] = this.orgMainFont;
            Localization_3.Localization.data.main.UIFont_o[GameData_7.GameData.mainLanguage] = this.orgMainFont_o;
            Localization_3.Localization.data.popUpBuff.buffFont[GameData_7.GameData.popUpBuffLanguage] = this.orgPopUpFont;
            this.setupScene();
        }
        setupScene() {
            if (this.children.length > 0) {
                for (let child of this.children.getAll()) {
                    child.destroy();
                }
            }
            // Background
            this.add.rectangle(512, 586, 1024, 148, 0x222222);
            this.add.rectangle(512, 510, 1024, 4, 0xd3cfc2);
            this.initUnitFrames();
            // this.add.rectangle(750 + 61, 520 + 8, 122, 16, 0x948779);
            let bt = this.add.bitmapText(755, 530, Localization_3._("UIFont"), Localization_3._("Damage Done (DPS)"));
            bt.setOrigin(0, 1);
            // this.add.rectangle(880 + 61, 520 + 8, 122, 16, 0x948779);
            bt = this.add.bitmapText(885, 530, Localization_3._("UIFont"), Localization_3._("Healing Done (HPS)"));
            bt.setOrigin(0, 1);
            this.add.existing(new MonitorFrame_1.MonitorFrame(this, 750, 534, () => { return BattleMonitor_2.BattleMonitor.getSingleton().getDamageList(); }, 122, 114, MonitorFrame_1.MonitorRow.getDamageToolTip));
            this.add.existing(new MonitorFrame_1.MonitorFrame(this, 880, 534, () => { return BattleMonitor_2.BattleMonitor.getSingleton().getHealList(); }, 122, 114, MonitorFrame_1.MonitorRow.getHealToolTip));
            this.add.existing(PopUpManager_2.PopUpManager.register(this));
            PopUpManager_2.PopUpManager.getSingleton().hasLoaded();
            PopUpManager_2.PopUpManager.getSingleton().depth = 100000;
        }
        clearUnitFrame() {
            for (let u of this.unitFrames) {
                u.destroy();
            }
            this.unitFrames = [];
        }
        resetPlayers() {
            this.clearUnitFrame();
            this.playerCache = Array.from(UnitManager_4.UnitManager.getCurrent().player.values());
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
                let x = 35 + (cnt % 4) * 180;
                let y = 522 + Math.floor(cnt / 4) * 70;
                let tmp = new UnitFrame_1.UnitFrame(this, x, y, player);
                // let bF = new BuffFrame(this, x - 28, y + 37, x - 28, y + 37, 160, 30, player.mobData);
                // let tmp = new UnitFrame(this, 20, 20 + cnt * 70, player);
                // this.add.existing(bF);
                this.add.existing(tmp);
                this.unitFrames.push(tmp);
                cnt += 1;
            }
        }
        update(time, dt) {
            // Check if offsets are changed
            if (this.mainCanvas.offsetLeft !== this.prevLeft) {
                this.prevLeft = this.mainCanvas.offsetLeft;
                this.scale.updateBounds();
            }
            this.children.each((item) => { item.update(time / 1000.0, dt / 1000.0); });
        }
        showToolTip(tip) {
            // change text
            this.toolTip.title.innerHTML = tip.title;
            this.toolTip.body.innerHTML = tip.text;
            // change color
            this.toolTip.title.style.color = tip.color;
            if (tip.bodyStyle) {
                this.toolTip.body.style.cssText = tip.bodyStyle;
            }
            else {
                this.toolTip.body.style.cssText = "";
            }
            // set it visible
            this.toolTip.toolTip.style.display = "inherit";
            this.toolTip.toolTip.lang = GameData_7.GameData.mainLanguage;
        }
        hideToolTip() {
            // set it invisible
            this.toolTip.toolTip.style.display = "none";
        }
    }
    exports.UIScene = UIScene;
});
/**
 * @packageDocumentation
 * @module UI
 */
define("Engine/UI/PopUpManager", ["require", "exports", "Engine/Core/GameData", "Engine/UI/Localization"], function (require, exports, GameData_8, Localization_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // import * as Phaser from 'phaser'
    class PopupText extends Phaser.GameObjects.BitmapText {
        constructor(scene, x, y, text, color, time = 1.0, velX = -64, velY = -256, accX = 0.0, accY = 512.0, isBuff = false) {
            if (isBuff) {
                let font = Localization_4._('buffFont');
                super(scene, x, y, font, text);
            }
            else {
                super(scene, x, y, GameData_8.GameData.popUpSmallFont ? 'smallPx' : 'mediumPx', text);
            }
            this.time = time;
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
        hasLoaded() {
            this.loaded = true;
        }
        addText(text, posX = 100, posY = 100, color = new Phaser.Display.Color(255, 255, 255, 255), time = 1.0, velX = -64, velY = -256, // jumping speed
        accX = 0.0, // gravity
        accY = 512) {
            if (this.loaded) {
                let txt = new PopupText(this.scene, posX, posY, text, color.color, time, velX, velY, accX, accY);
                this.add(txt);
            }
        }
        addText_nonDigit(text, posX = 100, posY = 100, color = new Phaser.Display.Color(255, 255, 255, 255), time = 1.0, velX = -64, velY = -256, // jumping speed
        accX = 0.0, // gravity
        accY = 512) {
            if (this.loaded) {
                let txt = new PopupText(this.scene, posX, posY, text, color.color, time, velX, velY, accX, accY, true);
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
define("Engine/Core/Buff", ["require", "exports", "Engine/Core/MobListener", "Engine/UI/PopUpManager", "Engine/Core/GameData", "Engine/UI/Localization"], function (require, exports, MobListener_1, PopUpManager_3, GameData_9, Localization_5) {
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
            this.timeRemain = [settings.time]; // || this.timeMax;
            //Is the buff over? (should be removed from buff list)
            this.isOver = false;
            //stacks of the buff (if any)
            this.stacks = settings.stacks || 1;
            this.stackable = settings.stackable || false;
            this.maxStack = settings.maxStack || 3;
            //cellIndex of this buff in the buffIcons image, might be shown under boss lifebar / player lifebar
            this.imageKey = settings.imageKey;
            this.iconId = settings.iconId || 0;
            this.tintIcon = settings.tintIcon || false;
            //the color used for UI rendering
            this.color = settings.color || Phaser.Display.Color.HexStringToColor('#56CDEF');
            //when the buff was attached or triggered, a small text will pop up like damages e.g. "SLOWED!"
            this.popupName = settings.popupName || "buff";
            //Color for the popup text. default is this.color.
            this.popupColor = settings.popupColor || this.color;
            //Where does this buff come from?
            this.source = settings.source || undefined;
            if (this.source === undefined) {
                console.error(`Buff "${Localization_5._(this.name)}" does not have a source.`);
            }
            this.toolTip = settings.toolTip || "LOL.";
            this.UIimportant = (settings.UIimportant === undefined) ? false : settings.UIimportant;
            this.UIpriority = (settings.UIpriority === undefined) ? 0 : settings.UIpriority;
        }
        popUp(mob) {
            let popUpPos = mob.getTopCenter();
            PopUpManager_3.PopUpManager.getSingleton().addText_nonDigit((typeof this.popupName === 'string') ? Localization_5._(this.popupName) : this.popupName[GameData_9.GameData.popUpBuffLanguage], popUpPos.x, popUpPos.y, this.popupColor, 1.0, 0, -64, 0, 64);
        }
        update(self, dt) {
            super.update(self, dt);
            if (this.countTime == true) {
                for (let i = 0; i < this.timeRemain.length; i++) {
                    this.timeRemain[i] -= dt;
                    if (this.timeRemain[i] <= 0) {
                        this.stacks -= 1;
                    }
                }
                this.timeRemain = this.timeRemain.filter((v) => (v > 0));
                // console.log(this.stacks);
                if (this.stacks == 0) {
                    this.isOver = true;
                }
            }
        }
        preToolTip() { return { title: undefined, text: "", color: Phaser.Display.Color.RGBToString(this.color.red, this.color.green, this.color.blue) }; }
        getTitle() {
            return Localization_5._(this.name) + (this.stackable ? ` (${this.stacks})` : "");
        }
        getToolTip() {
            let tt = this.preToolTip();
            return {
                "title": `<div><p style='margin:0;'><span>${tt.title || this.getTitle()}</span><span>(${this.timeRemain.length > 0 ? this.timeRemain[0].toFixed(1) : 0}s)</span></p></div>`,
                "text": `
            <div style = "max-width: 200px">
                <p>
                    ${eval("`" + Localization_5._(this.toolTip) + "`") + tt.text}
                </p>
                ${this.source ? `<p class = "buffFroms"><span></span><span>${Localization_5._('buffTT_from') + this.source.name}</span></p>` : ``}
            </div>`,
                "color": tt.color,
                'bodyStyle': 'margin-left: 0; margin-right: 0;'
            };
        }
        /**
         * Addes one stack of itself.
         */
        addStack(time) {
            if (this.stacks < this.maxStack) {
                this.stacks += 1;
                this.timeRemain.push(time);
                return true;
            }
            return false;
        }
        keyFn() {
            return `${this.name}-${this.source.name}`;
        }
        static fromKey(key, overrideSettings) {
            let cached = Buff.parsedBuffInfo[key];
            if (cached === undefined) {
                console.warn(`Buff key "${key}" does not exist.`);
            }
            return Object.assign(Object.assign({}, cached), overrideSettings);
        }
    }
    exports.Buff = Buff;
});
/** @packageDocumentation @module Core */
define("Engine/Core/MobData", ["require", "exports", "Engine/Events/EventSystem", "Engine/Core/EquipmentCore", "Engine/Structs/QuerySet", "Engine/Core/MobListener", "Engine/Core/DataBackend", "Engine/Core/Buff", "Engine/Core/GameData", "Engine/Core/BattleMonitor"], function (require, exports, EventSystem, EquipmentCore_1, QuerySet_1, MobListener_2, DataBackend_1, Buff_1, GameData_10, BattleMonitor_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    EventSystem = __importStar(EventSystem);
    var EquipSlots;
    (function (EquipSlots) {
        EquipSlots["MainHand"] = "weaponMainHand";
        EquipSlots["SubHand"] = "weaponSubHand";
        EquipSlots["Body"] = "armor";
        EquipSlots["Accessories"] = "accessory";
    })(EquipSlots = exports.EquipSlots || (exports.EquipSlots = {}));
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
            this.job = settings.job || "unknown";
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
            this.equip(settings.weaponSubHand, EquipSlots.SubHand);
            this.equip(settings.weaponMainHand, EquipSlots.MainHand);
            this.equip(settings.armor, EquipSlots.Body);
            this.equip(settings.accessory, EquipSlots.Accessories);
            this.currentWeapon = this.weaponSubHand;
            this.anotherWeapon = this.weaponMainHand;
            // Should we switch the weapon now ?
            this.shouldSwitchWeapon = false;
            // Is this mob a player?
            this.isPlayer = settings.isPlayer || false;
            // How much taunt will this mob generate?
            this.tauntMul = settings.tauntMul || 1.0;
            this.beingAttack = 0;
            this.healPriority = false;
            // A Specific identify name only for this mob
            // Use EventElement.UID instead.
            // this.ID = DataBackend.getSingleton().getID();
            // ref for MobListeners (buffs, agent, weapons, armor, ...)
            /** test */
            this.listeners = new QuerySet_1.QuerySet();
            this.listeners.addQuery('buff', (arg) => (arg.type == MobListener_2.MobListenerType.Buff), undefined);
            this.listeners.addQuery('priority', undefined, (l, r) => (r.priority - l.priority));
            // buff list, only for rendering UI
            // buffs are actually plain mob listeners
            // maybe they have something different (x)
            this.buffList = [];
            // spell list, only for spells with cooldowns.
            this.spells = {};
            // Which class should be used when realize this mob ?
            this.mobConstructor = settings.mobConstructor; // || game.Mobs.TestMob;
            // I finally added this ... (x)
            this.parentMob = undefined;
        }
        canSwitchWeapon() {
            return typeof this.anotherWeapon !== "undefined";
        }
        switchWeapon() {
            if (this.canSwitchWeapon()) {
                this.shouldSwitchWeapon = true;
                return true;
            }
            return false;
        }
        getPercentage(parameter) {
            // TODO: convert parameter to percentage from level
            return parameter;
        }
        getAtkPower(type) {
            return Math.pow(1.0353, this.battleStats.attackPower[GameData_10.GameData.damageType[type]] +
                this.battleStats.attackPower[type]);
        }
        getResist(type) {
            return Math.pow(0.9659, this.battleStats.resist[GameData_10.GameData.damageType[type]] +
                this.battleStats.resist[type]);
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
                if (this.canSwitchWeapon()) {
                    var tmp = this.currentWeapon;
                    this.currentWeapon = this.anotherWeapon;
                    this.anotherWeapon = tmp;
                }
                // We already switched them !
                this.removeListener(this.anotherWeapon);
                this.addListener(this.currentWeapon);
                this.anotherWeapon.activated = false;
                this.currentWeapon.activated = true;
                // I switched my weapon !!!
                this.updateListeners('switchWeapon', this, this.currentWeapon);
            }
            // Update all listeners
            this.updateListeners('update', this, dt);
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
            let dirty = true;
            let flag = true;
            this.addListener(buff, buff.source, (arg) => {
                flag = false;
                dirty = false;
                if (arg instanceof Buff_1.Buff) {
                    if (arg.stackable === true) {
                        flag = arg.addStack(buff.timeRemain[0]);
                        // arg.emit('added', undefined, this, arg.source);
                    }
                    buff.discard();
                    buff.timeRemain = [];
                    buff.stacks = 0;
                    buff.isOver = true;
                }
                return false;
            });
            if (dirty) {
                this.buffList = (this.listeners.query('buff'));
                this._buffListDirty = true;
            }
            return flag;
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
                if (listener.type === MobListener_2.MobListenerType.Buff) {
                    this.buffList = (this.listeners.query('buff'));
                    this._buffListDirty = true;
                }
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
        equip(equipment, slot) {
            if (equipment) {
                // TODO: Check if equippable !
                this[slot] = equipment;
                equipment.equipper = this;
                if (equipment instanceof EquipmentCore_1.Weapon) {
                    if (typeof this.currentWeapon === 'undefined') {
                        this.currentWeapon = equipment;
                        equipment.activated = true;
                        this.addListener(this.currentWeapon);
                    }
                    else if (typeof this.anotherWeapon === 'undefined') {
                        this.anotherWeapon = equipment;
                    }
                }
                return true;
            }
            return false;
        }
        /**
         * Event 'statChange' - emitted while a listener (buff, weapon, etc.) needs to change the stat of parent mob.
         * @param listener The listener that triggered a stat change
         * @event
         */
        onStatChange(listener) {
            this.calcStats(this.parentMob); // Listeners were notified inside this method.
        }
        // FIXME: Just wrote with some random calculations for testing. Please balance the calculation step !!
        calcStats(mob) {
            // TODO: Stats calculation:
            // 1. Calculate (get) base stats from self
            for (let stat in this.baseStats) {
                this.baseStats[stat] = this.baseStatsFundemental[stat];
            }
            // 2. Add equipment base stats to self by listener.calcBaseStats()
            this.updateListeners('baseStatCalculation', this);
            // 3. Reset battle stats
            this.battleStats = {
                resist: {
                    physical: this.baseStats.vit,
                    elemental: this.baseStats.mag,
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
                    physical: this.baseStats.str,
                    elemental: this.baseStats.int,
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
                hitAcc: 85 + this.baseStats.tec * 5,
                avoid: 0,
                // Percentage
                crit: this.baseStats.tec,
                antiCrit: 0,
                // Parry for shield should calculate inside the shield itself when onReceiveDamage().
                attackRange: 0,
                extraRange: 0,
            };
            this.tauntMul = 1.0;
            // Go back to base speed
            this.modifiers.speed = 1.0 + this.baseStats.dex * 0.05;
            this.modifiers.movingSpeed = 1.0 + this.baseStats.dex * 0.05;
            this.modifiers.attackSpeed = 1.0 + this.baseStats.dex * 0.05;
            this.modifiers.spellSpeed = 1.0 + this.baseStats.dex * 0.05;
            this.modifiers.resourceCost = 1.0 * Math.pow(0.95, this.baseStats.int);
            // Calculate health from stats
            this.healthRatio = this.currentHealth / this.maxHealth;
            this.maxHealth =
                this.baseStats.vit * 10
                    + this.baseStats.str * 8
                    + this.baseStats.dex * 4
                    + this.baseStats.tec * 4
                    + this.baseStats.int * 4
                    + this.baseStats.mag * 4;
            // And mana
            let manaRatio = this.currentMana / this.maxMana;
            this.maxMana = this.baseStats.mag * 10 + this.baseStats.int * 4;
            this.maxMana = Math.ceil(this.maxMana);
            this.currentMana = Math.max(0, Math.ceil(manaRatio * this.maxMana));
            this.manaRegen = this.baseStats.mag * 0.4;
            // TODO - 4. Calculate battle (advanced) stats from base stats (e.g. atkPower = INT * 0.7 * floor( MAG * 1.4 ) ... )
            // 5. Add equipment by listener.calcStats()
            // Actually, those steps were combined in a single call,
            // as the calculation step of each class will happen in their player classes,
            // which should be the first called listener in updateListeners().
            this.updateListeners('statCalculation', this);
            this.updateListenersRev('statCalculationFinish', this);
            // 5. Finish
            this.maxHealth = Math.ceil(this.maxHealth);
            this.currentHealth = Math.max(0, Math.ceil(this.healthRatio * this.maxHealth));
        }
        receiveDamageHeal(damageInfo) {
            let isHeal = (damageInfo.type === GameData_10.GameData.Elements.heal);
            if (isHeal) {
                this.updateListeners('receiveHeal', damageInfo);
                if (damageInfo.source) {
                    damageInfo.source.updateListeners('dealHeal', damageInfo);
                }
            }
            else {
                this.updateListeners('receiveDamage', damageInfo);
                if (damageInfo.source) {
                    damageInfo.source.updateListeners('dealDamage', damageInfo);
                }
            }
            let result = {
                source: damageInfo.source,
                target: this,
                value: damageInfo.value,
                type: damageInfo.type,
                overdeal: 0,
                isCrit: false,
                isAvoid: false,
                isBlock: false,
                spell: damageInfo.spell,
            };
            // Calculate crit based on parameters
            // Basically you don't want to avoid the hit or crit of a healing ... do you ?
            // TODO: levels?
            result.isCrit = (100 * Math.random()) < (damageInfo.crit - (isHeal ? 0 : this.getPercentage(this.battleStats.antiCrit)));
            result.isAvoid = (100 * Math.random()) > (damageInfo.hit - (isHeal ? 0 : this.getPercentage(this.battleStats.avoid)));
            // This attack was avoided, tell everyone. They may edit the result so this attack is not avoided ...
            if (result.isAvoid === true) {
                // Let everyone know what is happening
                if (isHeal) {
                    this.updateListenersRev('receiveHealFinal', result);
                    if (result.source) {
                        result.source.updateListenersRev('dealHealFinal', result);
                    }
                }
                else {
                    this.updateListenersRev('receiveDamageFinal', result);
                    if (result.source) {
                        result.source.updateListenersRev('dealDamageFinal', result);
                    }
                }
            }
            // Check if it was finally avoided
            if (result.isAvoid === false) {
                // N.B. if you want do something if target avoid, e.g. deal extra on avoid,
                // you should let it change the damage at onDealDamage() when isAvoid == true. (e.g. set other to 0 and add extra damage)
                // then set isAvoid to false. You can also pop some text when you add the extra damage.
                // damage% = 0.9659 ^ resist
                // This is, every 1 point of resist reduces corresponding damage by 3.41%, 
                // which will reach 50% damage reducement at 20 points.
                // TODO: it should all correspond to current level (resist based on source level, atkPower based on target level, same as healing)
                result.value = Math.ceil(result.value * this.getResist(result.type));
                // Apply criticals
                result.value = Math.ceil(result.value *
                    (result.isCrit ? GameData_10.GameData.critMultiplier[result.type] : 1.0));
                // Overdeals for announcement
                if (isHeal) {
                    let realHeal = Math.min(this.maxHealth - this.currentHealth, result.value);
                    result.overdeal = result.value - realHeal;
                    result.value = realHeal;
                }
                else {
                    let realDmg = Math.min(this.currentHealth, result.value);
                    result.overdeal = result.value - realDmg;
                    result.value = realDmg;
                }
                // Let everyone know what is happening
                if (isHeal) {
                    this.updateListenersRev('receiveHealFinal', result);
                    if (result.source) {
                        result.source.updateListenersRev('dealHealFinal', result);
                    }
                }
                else {
                    this.updateListenersRev('receiveDamageFinal', result);
                    if (result.source) {
                        result.source.updateListenersRev('dealDamageFinal', result);
                    }
                }
                // Overdeals again to confirm everything is fine
                if (isHeal) {
                    let realHeal = Math.min(this.maxHealth - this.currentHealth, result.value);
                    result.overdeal += result.value - realHeal;
                    result.value = realHeal;
                }
                else {
                    let realDmg = Math.min(this.currentHealth, result.value);
                    result.overdeal += result.value - realDmg;
                    result.value = realDmg;
                }
                // Decrese or Increase HP
                this.currentHealth -= (isHeal ? (-result.value) : result.value);
                // Register this to BattleMonitor
                BattleMonitor_3.BattleMonitor.getSingleton().add(result);
                // Check if I am dead
                if (this.currentHealth <= 0) {
                    // Let everyone know what is happening
                    this.updateListenersRev('death', result);
                    if (result.source) {
                        result.source.updateListeners('kill', result);
                    }
                    // If still I am dead
                    if (this.currentHealth <= 0) {
                        // I die cuz I am killed
                        this.alive = false;
                    }
                }
            }
            else {
                result.value = 0;
            }
            // It hits!
            return result;
        }
        // Function used to tell buffs and agents what was going on
        // when damage and heal happens. They can modify them.
        updateListeners(event, ...args) {
            var flag = false;
            this.emitArray(event, (res) => { if (typeof res == "boolean") {
                flag = flag || res;
            } }, args);
            return flag;
        }
        // Same as updateListeners, but all listeners are triggered in reverse order to let them properly revert the values if they have temporally modified them.
        updateListenersRev(event, ...args) {
            var flag = false;
            this.emitArrayReverted(event, (res) => { if (typeof res == 'boolean') {
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
            if (this.currentMana >= (mana * this.modifiers.resourceCost)) {
                this.currentMana -= (mana * this.modifiers.resourceCost);
                return true;
            }
            return false;
        }
        hasMana(mana) {
            if (this.currentMana >= (mana * this.modifiers.resourceCost)) {
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
define("Engine/Core/EquipmentCore", ["require", "exports", "Engine/GameObjects/Mob", "Engine/Core/MobListener", "Engine/Core/InventoryCore", "Engine/Core/Helper", "Engine/Core/GameData", "Engine/UI/Localization"], function (require, exports, Mob_4, MobListener_3, InventoryCore_2, Helper_2, GameData_11, Localization_6) {
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
        get equipper() { return this.user; }
        set equipper(r) { this.user = r; }
        get rawName() {
            return this.itemData.rawName;
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
            if (this.itemData.eClass in EquipmentType) {
                this.eqType = EquipmentType[this.itemData.eClass];
            }
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
            this._atkName = this.itemData.atkName;
            this._spName = this.itemData.spName;
        }
        get atkName() {
            return Localization_6._(this.name) + Localization_6._(':') + Localization_6._(this._atkName);
        }
        get spName() {
            return Localization_6._(this.name) + Localization_6._(':') + Localization_6._(this._spName);
        }
        isInRange(mob, target) {
            if (target instanceof Mob_4.Mob) {
                return (mob.footPos().distance(target.footPos()) < (this.activeRange + mob.mobData.battleStats.attackRange));
            }
            else {
                return (mob.footPos().distance(target) < (this.activeRange + mob.mobData.battleStats.attackRange));
            }
        }
        isInOrMoveInRange(mob, target) {
            if (target instanceof Mob_4.Mob) {
                return (mob.footPos().distance(target.footPos()) < (this.activeRange + mob.mobData.battleStats.attackRange));
            }
            else {
                // Modify target position so that it is inside our range
                let range = this.activeRange + mob.mobData.battleStats.attackRange;
                if (mob.footPos().distance(target) > range) {
                    target.normalize().scale(range);
                }
                return true;
            }
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
        attack(source, target, triggerCD = true, tempSettings = {}) {
            let checkResult = this.checkAttack(source, target);
            if (checkResult.canAttack) {
                if (checkResult.isSpecial) {
                    this.specialAttack(source, checkResult.target, true, true);
                }
                else {
                    this.regularAttack(source, checkResult.target, true, true);
                }
            }
            return checkResult;
        }
        checkAttack(source, target) {
            let flag = { 'canAttack': false, 'isSpecial': false, 'target': target };
            this.isReadyWrapper(() => {
                flag.target = target.filter((v) => this.isInOrMoveInRange(source, v));
                if (target.length <= 0) {
                    flag.canAttack = false;
                }
                else {
                    flag.canAttack = true;
                }
                if (this.weaponGaugeMax > 0 && this.weaponGauge > this.weaponGaugeMax) {
                    flag.isSpecial = true;
                }
            })();
            return flag;
        }
        regularAttack(source, target, triggerCD = true, increaseGauge = true) {
            this.doRegularAttack(source, target);
            if (triggerCD) {
                this.triggerCD();
            }
            if (this.weaponGaugeMax > 0 && increaseGauge) {
                this.weaponGauge += this.weaponGaugeIncreasement(source);
            }
        }
        specialAttack(source, target, triggerCD = true, useGauge = true) {
            if (useGauge) {
                this.weaponGauge -= this.weaponGaugeMax;
                this.weaponGauge = Math.max(0, this.weaponGauge);
            }
            this.doSpecialAttack(source, target);
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
        getDamage(mobData, dmg, dmgType) {
            if (!mobData) {
                return { modified: false, value: dmg };
            }
            let modified = false;
            let pwrCorrect = 1.0;
            pwrCorrect *= mobData.getAtkPower(dmgType);
            if (pwrCorrect > 1.01 || pwrCorrect < 0.99) {
                modified = true;
            }
            return { modified: modified, value: dmg * pwrCorrect };
        }
        getAttackTime(mobData, time) {
            if (!mobData) {
                return { modified: false, value: time };
            }
            let modified = false;
            let mobSpd = (1 / mobData.modifiers.speed) * (1 / mobData.modifiers.attackSpeed);
            if (mobSpd < 0.99 || mobSpd > 1.01) {
                modified = true;
            }
            return { modified: modified, value: mobSpd * time };
        }
        getAttackRange(mobData, range) {
            if (!mobData) {
                return { modified: false, value: range };
            }
            let modified = false;
            if (mobData.battleStats.attackRange > 0) {
                modified = true;
            }
            return { modified: modified, value: mobData.battleStats.attackRange + range };
        }
        getResourceCost(mobData, cost) {
            if (!mobData) {
                return { modified: false, value: cost };
            }
            let modified = false;
            if (mobData.modifiers.resourceCost < 0.99 || mobData.modifiers.resourceCost > 1.01) {
                modified = true;
            }
            return { modified: modified, value: mobData.modifiers.resourceCost * cost };
        }
        getBaseAttackDesc(mobData) {
            return "";
        }
        getSpecialAttackDesc(mobData) {
            return "";
        }
        getToolTip() {
            // Weapon properties:
            // Item Level - Rarity / Primary class - Sub class
            // Attack power (type) / Attack time (DPS)
            // Attack range
            // Energy statement 0 / Max value (Energy type)
            // Equip requirement
            // Weapon special properties (if any)
            // Base attack      cost / (Cost per sec)
            // base attack description
            // Special attack   energy cost
            // Special attack description
            // Weapon description (italic)
            let ttBody = "<div style = 'max-width: 300px; margin: 0;'>";
            //
            // ─── BASIC PROPERTIES ────────────────────────────────────────────
            //
            let th = Helper_2.Helper.toolTip;
            ttBody += th.beginSection();
            // Item Level - Rarity / Primary class - Sub class
            ttBody += th.row(th.column(th.colored(Localization_6._(GameData_11.GameData.rarityName[this.itemData.rarity]), GameData_11.GameData.rarityColor[this.itemData.rarity], 'width: 4.5em;') +
                Localization_6._('itemLevel') + " " + this.itemData.level, 'display:flex;') +
                th.column(Localization_6._(this.itemData.pClass) +
                    (this.itemData.sClass !== "" ?
                        (" - " + Localization_6._(this.itemData.sClass)) :
                        (""))));
            // Attack power (type) & Attack time
            let attackType = GameData_11.GameData.Elements[this.mainElement];
            let dmgMin = this.getDamage(this.equipper, this.baseAttackMin, attackType);
            let dmgMax = this.getDamage(this.equipper, this.baseAttackMax, attackType);
            let atkTime = this.getAttackTime(this.equipper, this.baseAttackSpeed);
            ttBody += th.row(th.column("<strong style = 'width: 4.5em'>" + Localization_6._("atkDmg") + "</strong>" +
                th.colored(`${dmgMin.value.toFixed(1)} - ${dmgMax.value.toFixed(1)} `, dmgMin.modified ? 'aqua' : GameData_11.GameData.ElementColorsStr[attackType]) + " " +
                th.colored(Localization_6._(attackType), GameData_11.GameData.ElementColorsStr[attackType], 'margin-left: 0.45em;'), 'display: flex;') +
                th.column(th.colored(atkTime.value.toFixed(1), atkTime.modified ? 'aqua' : 'white') + " " + Localization_6._("sec")));
            // DPS
            let dpsR = [dmgMin.value / atkTime.value, dmgMax.value / atkTime.value];
            ttBody += th.row(`<strong style = 'width: 4.5em'>${Localization_6._('wpDPS')}</strong>${((dpsR[0] + dpsR[1]) / 2.0).toFixed(1)}`, 'display: flex;');
            // Attack range
            let actRange = this.getAttackRange(this.equipper, this.activeRange);
            ttBody += th.row(th.column(`<strong style = 'width: 4.5em'>${Localization_6._('wpRange')}</strong>` +
                th.colored(actRange.value.toFixed(0), actRange.modified ? 'aqua' : 'white') + " px", 'display: flex;'));
            // Energy statement
            ttBody += th.row(th.column(`<strong style = 'width: 4.5em'>${Localization_6._('wpGauge')}</strong>${this.weaponGauge.toFixed(0)} / ${this.weaponGaugeMax.toFixed(0)}`, 'display: flex;') +
                th.column(this.equipper ?
                    (th.colored("+ " + this.weaponGaugeIncreasement(this.equipper.parentMob), 'aqua') +
                        ` (${Localization_6._(this.weaponGaugeTooltip)})`) :
                    (Localization_6._(this.weaponGaugeTooltip))));
            ttBody += th.switchSection();
            // Equip requirement
            let isFirst = true;
            for (let stat in this.statRequirements) {
                if (this.statRequirements[stat] <= 0) {
                    continue;
                }
                if (isFirst) {
                    isFirst = false;
                    ttBody += th.row(`<strong style = ''>${Localization_6._('wpReq')}</strong>${this.statRequirements[stat].toFixed(0)} ${Localization_6._(stat)}`);
                }
                else {
                    ttBody += th.row(th.column(`${this.statRequirements[stat].toFixed(0)} ${Localization_6._(stat)}`, 'padding-left:4.5em'));
                }
            }
            if (isFirst) {
                ttBody += th.row(Localization_6._('wpNoReq'));
            }
            // Weapon special properties (if any)
            if (false) {
                ttBody += th.switchSection();
            }
            ttBody += th.switchSection();
            // Base attack
            let baseDesc = this.getBaseAttackDesc(this.equipper);
            let rCost = this.getResourceCost(this.equipper, this.manaCost);
            let thisColor = Helper_2.ColorToStr(this.itemData.color);
            ttBody += th.row(th.column(Localization_6._('normalAttack') + " " +
                th.colored(Localization_6._(this._atkName), thisColor)) +
                th.column(th.colored(rCost.value.toFixed(0), (rCost.modified) ? 'aqua' : 'white') +
                    ` ${Localization_6._('mana')} (` +
                    (rCost.value / atkTime.value).toFixed(1) + ` ${Localization_6._('per sec')})`));
            ttBody += th.row((baseDesc && baseDesc.hasOwnProperty(GameData_11.GameData.mainLanguage)) ? baseDesc[GameData_11.GameData.mainLanguage] : baseDesc, '', 'weaponAtkDesc');
            ttBody += th.switchSection();
            let spDesc = this.getSpecialAttackDesc(this.equipper);
            ttBody += th.row(th.column(Localization_6._('specialAttack') + " " +
                th.colored(Localization_6._(this._spName), thisColor)) +
                th.column(`${this.weaponGaugeMax.toFixed(0)} ${Localization_6._('energy')}`));
            ttBody += th.row((spDesc && spDesc.hasOwnProperty(GameData_11.GameData.mainLanguage)) ? spDesc[GameData_11.GameData.mainLanguage] : spDesc, '', 'weaponAtkDesc');
            ttBody += th.switchSection();
            ttBody += "<p style='color: gold;'>" +
                Localization_6._(this.itemData.toolTipText) + "</p>";
            ttBody += th.endSection();
            ttBody += th.endSection();
            return {
                title: Localization_6._(this.itemData.showName),
                text: ttBody,
                color: thisColor,
                bodyStyle: "margin-left: 0; margin-right: 0;",
            };
        }
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
    var mRTypes;
    (function (mRTypes) {
        let Languages;
        (function (Languages) {
            Languages["CHS"] = "zh-cn";
            Languages["ENG"] = "en-us";
            Languages["JPN"] = "ja-jp";
        })(Languages = mRTypes.Languages || (mRTypes.Languages = {}));
    })(mRTypes = exports.mRTypes || (exports.mRTypes = {}));
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
            if (this.parentMob) {
                console.warn(`The following MobListener has been added to multiple Mobs! original parent: ${this.parentMob.name}, new parent: ${mob.name}`);
                console.log(this);
            }
            this.parentMob = mob;
            this.onAdded(mob, source);
        }
        onAdded(mob, source) { }
        // When this listener was removed from the mob by source. By default this will remove the listener from the eventsystem.
        _beRemoved(mob, source) {
            this.discard();
            this.parentMob = undefined;
            this.onRemoved(mob, source);
        }
        onRemoved(mob, source) { }
        // Be triggered when the mob is attacking.
        // This is triggered before the mob's attack or special attack.
        onAttack(src, weapon, targets) { }
        // Be triggered when the mob has finished an attack or special attack.
        onAttackFinish(src, weapon, targets) { }
        // Be triggered when the mob is making a regular attack.
        // This is triggered before the mob's attack or special attack.
        onRegularAttack(src, weapon, targets) { }
        // Be triggered when the mob has finished a regular attack.
        onRegularAttackFinish(src, weapon, targets) { }
        // Be triggered when the mob is making a special attack.
        // This is triggered before the attack.
        onSpecialAttack(src, weapon, targets) { }
        // Be triggered when the mob has finished a special attack.
        onSpecialAttackFinish(src, weapon, targets) { }
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
define("Engine/Agents/MobAgent", ["require", "exports", "Engine/GameObjects/Mob", "Engine/Core/MobListener", "Engine/UI/PopUpManager", "Engine/Core/GameData"], function (require, exports, Mob_5, MobListener_4, PopUpManager_4, GameData_12) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MobAgent extends MobListener_4.MobListener {
        constructor() {
            super();
            this.type = MobListener_4.MobListenerType.Agent;
        }
        updateMob(mob, dt) { }
    }
    exports.MobAgent = MobAgent;
    class MoveableAgent extends MobAgent {
        constructor() {
            super(...arguments);
            this.isMoving = false;
            this.idleFrames = 10;
            this.idleCount = 0;
            this.speedFriction = 0.9;
        }
        updateMob(mob, dt) {
            if (this.isMoving === true) {
                // Reset the anim counter
                this.idleCount = this.idleFrames;
            }
            else {
                if (this.idleCount > 0) {
                    this.idleCount--;
                    // Smooth the speed
                    mob.body.velocity.scale(this.speedFriction);
                }
                else {
                    mob.setVelocity(0, 0);
                }
            }
        }
    }
    exports.MoveableAgent = MoveableAgent;
    class TauntBasedAgent extends MoveableAgent {
        constructor() {
            super();
            this.isMoving = false;
            this.idleFrames = 10;
            this.idleCount = 0;
            this.speedFriction = 0.9;
            this.focusList = new Set();
            this.tauntList = {};
        }
        onAdded(mob) {
            this.listen(mob, 'death', this.onDeath);
            this.listen(mob, 'receiveDamageFinal', this.onReceiveDamageFinal);
        }
        updateMob(mob, dt) {
            // borrowed from playerAgent
            this.footPos = mob.footPos();
            this.updateTaunt(mob);
            // We have already checked if targetMob alive in updateTaunt()
            // as that function checks every one in this.focusList.
            if (this.targetMob) {
                // we need move to goin the range of our current weapon
                if (mob.mobData.currentWeapon && mob.mobData.currentWeapon.isInRange(mob, this.targetMob) == false) {
                    let vel = this.targetMob.footPos().clone().subtract(this.footPos).normalize().scale(mob.mobData.getMovingSpeed());
                    mob.setVelocity(vel.x, vel.y);
                    this.isMoving = true;
                }
                // and then we don't move anymore.
                else {
                    this.isMoving = false;
                }
            }
            else {
                // We lose the target.
                this.targetMob = undefined;
                this.isMoving = false;
            }
            // Attack !
            if (mob.doAttack(dt) === true) {
                if (mob.mobData.currentWeapon && typeof this.targetMob !== "undefined") {
                    if (mob.mobData.currentWeapon.isInRange(mob, this.targetMob)) {
                        mob.mobData.currentWeapon.attack(mob, [this.targetMob]);
                    }
                }
            }
            super.updateMob(mob, dt);
        }
        updateTaunt(mob) {
            // Find current target with highest taunt
            var maxValue = 0;
            var nextTarget = undefined;
            // Use iteration instead of sort to save a O(logN) time.
            // Don't know if this will slower than obj -> array -> sort() cuz javascript vs native...
            // But we need update the list though
            for (var tmpTargetMobData of this.focusList) {
                // Taunt reduces over time
                this.tauntList[tmpTargetMobData.UID].taunt *= 0.999; // TODO: time-consistent
                // Remove the mob if it is dead or it has no taunt
                if (!Mob_5.Mob.checkAlive(tmpTargetMobData.parentMob) || this.tauntList[tmpTargetMobData.UID].taunt <= 1 /*a small enough value*/) {
                    this.removeTarget(tmpTargetMobData);
                }
                else {
                    if (this.tauntList[tmpTargetMobData.UID].taunt > maxValue) {
                        maxValue = this.tauntList[tmpTargetMobData.UID].taunt;
                        nextTarget = tmpTargetMobData.parentMob;
                    }
                }
            }
            if (nextTarget && nextTarget != this.targetMob) {
                if (this.targetMob) {
                    this.targetMob.mobData.beingAttack -= 1;
                }
                this.targetMob = nextTarget;
                nextTarget.mobData.beingAttack += 1;
                // TODO: popUp a "!" and a red line for taunt focus
                var pPos = mob.getTopCenter();
                PopUpManager_4.PopUpManager.getSingleton().addText("!", pPos.x, pPos.y, Phaser.Display.Color.HexStringToColor('#ff0000'), 1.0, 0);
            }
            else if (typeof nextTarget === "undefined") {
                // TODO: popUp a "?" as the mob losted its target
                if (typeof this.targetMob !== "undefined") {
                    var pPos = mob.getTopCenter();
                    PopUpManager_4.PopUpManager.getSingleton().addText("?", pPos.x, pPos.y, Phaser.Display.Color.HexStringToColor('#ffff00'), 1.0, 0);
                }
                this.targetMob = undefined;
            }
        }
        addTarget(target, initialTaunt = 0) {
            this.focusList.add(target);
            this.tauntList[target.UID] = { taunt: initialTaunt };
            this.listen(target, 'receiveHealFinal', this.onReceiveHealFinal);
        }
        removeTarget(target) {
            this.focusList.delete(target);
            this.unlistenAll(target);
            delete this.tauntList[target.UID];
        }
        // Some skills that will change taunt value directly 
        // (e.g. Taunt(skill), Wind rush(some skill that will reduce some taunt from target), etc.)
        changeTaunt(source, taunt) {
            if (!this.focusList.has(source.mobData)) {
                this.addTarget(source.mobData);
            }
            this.tauntList[source.mobData.UID].taunt += taunt;
        }
        // Test if we can modify the result here !
        // Yes we CAN ! (uncomment this and mob using this agent will deal no damage)
        // onDealDamage({ target, damage, isCrit, spell } = {}) 
        // {
        //     for(var dmg in damage)
        //     {
        //         damage[dmg] = 0;
        //     } 
        //     return true; 
        // },
        onReceiveDamageFinal(info) {
            // Just in case
            if (info.type !== GameData_12.GameData.Elements.heal) {
                // Add the damage source in to our focus list,
                if (!this.focusList.has(info.source)) {
                    this.addTarget(info.source);
                }
                // and create the taunt of that target based on damage
                this.tauntList[info.source.UID].taunt += info.value * info.source.tauntMul;
            }
            // We do not change the values
            return false;
        }
        onReceiveHealFinal(info) {
            // Just in case
            if (info.type === GameData_12.GameData.Elements.heal) {
                // Add the heal source in to our focus list,
                if (!this.focusList.has(info.source)) {
                    this.addTarget(info.source);
                }
                // and create the taunt of that target based on total heal
                this.tauntList[info.source.UID].taunt += (info.value + info.overdeal) * info.source.tauntMul * GameData_12.GameData.healTaunt;
            }
            // We do not change the values
            return false;
        }
        onDeath(damageInfo) {
            if (this.targetMob) {
                this.targetMob.mobData.beingAttack -= 1;
            }
            return false;
        }
    }
    exports.TauntBasedAgent = TauntBasedAgent;
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
define("Engine/GameObjects/Mob", ["require", "exports", "Engine/DynamicLoader/dPhysSprite", "Engine/Core/MobData", "Engine/Core/UnitManager", "Engine/Core/EquipmentCore", "Engine/UI/PopUpManager", "Engine/Core/ObjectPopulator", "Engine/Core/GameData", "Engine/UI/UIScene"], function (require, exports, dPhysSprite_2, MobData_1, UnitManager_5, EquipmentCore_2, PopUpManager_5, ObjectPopulator_1, GameData_13, UIScene_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Mob extends dPhysSprite_2.dPhysSprite {
        constructor(scene, x, y, sprite, settings, subsprite, frame) {
            super(scene, x, y, sprite || 'sheet_default_mob', subsprite, frame);
            this.imageFacingRight = false;
            this.setOrigin(0.5, 0.8);
            this.mobData = settings.backendData;
            this.mobData.parentMob = this;
            this.moveAnim = sprite + '_move';
            this.idleAnim = sprite + '_idle';
            this.deadAnim = sprite + '_dead';
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
                this.agent = new settings.agent();
                this.mobData.addListener(this.agent);
            }
            this.attackCounter = 0;
            // HPBar
        }
        // Somehow deprecated
        static fromTiled(mobCtor) {
            return function (scene, obj, prop) {
                let settings_backend = (prop);
                settings_backend.name = settings_backend.name || obj.name || 'Unnamed_mob';
                // Get agent type
                let p_agent = prop['agentType'] || prop['agent'];
                let agentCtor = undefined;
                if (ObjectPopulator_1.ObjectPopulator.agentList) {
                    agentCtor = ObjectPopulator_1.ObjectPopulator.agentList[p_agent];
                }
                let charsheet_key = 'sheet_' + prop['image'] || undefined;
                let settings = {
                    'backendData': new MobData_1.MobData(settings_backend),
                    'agent': agentCtor,
                };
                return new mobCtor(scene, obj.x, obj.y, charsheet_key, settings);
            };
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
            // Set animation
            if (this.anims) {
                if (this.mobData.alive === true) {
                    if (this.body && this.body.velocity.length() > 0.1) {
                        // Fix our face direction when moving
                        if (this.body.velocity.x < 0) {
                            this.flipX = this.imageFacingRight ? true : false;
                        }
                        else {
                            this.flipX = this.imageFacingRight ? false : true;
                        }
                        if (!(this.anims.currentAnim && this.anims.currentAnim.key == this.moveAnim)) {
                            this.play(this.moveAnim);
                        }
                    }
                    else {
                        if (!(this.anims.currentAnim && this.anims.currentAnim.key == this.idleAnim)) {
                            this.play(this.idleAnim);
                        }
                    }
                }
                else {
                    this.flipX = this.imageFacingRight ? false : true;
                    this.play(this.deadAnim);
                }
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
                let result = this.mobData.addBuff(buff);
                // Initial popUp
                if (popUp == true && result) {
                    buff.popUp(this);
                }
            }
            return true;
        }
        fillDHF(_damageInfo) {
            if (typeof _damageInfo.level === 'undefined') {
                _damageInfo.level = 0;
            }
            if (typeof _damageInfo.crit === 'undefined') {
                _damageInfo.crit = 0;
            }
            if (typeof _damageInfo.hit === 'undefined') {
                _damageInfo.hit = 0;
            }
            if (typeof _damageInfo.popUp === 'undefined') {
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
        receiveDamageHeal(_damageInfo) {
            // Fill optional slots with their default values.
            _damageInfo = this.fillDHF(_damageInfo);
            let damageInfo = {
                'source': _damageInfo.source.mobData,
                'spell': _damageInfo.spell,
                'value': _damageInfo.value,
                'type': _damageInfo.type,
                'level': _damageInfo.level,
                'crit': _damageInfo.crit,
                'hit': _damageInfo.hit
            };
            if (Mob.checkAlive(this) == false) {
                return {
                    'isAvoid': true,
                    'isBlock': true,
                    'isCrit': false,
                    'overdeal': 0,
                    'value': 0,
                    'type': _damageInfo.type,
                    'target': this.mobData,
                    'spell': _damageInfo.spell,
                    'source': _damageInfo.source.mobData
                };
            }
            // The actual damage calculate and event trigger moved into backend
            // If mob dead finally, this.data.alive will become false
            let result = this.mobData.receiveDamageHeal(damageInfo);
            // It does not hit !
            if (result.isAvoid) {
                if (_damageInfo.popUp == true) {
                    var popUpPos = this.getTopCenter();
                    if (result.type === 'heal') {
                        PopUpManager_5.PopUpManager.getSingleton().addText('MISS', popUpPos.x, popUpPos.y, GameData_13.GameData.ElementColors['miss'], 1.0, 64);
                    }
                    else {
                        PopUpManager_5.PopUpManager.getSingleton().addText('MISS', popUpPos.x, popUpPos.y, GameData_13.GameData.ElementColors['miss']);
                    }
                }
                return result;
            }
            // Mob itself only do rendering popUp texts
            if (_damageInfo.popUp == true && result.value > 0) {
                var popUpPos = this.getTopCenter();
                if (result.type === 'heal') {
                    PopUpManager_5.PopUpManager.getSingleton().addText(result.value.toString() + (result.isCrit ? "!" : ""), popUpPos.x, popUpPos.y, GameData_13.GameData.ElementColors[result.type], 1.0, 64);
                }
                else {
                    PopUpManager_5.PopUpManager.getSingleton().addText(result.value.toString() + (result.isCrit ? "!" : ""), popUpPos.x, popUpPos.y, GameData_13.GameData.ElementColors[result.type]);
                }
                // popUp texts on unit frames
                // fade from left to the the edge of currentHealth
                if (this.mobData.isPlayer) {
                    let playerList = UnitManager_5.UnitManager.getCurrent().getPlayerListWithDead(UnitManager_5.UnitManager.IDENTITY, UnitManager_5.UnitManager.NOOP);
                    for (var i = 0; i < playerList.length; i++) {
                        if (this === playerList[i]) {
                            if (result.type === 'heal') {
                                let popX = UIScene_3.UIScene.getSingleton().unitFrames[i].x + 40;
                                let popY = UIScene_3.UIScene.getSingleton().unitFrames[i].y + 15;
                                PopUpManager_5.PopUpManager.getSingleton().addText("+" + result.value.toString() + (result.isCrit ? "!" : ""), popX, popY, GameData_13.GameData.ElementColors['heal'], 0.8, 40, 0, -40, 0);
                            }
                            else {
                                let popX = UIScene_3.UIScene.getSingleton().unitFrames[i].x + 78;
                                let popY = UIScene_3.UIScene.getSingleton().unitFrames[i].y + 5;
                                PopUpManager_5.PopUpManager.getSingleton().addText("-" + result.value.toString() + (result.isCrit ? "!" : ""), popX, popY, GameData_13.GameData.ElementColors[result.type], 0.8, -40, 0, 40, 0);
                            }
                        }
                    }
                }
            }
            // However, it should also check if self dead here
            // since it should remove the renderable (actual object) from the scene and mob list
            // Check if I am alive
            if (this.mobData.alive == false) {
                this.die(_damageInfo.source, result);
            }
            return result;
        }
        // Used for dealing instant damages by this mob. Will use the stats of the mob to calculate the damage.
        dealDamageHeal(target, info) {
            return target.receiveDamageHeal({
                'source': this,
                'value': info.value * this.mobData.getAtkPower(info.type),
                'type': info.type,
                'crit': this.mobData.battleStats.crit,
                'hit': this.mobData.battleStats.hitAcc,
                'level': this.mobData.level,
                'spell': info.spell,
                'popUp': info.popUp,
            });
        }
        die(source, damage) {
            this.mobData.die(damage);
            if (this.mobData.isPlayer === true) {
                // Don't remove it, keep it dead
                // game.units.removePlayer(this);
            }
            else {
                if (this.agent) {
                    this.agent.parentMob = undefined;
                    this.agent = undefined;
                }
                UnitManager_5.UnitManager.getCurrent().removeEnemy(this);
                this.destroy();
            }
        }
        attack(targets) {
            this.mobData.updateListeners('attack', this.mobData, targets);
            // let result = this.mobData.currentWeapon.attack(this, targets);
            let result = this.mobData.currentWeapon.checkAttack(this, targets);
            if (result.canAttack) {
                let newTargets = result.target;
                this.mobData.updateListeners('attack', this.mobData, this.mobData.currentWeapon, newTargets);
                if (result.isSpecial) {
                    this.mobData.updateListeners('specialAttack', this.mobData, this.mobData.currentWeapon, newTargets);
                    this.mobData.currentWeapon.specialAttack(this, newTargets, true, true);
                    this.mobData.updateListenersRev('specialAttackFinish', this.mobData, this.mobData.currentWeapon, newTargets);
                }
                else {
                    this.mobData.updateListeners('regularAttack', this.mobData, this.mobData.currentWeapon, newTargets);
                    this.mobData.currentWeapon.regularAttack(this, newTargets, true, true);
                    this.mobData.useMana(this.mobData.currentWeapon.manaCost); // only regular attack costs mana
                    this.mobData.updateListenersRev('regularAttackFinish', this.mobData, this.mobData.currentWeapon, newTargets);
                }
                this.mobData.updateListenersRev('attackFinish', this.mobData, this.mobData.currentWeapon, newTargets);
            }
            return result.canAttack;
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
define("Engine/ScenePrototypes/BattleScene", ["require", "exports", "Engine/GameObjects/Mob", "Engine/Core/UnitManager", "Engine/Core/ObjectPopulator", "Engine/Core/BattleMonitor", "Engine/UI/UIScene", "Engine/UI/ProgressBar"], function (require, exports, Mob_6, UnitManager_6, ObjectPopulator_2, BattleMonitor_4, UIScene_4, ProgressBar_2) {
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
            this.currProgress = 0;
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
            this.loadingScreen = this.add.rectangle(0, 0, 1024, 680, 0x000000);
            this.loadingScreen.setOrigin(0);
            this.loadingScreen.displayWidth = 1024;
            this.loadingScreen.displayHeight = 640;
            this.loadingScreen.setDepth(100);
            this.map = this.make.tilemap({ key: this.mapToLoad });
            for (let tileset of this.map.tilesets) {
                let path = this.tilesetImgPrefix + tileset.name + ".png";
                this.load.image(tileset.name, path);
            }
            this.pBar = new ProgressBar_2.ProgressBar(this, 400, 310, () => [this.currProgress, 1.0], 224, 20, 5, false, 0x444444, 0x000000, 0xade0ee, false);
            this.pBar.setDepth(1000);
            this.add.existing(this.pBar);
            this.load.on('progress', (value) => { this.currProgress = value; });
            this.load.on('complete', () => { this.loadComplete(); UIScene_4.UIScene.getSingleton().resetPlayers(); });
            this.load.start();
        }
        loadComplete() {
            this.tweens.add({
                targets: this.loadingScreen,
                alpha: { value: 0, duration: 1000, ease: 'Power1' },
                yoyo: false,
                repeat: 0
            });
            // Remove the loading bar
            this.tweens.add({
                targets: this.pBar,
                alpha: 0,
                duration: 300,
            }).on('complete', () => { this.pBar.destroy(); this.pBar = undefined; });
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
                    if (objPopulated instanceof Mob_6.Mob) {
                        this.addMob(objPopulated);
                    }
                    else if (objPopulated) {
                        this.add.existing(objPopulated);
                    }
                }
            }
            this.mapReady = true;
            this.battleMonitor = BattleMonitor_4.BattleMonitor.getSingleton();
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
                BattleMonitor_4.BattleMonitor.getSingleton().update(dt / 1000.0);
            }
            else if (this.pBar) {
                this.pBar.update(time, dt / 1000.0);
            }
        }
        updateScene(time, dt) { }
    }
    exports.BattleScene = BattleScene;
});
/** @packageDocumentation @module GameObjects */
define("Engine/GameObjects/Projectile", ["require", "exports", "Engine/GameObjects/Spell", "Engine/GameObjects/Mob"], function (require, exports, Spell_2, Mob_7) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Projectile extends Spell_2.Spell {
        constructor(x, y, sprite, settings, frame, useCollider = true, subsprite) {
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
            if (this.target instanceof Mob_7.Mob && (this.chasingRange < 0 || this.target.footPos().clone().subtract(this.getPosition()).length() < this.chasingRange)) {
                let newDirc = this.target.footPos().clone().subtract(this.getPosition()).normalize();
                this.moveDirc = this.moveDirc.clone().scale(1 - dt * this.chasingPower).add(newDirc.clone().scale(dt * this.chasingPower));
            }
            this.setVelocity(this.moveDirc.x * this.speed, this.moveDirc.y * this.speed);
            this.rotation = (this.body.velocity.angle() + (Math.PI / 2));
            super.updateSpell(dt);
        }
    }
    exports.Projectile = Projectile;
});
/** @packageDocumentation @module Buffs */
define("Buffs/HDOT", ["require", "exports", "Engine/Core/Buff", "Engine/Core/GameData", "Engine/Core/Helper", "Engine/GameObjects/Spell", "Engine/UI/Localization"], function (require, exports, Buff_2, GameData_14, Helper_3, Spell_3, Localization_7) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class HDOT extends Buff_2.Buff {
        constructor(settings, type, vMin = 1, vMax = 3, vGap = 0.57) {
            settings.name = settings.name || 'XOT';
            settings.popupName = settings.popupName || settings.name || 'XOT!';
            settings.color = settings.color || GameData_14.GameData.ElementColors[type] || Phaser.Display.Color.HexStringToColor('#0066ff');
            //settings.iconId
            super(settings);
            //this.toolTip
            this.vMin = vMin;
            this.vMax = vMax;
            this.vGap = vGap; // do not use cooldown for accurate timing
            this.vType = type;
            this.typeStr = Localization_7._(this.vType);
            this.timer = 0;
            this.vCount = -1; // Initial tick
        }
        onAdded(mob, source) {
            this.listen(mob, 'update', this.onUpdate);
        }
        onUpdate(mob, dt) {
            this.timer += dt;
            for (; this.vCount < Math.floor(this.timer / this.vGap); this.vCount++) {
                this.source.parentMob.dealDamageHeal(mob.parentMob, {
                    'value': Helper_3.getRandomInt(this.vMin, this.vMax) * this.stacks,
                    'type': this.vType,
                    'spell': { 'name': this.name, 'flags': new Set([Spell_3.SpellFlags.overTime]) },
                    'popUp': true,
                });
            }
        }
        preToolTip() {
            let tt = super.preToolTip();
            tt.text += "<br>";
            tt.text += eval("`" + Localization_7._("_tt_HDOT") + "`");
            return tt;
        }
    }
    exports.HDOT = HDOT;
});
/** @packageDocumentation @moduleeDocumentation @module Buffs */
define("Buffs/index", ["require", "exports", "Buffs/HDOT"], function (require, exports, HDOT_1) {
    "use strict";
    function __export(m) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    __export(HDOT_1);
});
/** @packageDocumentation @module Weapons */
define("Weapons/Staff", ["require", "exports", "Engine/Core/EquipmentCore", "Engine/Core/UnitManager", "Engine/GameObjects/Spell", "Engine/GameObjects/Projectile", "Engine/Core/Helper", "Engine/Core/GameData", "Buffs/index", "Engine/Core/Buff", "Engine/UI/Localization"], function (require, exports, EquipmentCore_3, UnitManager_7, Spell_4, Projectile_1, Helper_4, GameData_15, Buffs, Buff_3, Localization_8) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Buffs = __importStar(Buffs);
    class CometWand extends EquipmentCore_3.Weapon {
        constructor(itemID = 'cometWand') {
            super(itemID);
            this.mainElement = 'ice';
            this.baseAttackMin = 6;
            this.baseAttackMax = 18;
            this.baseAttackSpeed = 1.5;
            this.targetCount = 2;
            this.activeRange = 2000;
            this.manaCost = 3;
            this.weaponGaugeMax = 25;
            this.weaponGaugeIncreasement = function (mob) { return mob.mobData.baseStats.mag; };
            // ToolTips
            this.weaponGaugeTooltip = `wp_${this.rawName}`;
            Localization_8.Localization.setOneData(this.weaponGaugeTooltip, {
                "zh-cn": "1x 魔力",
                "en-us": "1x MAG",
                "ja-jp": "1x 魔力"
            });
            this.getBaseAttackDesc = (mob) => {
                return {
                    "zh-cn": `
                <span>放出至多 ${this.targetCount} 颗彗星弹进行攻击。</span>
                <span>每颗造成 ${this.getDamage(mob, this.baseAttackMin, GameData_15.GameData.Elements.ice).value.toFixed(0)} - ${this.getDamage(mob, this.baseAttackMax, GameData_15.GameData.Elements.ice).value.toFixed(0)} 点冰属性伤害。</span>`,
                    "en-us": `
                <span>Releases maximum ${this.targetCount} comet orbs to target(s).</span>
                <span>Every orb deals ${this.getDamage(mob, this.baseAttackMin, GameData_15.GameData.Elements.ice).value.toFixed(0)} - ${this.getDamage(mob, this.baseAttackMax, GameData_15.GameData.Elements.ice).value.toFixed(0)} ice damage.</span>`,
                    "ja-jp": `
                <span>最大 ${this.targetCount} 枚の彗星弾を撃つ。</span>
                <span>弾ことに、あったものに ${this.getDamage(mob, this.baseAttackMin, GameData_15.GameData.Elements.ice).value.toFixed(0)} - ${this.getDamage(mob, this.baseAttackMax, GameData_15.GameData.Elements.ice).value.toFixed(0)} 点の氷属性ダメージを与える。</span>`,
                };
            };
            this.getSpecialAttackDesc = (mob) => {
                return {
                    "zh-cn": `
                <span>放出至多 ${this.targetCount} 颗火焰弹进行攻击。</span>
                <span>
                    每颗火焰弹会${Helper_4.Helper.toolTip.colored('点燃', GameData_15.GameData.ElementColorsStr['fire'])}目标 50px 范围内的所有敌人，令它们每 1.2秒受到 ${this.getDamage(mob, 3, GameData_15.GameData.Elements.fire).value.toFixed(0)} - ${this.getDamage(mob, 4, GameData_15.GameData.Elements.fire).value.toFixed(0)} 点火属性伤害，持续6.0秒。${Helper_4.Helper.toolTip.colored('点燃', GameData_15.GameData.ElementColorsStr['fire'])}最多叠加10次。
                </span>`,
                    // <span style = "color: #90d7ec;">同时还会影响自身周围 200px 单位内的队友，使其<strong style='color:${GameData.ElementColorsStr['nature']}'>再生</strong>或<strong style='color:${GameData.ElementColorsStr['light']}'>被光刺穿</strong>。</span>`,
                    "en-us": `
                <span>Releases maximum ${this.targetCount} flame orbs to target(s).</span>
                <span>
                    Each orb will ${Helper_4.Helper.toolTip.colored('burn', GameData_15.GameData.ElementColorsStr['fire'])} every enemy within 50px from the target, dealing ${this.getDamage(mob, 3, GameData_15.GameData.Elements.fire).value.toFixed(0)} - ${this.getDamage(mob, 4, GameData_15.GameData.Elements.fire).value.toFixed(0)} fire damage every 1.2s for 6 seconds. ${Helper_4.Helper.toolTip.colored('Burn', GameData_15.GameData.ElementColorsStr['fire'])} can be stacked up to 10 times.
                </span>`,
                    // <span style = "color: #90d7ec;">Meanwhile, affect team members within 200px from you, let them <strong style='color:${GameData.ElementColorsStr['nature']}'>Regenerate</strong> or <strong style='color:${GameData.ElementColorsStr['light']}'>Enlighttened</strong>.</span>`,
                    "ja-jp": `
                <span>最大 ${this.targetCount} 枚の星炎弾を撃つ。</span>
                <span>
                    弾ことに、あったものの周り 50px 以内の全ての敵を${Helper_4.Helper.toolTip.colored('炎上', GameData_15.GameData.ElementColorsStr['fire'])}の効果を与える。燃えた敵は 6秒 内、1.2秒 ことに ${this.getDamage(mob, 3, GameData_15.GameData.Elements.fire).value.toFixed(0)} - ${this.getDamage(mob, 4, GameData_15.GameData.Elements.fire).value.toFixed(0)} 点の炎属性ダメージを受ける。${Helper_4.Helper.toolTip.colored('炎上', GameData_15.GameData.ElementColorsStr['fire'])}は最大10回に積みます。
                </span>`
                    // <span style = "color: #90d7ec;">その上、自身の周り 200px 以内のメンバーに<strong style='color:${GameData.ElementColorsStr['nature']}'>再生</strong>または<strong style='color:${GameData.ElementColorsStr['light']}'>刺し光</strong>を与える。</span>`,
                };
            };
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
                new Projectile_1.Projectile(source.x, source.y, 'sheet_test_projectiles', {
                    'info': { 'name': this.atkName, 'flags': new Set([Spell_4.SpellFlags.isDamage, Spell_4.SpellFlags.hasTarget]) },
                    'source': source,
                    'target': targetMob,
                    'speed': 150,
                    'mainType': [GameData_15.GameData.Elements.ice, GameData_15.GameData.Elements.fire],
                    'onMobHit': (self, mob) => { self.dieAfter(self.HealDmg, [mob, Helper_4.getRandomInt(6, 18), GameData_15.GameData.Elements.ice], mob); },
                    // 'color': Phaser.Display.Color.HexStringToColor("#77ffff"),
                    'chasingRange': 400,
                    'chasingPower': 1.0,
                }, 1);
        }
        doSpecialAttack(source, target) {
            for (let targetMob of target)
                new Projectile_1.Projectile(source.x, source.y, 'sheet_test_projectiles', {
                    'info': { 'name': this.spName, 'flags': new Set([Spell_4.SpellFlags.isDamage, Spell_4.SpellFlags.hasTarget]) },
                    'source': source,
                    'target': targetMob,
                    'speed': 150,
                    'onMobHit': (self, mob) => {
                        self.dieAfter(() => Helper_4.AoE((m) => {
                            // self.HealDmg(m, getRandomInt(30, 50), GameData.Elements.fire);
                            m.receiveBuff(source, new Buffs.HDOT(Buff_3.Buff.fromKey('test_Burn', { source: source.mobData, time: 6.0, maxStack: 10, name: self.name }), GameData_15.GameData.Elements.fire, 3, 4, 1.2));
                        }, self.getPosition(), 50, self.targeting), [], mob);
                    },
                    'chasingRange': 400,
                    'chasingPower': 5.0,
                }, 2);
            Helper_4.AoE((m) => {
                // self.HealDmg(m, getRandomInt(30, 50), GameData.Elements.fire);
                if (Helper_4.getRandomInt(0, 3) < 1) {
                    m.receiveBuff(source, new Buffs.HDOT(Buff_3.Buff.fromKey('test_HOT', { source: source.mobData, time: 10.0, maxStack: 3 }), GameData_15.GameData.Elements.heal, 0, 1, 2.0));
                }
                else {
                    // m.receiveBuff(source, new Buffs.HDOT(Buff.fromKey('test_Light', { source: source.mobData, time: 5.0 }), GameData.Elements.light, 2, 3, 1.0));
                }
            }, source.footPos(), 200, source.mobData.isPlayer ? Spell_4.Targeting.Player : Spell_4.Targeting.Enemy);
        }
        grabTargets(mob) {
            return UnitManager_7.UnitManager.getCurrent().getNearest(mob.footPos(), !mob.mobData.isPlayer, this.targetCount);
        }
    }
    exports.CometWand = CometWand;
});
/** @packageDocumentation @module Weapons */
define("Weapons/index", ["require", "exports", "Weapons/Staff"], function (require, exports, Staff_1) {
    "use strict";
    function __export(m) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    __export(Staff_1);
});
/** @packageDocumentation @module Mobs.Allies.WindElf */
define("Mobs/Allies/WindElf/Hunter", ["require", "exports", "Engine/GameObjects/Mob"], function (require, exports, Mob_8) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Hunter extends Mob_8.Mob {
    }
    exports.Hunter = Hunter;
});
/** @packageDocumentation @module Mobs.Allies.WindElf */
define("Mobs/Allies/WindElf/WindElf", ["require", "exports", "Engine/GameObjects/Mob", "Engine/Core/MobListener"], function (require, exports, Mob_9, MobListener_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class WindElf extends Mob_9.Mob {
    }
    exports.WindElf = WindElf;
    class WindElfChar extends MobListener_5.MobListener {
    }
    exports.WindElfChar = WindElfChar;
});
/** @packageDocumentation @module Mobs.Allies.WindElf */
define("Mobs/Allies/WindElf/index", ["require", "exports", "Mobs/Allies/WindElf/Hunter", "Mobs/Allies/WindElf/WindElf"], function (require, exports, Hunter_1, WindElf_1) {
    "use strict";
    function __export(m) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    __export(Hunter_1);
    __export(WindElf_1);
});
/** @packageDocumentation @module Mobs.Allies */
define("Mobs/Allies/index", ["require", "exports", "Mobs/Allies/WindElf/index"], function (require, exports, WindElf) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WindElf = WindElf;
});
/** @packageDocumentation @module Agents */
define("Agents/SimpleAgents", ["require", "exports", "Engine/Agents/MobAgent"], function (require, exports, MobAgent_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class KeepMoving extends MobAgent_2.MoveableAgent {
        constructor(range = 150, dirc = new Phaser.Math.Vector2(0, 1)) {
            super();
            this.center = new Phaser.Math.Vector2(0, 0);
            this.range = range;
            this.dirc = dirc.normalize();
        }
        onAdded(mob) {
            this.center = mob.parentMob.getPosition();
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
/** @packageDocumentation @moduleeDocumentation @module Agents */
define("Agents/index", ["require", "exports", "Agents/SimpleAgents"], function (require, exports, SimpleAgents_1) {
    "use strict";
    function __export(m) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    __export(SimpleAgents_1);
});
/** @packageDocumentation @module Mobs.Enemies */
define("Mobs/Enemies/TestMob", ["require", "exports", "Engine/GameObjects/Mob", "Engine/Agents/MobAgent", "Weapons/index", "Engine/Core/MobData"], function (require, exports, Mob_10, MobAgent_3, Weapons, MobData_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Weapons = __importStar(Weapons);
    class TestMob extends Mob_10.Mob {
        constructor(scene, x, y, sprite, settings) {
            settings.agent = settings.agent || MobAgent_3.TauntBasedAgent;
            super(scene, x, y, sprite || 'sheet_FutsuMu', settings);
            let myWeapon = new Weapons.CometWand();
            myWeapon.manaCost = 0;
            myWeapon.activeRange = 150;
            myWeapon.targetCount = 2;
            this.mobData.equip(myWeapon, MobData_2.EquipSlots.MainHand);
        }
    }
    exports.TestMob = TestMob;
});
/** @packageDocumentation @module Mobs.Enemies */
define("Mobs/Enemies/index", ["require", "exports", "Mobs/Enemies/TestMob"], function (require, exports, TestMob_1) {
    "use strict";
    function __export(m) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    __export(TestMob_1);
});
/** @packageDocumentation @module Mobs */
define("Mobs/index", ["require", "exports", "Mobs/Allies/index", "Mobs/Enemies/index"], function (require, exports, Allies, Enemies) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Allies = Allies;
    exports.Enemies = Enemies;
});
/** @packageDocumentation @module Lists */
define("Lists/ItemList", ["require", "exports", "Weapons/index"], function (require, exports, Weapons) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Weapons = __importStar(Weapons);
    exports.ItemList = {
        "cometWand": Weapons.CometWand,
    };
});
/** @packageDocumentation @module Lists */
define("Lists/ObjectList", ["require", "exports", "Engine/GameObjects/Mob", "Mobs/index"], function (require, exports, Mob_11, Mobs) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Mobs = __importStar(Mobs);
    exports.ObjectList = {
        'Mob': Mob_11.Mob.fromTiled(Mob_11.Mob),
        'TestMob': Mob_11.Mob.fromTiled(Mobs.Enemies.TestMob),
    };
});
/** @packageDocumentation @module Lists */
define("Lists/AgentList", ["require", "exports", "Agents/index"], function (require, exports, Agents) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Agents = __importStar(Agents);
    exports.AgentList = {
        'default': undefined,
        'keepMoving': Agents.KeepMoving,
    };
});
/** @packageDocumentation @moduleeDocumentation @module SpellDatas */
define("SpellData/FloraHeal", ["require", "exports", "Engine/Core/SpellData", "Engine/Core/UnitManager", "Engine/Core/GameData", "Engine/GameObjects/Spell", "Engine/Core/Helper"], function (require, exports, SpellData_1, UnitManager_8, GameData_16, Spell_5, Helper_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var SpellDatas;
    (function (SpellDatas) {
        class FloraHeal extends SpellData_1.SpellData {
            constructor(settings) {
                super(settings);
                this.isCast = true;
                this.isChannel = true;
                this.channelTime = 2.4;
                this.castTime = 1.4;
                this.manaCost = 8;
                this.totalTime = 0;
                this.hitCount = 0;
            }
            onCast(mob, target) {
                this.totalTime = 0;
                this.hitCount = -1;
            }
            onChanneling(mob, target, dt) {
                this.totalTime += dt;
                if (Math.ceil(this.totalTime / 0.8) > this.hitCount) {
                    this.hitCount++;
                    UnitManager_8.UnitManager.getCurrent().getUnitList(UnitManager_8.UnitManager.sortByHealthPercentage, UnitManager_8.UnitManager.NOOP, mob.mobData.isPlayer).slice(0, 3).forEach(target => {
                        mob.dealDamageHeal(target, {
                            'value': Helper_5.getRandomInt(4, 6),
                            'type': GameData_16.GameData.Elements.heal,
                            'spell': {
                                'name': this.name,
                                'flags': new Set([
                                    Spell_5.SpellFlags.areaEffect,
                                    Spell_5.SpellFlags.isHeal,
                                ])
                            }
                        });
                    });
                }
            }
        }
        SpellDatas.FloraHeal = FloraHeal;
    })(SpellDatas = exports.SpellDatas || (exports.SpellDatas = {}));
});
/** @packageDocumentation @module BattleScene */
define("TestScene", ["require", "exports", "Engine/ScenePrototypes/BattleScene", "Engine/GameObjects/Mob", "Engine/Core/MobData", "Weapons/index", "Engine/Agents/PlayerAgents", "Mobs/index", "Agents/index", "Engine/Core/Helper", "Engine/Core/ObjectPopulator", "Lists/ObjectList", "Lists/AgentList", "Engine/UI/Localization", "SpellData/FloraHeal"], function (require, exports, BattleScene_1, Mob_12, MobData_3, Weapons, PlayerAgents, Mobs, Agents, Helper_6, ObjectPopulator_3, ObjectList_1, AgentList_1, Localization_9, FloraHeal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Weapons = __importStar(Weapons);
    PlayerAgents = __importStar(PlayerAgents);
    Mobs = __importStar(Mobs);
    Agents = __importStar(Agents);
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
        }
        // create()
        // {
        //     super.create();
        // }
        loadComplete() {
            super.loadComplete();
            // this.map = this.make.tilemap({ key: 'overworld' });
            // this.tiles = this.map.addTilesetImage('Grass_Overworld', 'Grass_Overworld');
            // this.terrainLayer = this.map.createStaticLayer('Terrain', this.tiles, 0, 0);
            this.anims.create({ key: 'move', frames: this.anims.generateFrameNumbers('elf', { start: 0, end: 3, first: 0 }), frameRate: 8, repeat: -1 });
            for (let i = 0; i < 6; i++) {
                // this.alive.push(new Mob(this.add.sprite(100, 200, 'elf'), 'move'));
                this.girl = new Mob_12.Mob(this, 930, 220 + i * 30, 'sheet_forestelf_myst', {
                    'backendData': new MobData_3.MobData({
                        'name': Localization_9._('testGirl') + i,
                        'isPlayer': true,
                        'vit': 10 + Helper_6.getRandomInt(-3, 3),
                        'mag': 8 + Helper_6.getRandomInt(-3, 3),
                        'str': 2 + Helper_6.getRandomInt(-1, 1),
                        'int': 3 + Helper_6.getRandomInt(-2, 2),
                        'dex': 5 + Helper_6.getRandomInt(-3, 3),
                        'tec': 7 + Helper_6.getRandomInt(-3, 3),
                    }),
                    'agent': PlayerAgents.Simple,
                });
                this.girl.mobData.battleStats.attackPower.ice = 10;
                this.girl.mobData.battleStats.attackPower.fire = 40;
                this.girl.mobData.battleStats.crit = 5.0;
                this.girl.mobData.equip(new Weapons.CometWand(), MobData_3.EquipSlots.MainHand);
                this.girl.mobData.equip(new Weapons.CometWand(), MobData_3.EquipSlots.SubHand);
                this.girl.mobData.weaponSubHand.baseAttackSpeed = 0.05;
                this.girl.mobData.weaponSubHand.manaCost = 1;
                // this.girl.mobData.addListener(this.girl.mobData.weaponMainHand);
                // this.girl.receiveBuff(this.girl, new Buffs.HDOT(Buff.fromKey('test_GodHeal'), GameData.Elements.heal, 20, 38, 0.8));
                this.girl.mobData.spells['floraHeal'] = new FloraHeal_1.SpellDatas.FloraHeal({ 'name': 'FloraHeal', 'coolDown': 5.0 + i * 1.0, 'manaCost': 20 });
                this.addMob(this.girl);
            }
            for (let i = 0; i < 2; i++) {
                // this.alive.push(new Mob(this.add.sprite(100, 200, 'elf'), 'move'));
                this.girl = new Mobs.Allies.WindElf.Hunter(this, 930, 220 + i * 30, 'sheet_forestelf_myst', {
                    'backendData': new MobData_3.MobData({
                        'name': Localization_9._('testGirl') + i,
                        'isPlayer': true,
                        'vit': 10 + Helper_6.getRandomInt(-3, 3),
                        'mag': 8 + Helper_6.getRandomInt(-3, 3),
                        'str': 2 + Helper_6.getRandomInt(-1, 1),
                        'int': 3 + Helper_6.getRandomInt(-2, 2),
                        'dex': 5 + Helper_6.getRandomInt(-3, 3),
                        'tec': 7 + Helper_6.getRandomInt(-3, 3),
                    }),
                    'agent': PlayerAgents.Simple,
                });
                this.girl.mobData.battleStats.attackPower.ice = 10;
                this.girl.mobData.battleStats.attackPower.fire = 40;
                this.girl.mobData.battleStats.crit = 5.0;
                this.girl.mobData.equip(new Weapons.CometWand(), MobData_3.EquipSlots.MainHand);
                this.girl.mobData.equip(new Weapons.CometWand(), MobData_3.EquipSlots.SubHand);
                this.girl.mobData.weaponSubHand.baseAttackSpeed = 0.05;
                this.girl.mobData.weaponSubHand.manaCost = 1;
                // this.girl.mobData.addListener(this.girl.mobData.weaponMainHand);
                // this.girl.receiveBuff(this.girl, new Buffs.HDOT(Buff.fromKey('test_GodHeal'), GameData.Elements.heal, 20, 38, 0.8));
                this.girl.mobData.spells['floraHeal'] = new FloraHeal_1.SpellDatas.FloraHeal({ 'name': 'FloraHeal', 'coolDown': 5.0 + i * 1.0, 'manaCost': 20 });
                this.addMob(this.girl);
            }
            let woodlog = new Mob_12.Mob(this, 300, 200, 'sheet_forestelf_myst', {
                'backendData': new MobData_3.MobData({ name: 'woodLog', 'isPlayer': false, 'health': 1000, }),
                'agent': Agents.KeepMoving,
            });
            this.addMob(woodlog);
            woodlog = new Mob_12.Mob(this, 350, 200, 'sheet_forestelf_myst', {
                'backendData': new MobData_3.MobData({ name: 'woodLog', 'isPlayer': false, 'health': 1000, }),
                'agent': Agents.KeepMoving,
            });
            this.addMob(woodlog);
            this.h = woodlog;
            woodlog = new Mob_12.Mob(this, 300, 250, 'sheet_forestelf_myst', {
                'backendData': new MobData_3.MobData({ name: 'woodLog', 'isPlayer': false, 'health': 1000, }),
                'agent': Agents.KeepMoving,
            });
            this.addMob(woodlog);
        }
        updateScene(time, dt) {
        }
    }
    exports.TestScene = TestScene;
});
/** @packageDocumentation @module ScenePrototypes */
define("Engine/ScenePrototypes/GamePreloadScene", ["require", "exports", "Engine/UI/Localization", "Engine/DynamicLoader/DynamicLoaderScene", "Engine/UI/UIScene", "TestScene", "Engine/Core/InventoryCore", "Lists/ItemList", "Engine/UI/ProgressBar", "papaparse", "Engine/Core/Buff", "js-cookie", "Engine/Core/GameData"], function (require, exports, Localization_10, DynamicLoaderScene_3, UIScene_5, TestScene_1, InventoryCore_3, ItemList_1, ProgressBar_3, papaparse_1, Buff_4, js_cookie_1, GameData_17) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    js_cookie_1 = __importDefault(js_cookie_1);
    /**
     * Handles all necessary assets that must be loaded before the game start.
     * May also perform necessary processing steps.
     */
    class GamePreloadScene extends Phaser.Scene {
        constructor() {
            super(...arguments);
            this.currProgress = 0;
        }
        create() {
            // Set Language
            let sbox = (document.getElementById("Language"));
            let slang = js_cookie_1.default.get('language') || sbox.options[sbox.selectedIndex].value;
            GameData_17.GameData.mainLanguage = slang;
            GameData_17.GameData.popUpBuffLanguage = slang;
            sbox.selectedIndex = slang === 'zh-cn' ? 0 : (slang === 'en-us' ? 1 : 2);
            this.load.bitmapFont('smallPx', './assets/fonts/smallPx_C_0.png', './assets/fonts/smallPx_C.fnt');
            this.load.bitmapFont('smallPx_HUD', './assets/fonts/smallPx_HUD_0.png', './assets/fonts/smallPx_HUD.fnt');
            this.load.bitmapFont('mediumPx', './assets/fonts/mediumPx_04b03_0.png', './assets/fonts/mediumPx_04b03.fnt');
            this.load.text('locals', './assets/dataSheets/Locals.csv');
            this.load.text('itemData', 'assets/dataSheets/Items.csv');
            this.load.text('buffData', 'assets/dataSheets/Buffs.csv');
            this.load.text('assets', 'assets/dataSheets/Assets.csv');
            this.load.image('DOBJ_LOADING_PLACEHOLDER', 'assets/img/loading.png');
            this.add.existing(new ProgressBar_3.ProgressBar(this, 400, 310, () => [this.currProgress, 1.0], 224, 20, 5, false, 0x444444, 0x000000, 0xfddac5, false));
            this.load.on('progress', (value) => { this.currProgress = value; });
            this.load.on('complete', () => {
                // https://medium.com/@kishanvikani/parse-multiple-files-using-papa-parse-and-perform-some-synchronous-task-2db18e531ede
                Promise.all([
                    this.cache.text.get('locals'),
                    this.cache.text.get('buffData'),
                    this.cache.text.get('itemData'),
                    this.cache.text.get('assets'),
                ].map((val) => new Promise((resolve, reject) => papaparse_1.parse(val, {
                    complete: resolve,
                    error: reject,
                })))).then((results) => {
                    let localesCSV = (results[0]);
                    let buffsCSV = (results[1]);
                    let itemsCSV = (results[2]);
                    let assetsCSV = (results[3]);
                    Localization_10.Localization.setData(this.parseLocales(localesCSV));
                    InventoryCore_3.ItemManager.setData(this.parseItems(itemsCSV), ItemList_1.ItemList);
                    // Create the ItemManager
                    // ItemManager.setData(this.cache.json.get('itemData'), ItemList);
                    Buff_4.Buff.parsedBuffInfo = this.parseBuffs(buffsCSV);
                    let assetList = this.parseAssets(assetsCSV);
                    this.scene.add('TestScene', new TestScene_1.TestScene(), true);
                    this.scene.add('UIScene', UIScene_5.UIScene.getSingleton(), true);
                    this.scene.add('DynamicLoaderScene', DynamicLoaderScene_3.DynamicLoaderScene.getSingleton(), true);
                    DynamicLoaderScene_3.DynamicLoaderScene.getSingleton().assetList = assetList;
                }).catch((err) => {
                    console.log("Something went wrong: ", err);
                });
            });
            this.load.start();
        }
        parseLocales(result) {
            let localesMain = {};
            let localesPop = {};
            let currentRowIdx = 3; // Start from 4th row
            for (; currentRowIdx < result.data.length; currentRowIdx++) {
                let row = result.data[currentRowIdx];
                if (row[0] === "") {
                    continue;
                } // This row is empty
                if (row[1] === "true") {
                    localesPop[row[0]] = {
                        "zh-cn": row[2] === "" ? "BAD_STR" : row[2],
                        "en-us": row[3] === "" ? "BAD_STR" : row[3],
                        "ja-jp": row[4] === "" ? "BAD_STR" : row[4]
                    };
                }
                else {
                    localesMain[row[0]] = {
                        "zh-cn": row[2] === "" ? "BAD_STR" : row[2],
                        "en-us": row[3] === "" ? "BAD_STR" : row[3],
                        "ja-jp": row[4] === "" ? "BAD_STR" : row[4]
                    };
                }
            }
            return { "main": localesMain, "popUpBuff": localesPop };
        }
        parseItems(result) {
            let allItemInfo = {};
            let currentRowIdx = 3; // Start from 4th row
            for (; currentRowIdx < result.data.length; currentRowIdx++) {
                let row = result.data[currentRowIdx];
                if (row[0] === "") {
                    continue;
                } // This row is empty
                // A: Unique ID
                let uid = row[0];
                let item = {
                    'showName': 'itemname_' + uid,
                    'rawName': uid,
                    'color': row[4],
                    'tint': row[5] === 'true',
                    'level': Number.parseInt(row[6]),
                    'rarity': Number.parseInt(row[7]),
                    'stackable': row[8] === 'true',
                    'eClass': row[9],
                    'pClass': row[10],
                    'sClass': row[11],
                    'image': row[18],
                    'iconIdx': Number.parseInt(row[19]),
                    'toolTipText': 'itemtt_' + uid,
                };
                Localization_10.Localization.data.main[item.showName] = {
                    "zh-cn": row[1] === "" ? "BAD_STR" : row[1],
                    "en-us": row[2] === "" ? "BAD_STR" : row[2],
                    "ja-jp": row[3] === "" ? "BAD_STR" : row[3],
                };
                Localization_10.Localization.data.main[item.toolTipText] = {
                    "zh-cn": row[20] === "" ? "BAD_STR" : row[20],
                    "en-us": row[21] === "" ? "BAD_STR" : row[21],
                    "ja-jp": row[22] === "" ? "BAD_STR" : row[22],
                };
                // Has attackName
                if (row[12] !== "") {
                    item.atkName = 'aN_' + uid;
                    // M, N, O
                    Localization_10.Localization.data.main[item.atkName] = {
                        "zh-cn": row[12] === "" ? "BAD_STR" : (row[12]),
                        "en-us": row[13] === "" ? "BAD_STR" : (row[13]),
                        "ja-jp": row[14] === "" ? "BAD_STR" : (row[14]),
                    };
                }
                // Has specialAttackName
                if (row[15] !== "") {
                    item.spName = 'sN_' + uid;
                    // P, Q, R
                    Localization_10.Localization.data.main[item.spName] = {
                        "zh-cn": row[15] === "" ? "BAD_STR" : (row[15]),
                        "en-us": row[16] === "" ? "BAD_STR" : (row[16]),
                        "ja-jp": row[17] === "" ? "BAD_STR" : (row[17]),
                    };
                }
                allItemInfo[uid] = item;
            }
            return allItemInfo;
        }
        parseBuffs(result) {
            let allBuffInfo = {};
            let currentRowIdx = 3; // Start from 4th row
            for (; currentRowIdx < result.data.length; currentRowIdx++) {
                let row = result.data[currentRowIdx];
                if (row[0] === "") {
                    continue;
                } // This row is empty
                // A: Unique ID
                let uid = row[0];
                let buff = {};
                buff.name = 'buffname_' + uid;
                // B, C, D: names
                let name = {
                    "zh-cn": row[1] === "" ? "BAD_STR" : row[1],
                    "en-us": row[2] === "" ? "BAD_STR" : row[2],
                    "ja-jp": row[3] === "" ? "BAD_STR" : row[3],
                };
                Localization_10.Localization.data.main[buff.name] = name;
                // E: color
                buff.color = Phaser.Display.Color.HexStringToColor(row[4]);
                // F, G: countTime, time
                buff.countTime = row[5] === "true";
                buff.time = Number.parseFloat(row[6]);
                // H, I: stackable, maxStack
                buff.stackable = row[7] === "true";
                buff.maxStack = Number.parseInt(row[8]);
                // J, K: imageKey, iconId
                buff.imageKey = row[9];
                buff.iconId = Number.parseInt(row[10]);
                buff.tintIcon = row[11] === "true";
                // L, M, N: popUpName
                buff.popupName = 'popUp_' + uid;
                let pName = {
                    "zh-cn": row[12] === "" ? "BAD_STR" : row[12],
                    "en-us": row[13] === "" ? "BAD_STR" : row[13],
                    "ja-jp": row[14] === "" ? "BAD_STR" : row[14],
                };
                Localization_10.Localization.data.popUpBuff[buff.popupName] = pName;
                // O, P: UIImportant, UIPriority
                buff.UIimportant = row[15] === "true";
                buff.UIpriority = Number.parseFloat(row[16]);
                // Q, R, S: ToolTip
                buff.toolTip = 'tt_' + uid;
                let ttText = {
                    "zh-cn": row[17] === "" ? "BAD_STR" : row[17],
                    "en-us": row[18] === "" ? "BAD_STR" : row[18],
                    "ja-jp": row[19] === "" ? "BAD_STR" : row[19],
                };
                Localization_10.Localization.data.main[buff.toolTip] = ttText;
                allBuffInfo[uid] = buff;
            }
            console.log("Parsed buffSettings:");
            console.dir(allBuffInfo);
            return allBuffInfo;
        }
        parseAssets(result) {
            let allAssetInfo = {};
            let currentRowIdx = 3; // Start from 4th row
            for (; currentRowIdx < result.data.length; currentRowIdx++) {
                let row = result.data[currentRowIdx];
                if (row[0] === "") {
                    continue;
                } // This row is empty
                let uid = row[0];
                let asset = {};
                asset.type = row[1];
                asset.url = row[2];
                switch (asset.type) {
                    case 'spritesheet':
                        asset.frameConfig = {
                            "frameWidth": Number.parseInt(row[3]),
                            "frameHeight": Number.parseInt(row[4]),
                            "startFrame": Number.parseInt(row[5]),
                            "endFrame": Number.parseInt(row[6]),
                        };
                        if (row[7] !== "") {
                            asset.animations = JSON.parse(row[7]);
                        }
                        break;
                    default:
                        break;
                }
                allAssetInfo[uid] = asset;
            }
            return allAssetInfo;
        }
        update(time, dt) {
            this.children.each((item) => { item.update(time, dt / 1000.0); });
        }
    }
    exports.GamePreloadScene = GamePreloadScene;
});
/** @packageDocumentation @module GameScene */
define("SimpleGame", ["require", "exports", "Engine/ScenePrototypes/GamePreloadScene"], function (require, exports, GamePreloadScene_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class InitPhaser {
        static initGame() {
            let config = {
                type: Phaser.AUTO,
                width: 1024,
                height: 660,
                resolution: 1,
                scene: [GamePreloadScene_1.GamePreloadScene],
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
        }
    }
    exports.InitPhaser = InitPhaser;
    InitPhaser.initGame();
});
/** @packageDocumentation @moduleeDocumentation @module SpellDatas */
define("SpellData/index", ["require", "exports", "SpellData/FloraHeal"], function (require, exports, FloraHeal_2) {
    "use strict";
    function __export(m) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    __export(FloraHeal_2);
});
//# sourceMappingURL=gameMain.js.map