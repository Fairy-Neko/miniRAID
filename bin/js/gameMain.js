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
 * @module Events
 */
define("Events/EventSystem", ["require", "exports", "typescript-collections"], function (require, exports, Collections) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Collections = __importStar(Collections);
    class EventElement {
        constructor(parentSystem) {
            this.listenRecord = new Collections.Set();
            this.parentSystem = parentSystem;
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
    }
    exports.EventElement = EventElement;
    class EventSystem {
        constructor() {
            this.dict = new Collections.Dictionary();
            // nothing to do?
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
// Example usage
// Create //
// let tween = this.tweens.add({
//                 targets: this.logo,
//                 scaleX: { value: 1.0, duration: 2000, ease: 'Back.easeInOut' },
//                 scaleY: { value: 1.0, duration: 2000, ease: 'Back.easeInOut' },
//                 yoyo: true,
//                 repeat: -1
//                 });
// for (var i:number = 0; i < 4000; i++)
// {
//     var tmpText = this.add.text(16 + (i % 40) * 20, 16 + Math.floor(i / 40) * 20, '哇哦', {fontSize: '9px'});
// }
// console.log('Building event system...')
// // Init event system
// // 50x {1 Main -> 9 Sub}
// // this.num = 5000; // <-- This still runs at 60 FPS! with the update operation 7.88ms. Although the starting process is quite long (around 2min). This system is strong!
// this.num = 500;
// for(var i = 0; i < this.num * 10; i++)
// {
//     this.objs.push(new Events.EventElement(this.eventSystem));
// }
// // Create relationships
// for(var i = 0; i < this.num * 10; i++)
// {
//     if(i % 10 >= 0)
//     {
//         this.objs[i].listen(this.objs[Math.floor(i / 10) * 10], 'update', (mob, dt) => {return 0;});
//         this.objs[i].listen(this.objs[Math.floor(i / 10) * 10], 'onDamageReceived', (mob, src, dmg, hit, crit) => {/*console.log(dmg);*/});
//         this.objs[i].listen(this.objs[Math.floor(i / 10) * 10], 'onDead', (mob, lastHit) => {return 0;});
//         for(var j = 0; j < this.num; j++)
//         {
//             if(Math.random() < 0.5)
//             {
//                 this.objs[i].listen(this.objs[j * 10], 'onDamageReceived', (mob, src, dmg, hit, crit) => {/*console.log(dmg);*/})
//             }
//         }
//     }
//     if(i % 1000 == 0)
//     {
//         console.log(i / 10);
//     }
// }
// Update //
// this.cnt ++;
// if(this.cnt > 20)
// {
//     console.log(1000.0 / dt);
//     this.cnt = 0;
// }
// this.logo_scale = time / 10000.0;
// this.logo.setScale(this.logo_scale, this.logo_scale);
// this.ground_rt.scale -= 0.01;
// this.ground_rt.draw(this.mesh0);
// for(var i = 0; i < this.num; i++)
// {
//     this.objs[i * 10].emit('update', this.objs[i * 10], dt);
//     if(Math.random() < 0.6)
//     {
//         var src = Math.floor(Math.random() * this.num);
//         var dmg = Math.random() * 100.0;
//         this.objs[i * 10].emit('onDamageReceived', this.objs[i * 10], src, dmg, true, false);
//     }
// }
/** @module DynamicLoader */
define("DynamicLoader/DynamicLoadObject", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
/**
 * @module UI
 */
define("UI/DraggableScene", ["require", "exports"], function (require, exports) {
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
    exports.default = DraggableScene;
});
/** @module DynamicLoader */
define("DynamicLoader/DynamicLoaderScene", ["require", "exports", "UI/DraggableScene"], function (require, exports, DraggableScene_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    DraggableScene_1 = __importDefault(DraggableScene_1);
    class DynamicLoaderScene extends DraggableScene_1.default {
        constructor() {
            super({ key: 'DynamicLoaderScene' });
            this.queue = [];
            this.pending = new Map();
            this.isLoading = false;
            this.pools = new Map();
            this.screenX = 10;
            this.screenY = 10;
            this.sizeX = 200;
            this.sizeY = 40;
        }
        preload() {
            this.load.json('assetList', './assets/assetList.json');
        }
        create() {
            super.create();
            this.label = this.add.text(0, 0, 'Loading ... [100.0%]');
            this.assetList = this.cache.json.get('assetList');
            this.pools.set("image", { "load": this.scene.scene.load.image,
                "pool": this.scene.scene.textures });
            this.pools.set("spritesheet", { "load": this.scene.scene.load.spritesheet,
                "pool": this.scene.scene.textures });
            this.pools.set("audio", { "load": this.scene.scene.load.audio,
                "pool": this.scene.scene.cache.audio });
            this.pools.set("bitmapFont", { "load": this.scene.scene.load.bitmapFont,
                "pool": this.scene.scene.cache.bitmapFont });
            this.pools.set("binary", { "load": this.scene.scene.load.binary,
                "pool": this.scene.scene.cache.binary });
            this.pools.set("json", { "load": this.scene.scene.load.json,
                "pool": this.scene.scene.cache.json });
            this.pools.set("JSONtilemap", { "load": this.scene.scene.load.tilemapTiledJSON,
                "pool": this.scene.scene.cache.tilemap });
            this.pools.set("glsl", { "load": this.scene.scene.load.glsl,
                "pool": this.scene.scene.cache.shader });
            this.pools.set("text", { "load": this.scene.scene.load.text,
                "pool": this.scene.scene.cache.text });
            this.scene.scene.load.on('complete', this.loadComplete.bind(this));
        }
        update(time, dt) {
            this.isLoading = this.scene.scene.load.isLoading();
            if (this.isLoading) {
                this.label.setVisible(true);
                this.label.text = `Loading ... [${(this.scene.scene.load.progress / 1.0 * 100.0).toFixed(1)}]`;
            }
            else {
                this.label.setVisible(false);
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
                        // We don't want load a file many times (Phaser will throw a warning and actually it won't load multiple times for same keys, but hey we hate warnings (x))
                        else if (!this.pending.has(item.key)) {
                            console.log(`[DynamicLoader] Loading resource ${item.key} as type ${resource.type}`);
                            resource.key = item.key;
                            IOObj.load.apply(this.scene.scene.load, [resource]);
                            this.pending.set(item.key, item);
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
                value.callback(key, resource.type, IOObj.pool.get(key));
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
    exports.default = DynamicLoaderScene;
});
/** @module DynamicLoader */
define("DynamicLoader/dSprite", ["require", "exports", "DynamicLoader/DynamicLoaderScene"], function (require, exports, DynamicLoaderScene_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    DynamicLoaderScene_1 = __importDefault(DynamicLoaderScene_1);
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
            DynamicLoaderScene_1.default.getSingleton().loadMultiple(this.resources);
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
    exports.default = dSprite;
});
/** @module Core */
define("core/InventoryCore", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Inventory {
        constructor() {
        }
    }
    exports.Inventory = Inventory;
    class Item {
        constructor() {
        }
    }
    exports.Item = Item;
});
/** @module Core */
define("core/Buff", ["require", "exports", "core/DataBackend"], function (require, exports, DataBackend_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Buff extends DataBackend_1.MobListener {
        constructor(settings) {
            super();
        }
        /**
         * Addes one stack of itself.
         */
        addStack() {
        }
    }
    exports.default = Buff;
});
/** @module Struct */
define("Structs/QuerySet", ["require", "exports"], function (require, exports) {
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
         */
        addItem(item, failCallback) {
            if (!this.keyFn) {
                if (!this.data.has(item)) {
                    this.data.add(item);
                }
                else if (failCallback) {
                    let modified = failCallback(item); // since this condition implies item === item in the Set
                    if (modified) {
                        this.currentTimestamp += 1;
                    }
                }
            }
            else {
                let key = this.keyFn(item);
                if (!this.data.has(key)) {
                    this.data.set(key, item);
                }
                else if (failCallback) {
                    let modified = failCallback(this.data.get(key));
                    if (modified) {
                        this.currentTimestamp += 1;
                    }
                }
            }
        }
        removeItem(item) {
            if (!this.keyFn) {
                if (this.data.delete(item)) {
                    this.currentTimestamp += 1;
                }
            }
            else {
                if (this.data.delete(this.keyFn(item))) {
                    this.currentTimestamp += 1;
                }
            }
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
    exports.default = QuerySet;
});
/** @module Core */
define("core/GameData", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const damageType = {
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
        physical: "pure",
        elemental: "pure",
        heal: "pure",
        pure: "pure",
    };
    exports.damageType = damageType;
    const critMultiplier = {
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
        heal: 2.0,
    };
    exports.critMultiplier = critMultiplier;
});
/** @module Core */
define("core/DataBackend", ["require", "exports", "Events/EventSystem", "core/InventoryCore", "core/Buff", "Structs/QuerySet", "core/GameData"], function (require, exports, EventSystem, InventoryCore_1, Buff_1, QuerySet_1, GameData) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    EventSystem = __importStar(EventSystem);
    Buff_1 = __importDefault(Buff_1);
    QuerySet_1 = __importDefault(QuerySet_1);
    GameData = __importStar(GameData);
    class DataBackend {
        constructor() {
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
    exports.default = DataBackend;
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
            super(DataBackend.getSingleton().eventSystem);
            this.name = settings.name || "noname";
            // this.position = {x: this.body.left, y: this.body.top};
            this.image = settings.image || "magical_girl";
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
            // speed related (1.0 means 100% (NOT a value but a ratio))
            this.modifiers = {
                speed: settings.speed || 1.0,
                movingSpeed: settings.movingSpeed || 1.0,
                attackSpeed: settings.attackSpeed || 1.0,
                spellSpeed: settings.spellSpeed || 1.0,
                resourceCost: settings.resourceCost || 1.0,
            };
            this.baseSpeed = settings.baseSpeed || 2.0;
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
            this.ID = DataBackend.getSingleton().getID();
            // ref for MobListeners (buffs, agent, weapons, armor, ...)
            /** test */
            this.listeners = new QuerySet_1.default();
            this.listeners.addQuery('buff', (arg) => (arg.type == MobListenerType.Buff), undefined);
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
            return ["equipment"];
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
            this.updateListeners(this, 'onUpdate', this, dt);
            for (let listener of this.listeners.getAll()) {
                if (listener.isOver == true) {
                    //this buff is over. delete it from the list.
                    // this.buffList.delete(buff);
                    this.removeListener(listener);
                }
            }
            // Mana Regen
            if (typeof this.currentWeapon !== "undefined") {
                this.currentMana += dt * this.currentWeapon.manaRegen * 0.001; // change to this.manaRegen plz
            }
            if (this.currentMana > this.maxMana) {
                this.currentMana = this.maxMana;
            }
            // Spell Casting
            if (this.globalCDRemain > 0) {
                this.globalCDRemain -= dt * 0.001;
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
                    this.castRemain -= dt * 0.001;
                }
                else {
                    this.inCasting = false;
                    this.finishCast(mob, this.currentSpellTarget, this.currentSpell);
                }
            }
            if (this.inChanneling == true) {
                if (this.channelRemain > 0) {
                    this.channelRemain -= dt * 0.001;
                    this.currentSpell.onChanneling(mob, this.currentSpellTarget, dt * 0.001 * this.channelTimeFactor);
                }
                else {
                    this.inChanneling = false;
                }
            }
            // calculate Stats
            // TODO: seperate calculation to 2 phase, base and battle stats.
            this.calcStats(mob);
            // update spells
            for (let spell in this.spells) {
                if (this.spells.hasOwnProperty(spell)) {
                    this.spells[spell].update(mob, dt);
                }
            }
        }
        addBuff(buff) {
            this.addListener(buff, buff.source, (arg) => {
                if (arg instanceof Buff_1.default) {
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
            return this.listeners.liveQuery((arg) => (arg instanceof Buff_1.default && arg.name.includes(buffname)), undefined);
        }
        addListener(listener, source, callback) {
            this.listeners.addItem(listener, callback);
            listener.emit('add', undefined, this, source);
        }
        removeListener(listener, source) {
            if (!listener) {
                return;
            }
            // TODO: Who removed this listener ?
            listener.emit('remove', undefined, this, source);
            this.listeners.removeItem(listener);
        }
        cast(mob, target, spell) {
            // Check if ready to cast
            if (mob.data.canCastSpell() == false || spell.preCast(mob, target) == false) {
                return;
            }
            // TODO: Check mana cost, cooldown etc.
            // May combined into readyToCast().
            // Start GCD Timer
            mob.data.globalCDRemain = spell.globalCoolDown / mob.data.modifiers.spellSpeed;
            if (spell.isCast == true) {
                // Start casting
                mob.data.inCasting = true;
                mob.data.castTime = spell.castTime / mob.data.modifiers.spellSpeed;
                mob.data.castRemain = mob.data.castTime;
                mob.data.currentSpell = spell;
            }
            else {
                mob.data.finishCast(mob, target, spell);
            }
        }
        finishCast(mob, target, spell) {
            mob.data.inCasting = false;
            if (spell.isChannel == true) {
                // Start channeling
                mob.data.inChanneling = true;
                mob.data.channelTimeFactor = mob.data.modifiers.spellSpeed;
                mob.data.channelTime = spell.channelTime / mob.data.channelTimeFactor;
                mob.data.channelRemain = mob.data.channelTime;
            }
            spell.cast(mob, target);
        }
        calcStats(mob) {
            // TODO: Stats calculation:
            // 1. Calculate (get) base stats from self
            for (let stat in this.baseStats) {
                this.baseStats[stat] = this.baseStatsFundemental[stat];
            }
            // 2. Add equipment base stats to self by listener.calcBaseStats()
            this.updateListeners(this, 'onBaseStatCalculation', this);
            // 3. Reset battle stats
            this.battleStats = {
                resist: {
                    physical: 0,
                    elemental: 10,
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
                crit: 20,
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
            // 4. Calculate battle (advanced) stats from base stats (e.g. atkPower = INT * 0.7 * floor( MAG * 1.4 ) ... )
            // 5. Add equipment by listener.calcStats()
            // Actually, those steps were combined in a single call,
            // as the calculation step of each class will happen in their player classes,
            // which should be the first called listener in updateListeners().
            this.updateListeners(this, 'onStatCalculation', this);
            this.updateListeners(this, 'onStatCalculationFinish', this);
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
                return { isAvoid: true };
            }
            // N.B. if you want do something if target avoid, e.g. deal extra on avoid,
            // you should let it change the damage at onDealDamage() when isAvoid == true. (e.g. set other to 0 and add extra damage)
            // then set isAvoid to false. You can also pop some text when you add the extra damage.
            // Do the calculation
            for (var dmgType in damageInfo.value) {
                // damage% = 1.0353 ^ power
                // 20pts of power = 100% more damage
                if (damageInfo.source) {
                    damageInfo.value[dmgType] = Math.ceil(damageInfo.value[dmgType] *
                        (Math.pow(1.0353, damageInfo.source.battleStats.attackPower[GameData.damageType[dmgType]] +
                            damageInfo.source.battleStats.attackPower[dmgType])));
                }
                // damage% = 0.9659 ^ resist
                // This is, every 1 point of resist reduces corresponding damage by 3.41%, 
                // which will reach 50% damage reducement at 20 points.
                // TODO: it should all correspond to current level (resist based on source level, atkPower based on target level, same as healing)
                damageInfo.value[dmgType] = Math.ceil(damageInfo.value[dmgType] *
                    (Math.pow(0.9659, this.battleStats.resist[GameData.damageType[dmgType]] +
                        this.battleStats.resist[dmgType])));
                // Apply criticals
                damageInfo.value[dmgType] = Math.ceil(damageInfo.value[dmgType] *
                    (damageInfo.isCrit ? GameData.critMultiplier[dmgType] : 1.0));
            }
            // Let everyone know what is happening
            // damageObj.damage = finalDmg;
            this.updateListeners(damageInfo.target, 'receiveDamageFinal', damageInfo);
            if (damageInfo.source) {
                damageInfo.source.updateListeners(damageInfo.source, 'dealDamageFinal', damageInfo);
            }
            // Decrese HP
            // Check if I am dead
            let realDmg = { fire: 0, water: 0, ice: 0, wind: 0, nature: 0, light: 0, thunder: 0, slash: 0, pierce: 0, knock: 0, heal: 0 };
            for (let dmg in damageInfo.value) {
                realDmg[dmg] += Math.min(this.currentHealth, damageInfo.value[dmg]);
                this.currentHealth -= realDmg[dmg];
                damageInfo.overdeal[dmg] = damageInfo.value[dmg] - realDmg[dmg];
                damageInfo.value[dmg] = realDmg[dmg];
                // game.data.monitor.addDamage(damageInfo.value[dmg], dmg, damageInfo.source, damageInfo.target, damageInfo.isCrit, damageInfo.spell);
            }
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
            return damageInfo.value;
        }
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
                healInfo.value.heal = Math.ceil(healInfo.value.heal *
                    (Math.pow(1.0353, healInfo.source.battleStats.attackPower.heal)));
            }
            // damage% = 0.9659 ^ resist
            // This is, every 1 point of resist reduces corresponding damage by 3.41%, 
            // which will reach 50% damage reducement at 20 points.
            healInfo.value.heal = Math.ceil(healInfo.value.heal *
                (Math.pow(0.9659, this.battleStats.resist.heal)));
            healInfo.value.heal = Math.ceil(healInfo.value.heal
                * (healInfo.isCrit ? GameData.critMultiplier.heal : 1.0));
            // calculate overHealing using current HP and max HP.
            let realHeal = Math.min(healInfo.target.maxHealth - healInfo.target.currentHealth, healInfo.value.heal);
            healInfo.overdeal.heal = healInfo.value.heal - realHeal;
            healInfo.value.heal = realHeal;
            // Let buffs and agents know what is happening
            this.updateListeners(healInfo.target, 'receiveHealFinal', healInfo);
            if (healInfo.source) {
                healInfo.source.updateListeners(healInfo.source, 'dealHealFinal', healInfo);
            }
            // Increase the HP.
            this.currentHealth += healInfo.value.heal;
            // game.data.monitor.addHeal(healInfo.value.heal, healInfo.overdeal.heal, healInfo.source, healInfo.target, healInfo.isCrit, healInfo.spell);
            return healInfo.value.heal;
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
    class MobListener extends EventSystem.EventElement {
        constructor() {
            super(DataBackend.getSingleton().eventSystem);
            this.enabled = true;
            this.isOver = false;
            this.focusList = new Set();
            this.priority = 0;
            this.enabled = true;
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
        update(dt) {
            for (let mob of this.focusList) {
                // if(!Mob.checkExist(mob))
                // {
                // this.focusList.delete(mob);
                // }
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
        onAdded(mob, source) { }
        // When this listener was removed from the mob by source
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
        // Be triggered when the mob is updating.
        // This will be triggered before onStatCalculation.
        // e.g. reduce remain time, etc.
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
                this.coolDownRemain -= dt * 0.001;
            }
            this.available = this.isAvailable(mob);
            this.onUpdate(mob, dt);
        }
        onUpdate(mob, dt) { }
        onCast(mob, target) { }
        onChanneling(mob, target, dt) { }
        preCast(mob, target) {
            if (this.available && mob.data.canCastSpell() && mob.data.hasMana(this.getManaCost(mob))) {
                return true;
            }
            return false;
        }
        cast(mob, target) {
            if (this.available && mob.data.useMana(this.getManaCost(mob))) {
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
/** @module Core */
define("core/EquipmentCore", ["require", "exports", "core/DataBackend"], function (require, exports, DataBackend_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Equipable extends DataBackend_2.MobListener {
        constructor() {
            super();
        }
    }
    exports.Equipable = Equipable;
    class Armor extends Equipable {
    }
    exports.Armor = Armor;
    class Weapon extends Equipable {
    }
    exports.Weapon = Weapon;
    class Accessory extends Equipable {
    }
    exports.Accessory = Accessory;
});
/** @module Core */
define("core/mRTypes", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
/** @module GameEntity */
define("Mob", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Mob {
        constructor(settings) {
            this.sprite = settings.sprite;
            this.moveAnim = settings.moveAnim;
            if (this.moveAnim) {
                this.sprite.play(this.moveAnim);
            }
        }
        update(dt) {
            this.sprite.x += dt / 1000.0 * 10;
        }
        getEquipableTags(type) {
            return [];
        }
        static checkExist(mob) {
            return (mob == null);
        }
    }
    exports.default = Mob;
});
/** @module GameScene */
define("ExampleScene", ["require", "exports", "Events/EventSystem", "Phaser", "Mob", "DynamicLoader/dSprite"], function (require, exports, Events, Phaser, Mob_1, dSprite_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Events = __importStar(Events);
    Phaser = __importStar(Phaser);
    Mob_1 = __importDefault(Mob_1);
    dSprite_1 = __importDefault(dSprite_1);
    class ExampleScene extends Phaser.Scene {
        constructor() {
            super({ key: 'ExampleScene' });
            this.logo_scale = 0.5;
            this.eventSystem = new Events.EventSystem();
            this.objs = [];
            this.cnt = 0;
            this.alive = [];
        }
        preload() {
            this.load.image('logo', 'assets/BlueHGRMJsm.png');
            this.width = this.sys.game.canvas.width;
            this.height = this.sys.game.canvas.height;
            this.load.image('Grass_Overworld', 'assets/tilemaps/tiles/overworld_tileset_grass.png');
            this.load.tilemapTiledJSON('overworld', 'assets/tilemaps/Overworld_tst.json');
            // this.load.spritesheet('elf', 'assets/forestElfMyst.png', {frameWidth: 32, frameHeight: 32, endFrame: 3});
        }
        create() {
            this.map = this.make.tilemap({ key: 'overworld' });
            this.tiles = this.map.addTilesetImage('Grass_Overworld', 'Grass_Overworld');
            this.terrainLayer = this.map.createStaticLayer('Terrain', this.tiles, 0, 0);
            // this.anims.create({key: 'move', frames: this.anims.generateFrameNumbers('elf', {start: 0, end: 3, first: 0}), frameRate: 8, repeat: -1});
            // this.alive.push(new Mob(this.add.sprite(100, 200, 'elf'), 'move'));
            let girl = new Mob_1.default({
                'sprite': new dSprite_1.default(this, 100, 200, 'char_sheet_forestelf_myst'),
                'moveAnim': ''
            });
            this.alive.push(girl);
            this.add.existing(girl.sprite);
        }
        update(time, dt) {
            for (let m of this.alive) {
                m.update(dt);
            }
        }
    }
    exports.default = ExampleScene;
});
/** @module GameScene */
define("SimpleGame", ["require", "exports", "ExampleScene", "DynamicLoader/DynamicLoaderScene"], function (require, exports, ExampleScene_1, DynamicLoaderScene_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ExampleScene_1 = __importDefault(ExampleScene_1);
    DynamicLoaderScene_2 = __importDefault(DynamicLoaderScene_2);
    class InitPhaser {
        static initGame() {
            let config = {
                type: Phaser.AUTO,
                width: 1024,
                height: 640,
                scene: [ExampleScene_1.default],
                banner: true,
                title: 'Playground',
                url: 'https://updatestage.littlegames.app',
                version: '-1.0',
            };
            this.gameRef = new Phaser.Game(config);
            this.gameRef.scene.add('DynamicLoaderScene', DynamicLoaderScene_2.default.getSingleton(), true);
        }
    }
    exports.default = InitPhaser;
    InitPhaser.initGame();
});
/** @module Core */
define("core/BattleMonitor", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class BattleMonitor {
    }
    exports.default = BattleMonitor;
});
//# sourceMappingURL=gameMain.js.map