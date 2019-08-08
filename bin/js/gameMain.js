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
 * @module event
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
        emit(evt, ...args) {
            return this.parentSystem.emit(this, evt, args);
        }
        emitArray(evt, args) {
            return this.parentSystem.emit(this, evt, args);
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
        emit(src, evt, args) {
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
                        callback.apply(dst, args);
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
/**
 * @module DynamicLoader
 */
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
define("core/Buff", ["require", "exports", "core/DataBackend"], function (require, exports, DataBackend_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Buff extends DataBackend_1.MobListener {
        constructor(settings) {
            super();
        }
    }
    exports.default = Buff;
});
define("core/DataBackend", ["require", "exports", "Events/EventSystem", "core/InventoryCore"], function (require, exports, EventSystem, InventoryCore_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    EventSystem = __importStar(EventSystem);
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
            this.listeners = new Set();
            // buff list, only for rendering UI
            // buffs are actually plain mob listeners
            // maybe they have something different (x)
            this.buffList = new Set();
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
        // updateMobBackend(mob:Mob, dt:number)
        // {
        //     // Register parent mob
        //     if(typeof this.parentMob == undefined)
        //     {
        //         this.parentMob = mob;
        //     }
        //     // Switch weapon ?
        //     if(this.shouldSwitchWeapon === true)
        //     {
        //         this.shouldSwitchWeapon = false;
        //         if(typeof this.anotherWeapon !== "undefined")
        //         {
        //             var tmp = this.currentWeapon;
        //             this.currentWeapon = this.anotherWeapon;
        //             this.anotherWeapon = tmp;
        //         }
        //         this.removeListener(this.anotherWeapon);
        //         this.addListener(this.currentWeapon);
        //         // I switched my weapon !!!
        //         this.updateListeners(this, 'onSwitchWeapon', [this, this.currentWeapon]);
        //     }
        //     // Update all listeners
        //     this.updateListeners(mob, 'onUpdate', [mob, dt]);
        //     for (let listener of this.listeners.values())
        //     {
        //         if(listener.isOver == true)
        //         {
        //             //this buff is over. delete it from the list.
        //             // this.buffList.delete(buff);
        //             this.removeListener(listener);
        //         }
        //     }
        //     // Mana Regen
        //     if(typeof this.currentWeapon !== "undefined")
        //     {
        //         this.currentMana += dt * this.currentWeapon.manaRegen * 0.001; // change to this.manaRegen plz
        //     }
        //     if(this.currentMana > this.maxMana)
        //     {
        //         this.currentMana = this.maxMana;
        //     }
        //     // Spell Casting
        //     if(this.globalCDRemain > 0)
        //     {
        //         this.globalCDRemain -= dt * 0.001;
        //     }
        //     else
        //     {
        //         this.globalCDRemain = 0;
        //     }
        //     if(this.isMoving == true)
        //     {
        //         // TODO: check if this can cast during moving
        //         this.inCasting = false;
        //         this.inChanneling = false;
        //         this.castRemain = 0;
        //         this.channelRemain = 0;
        //     }
        //     if(this.inCasting == true)
        //     {
        //         if(this.castRemain > 0)
        //         {
        //             this.castRemain -= dt * 0.001;
        //         }
        //         else
        //         {
        //             this.inCasting = false;
        //             this.finishCast(mob, this.currentSpellTarget, this.currentSpell);
        //         }
        //     }
        //     if(this.inChanneling == true)
        //     {
        //         if(this.channelRemain > 0)
        //         {
        //             this.channelRemain -= dt * 0.001;
        //             this.currentSpell.onChanneling(mob, this.currentSpellTarget, dt * 0.001 * this.channelTimeFactor);
        //         }
        //         else
        //         {
        //             this.inChanneling = false;
        //         }
        //     }
        //     // calculate Stats
        //     // TODO: seperate calculation to 2 phase, base and battle stats.
        //     this.calcStats(mob);
        //     // update spells
        //     for (let spell in this.spells)
        //     {
        //         if(this.spells.hasOwnProperty(spell))
        //         {
        //             this.spells[spell].update(mob, dt);
        //         }
        //     }
        // }
        // // Function used to tell buffs and agents what was going on
        // // when damage and heal happens. They can modify them.
        // updateListeners(mobData:MobData, method:string, ...args: any[])
        // {
        //     var flag = false;
        //     // call every listener in the order of priority
        //     for(let listener of this.listeners.values())
        //     {
        //         if(  listener != mob && 
        //             (listener.enabled == undefined || listener.enabled && listener.enabled == true)
        //           && listener[method])
        //         {
        //             flag = flag | listener[method].apply(listener, args);
        //         }
        //     }
        //     return flag;
        // }
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
    class MobListener extends EventSystem.EventElement {
        constructor() {
            super(DataBackend.getSingleton().eventSystem);
            this.focusList = new Set();
            this.priority = 0;
            this.enabled = true;
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
        // Be triggered when the mob switches its weapon.
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
        onFocusDealDamage(damageInfo) { return false; }
        onFocusDealDamageFinal(damageInfo) { return false; }
        onFocusDealHeal(healInfo) { return false; }
        onFocusDealHealFinal(healInfo) { return false; }
        onFocusReceiveDamage(damageInfo) { return false; }
        onFocusReceiveDamageFinal(damageInfo) { return false; }
        onFocusReceiveHeal(healInfo) { return false; }
        onFocusReceiveHealFinal(healInfo) { return false; }
        onFocusKill(damageInfo) { return false; }
        onFocusDeath(damageInfo) { return false; }
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
define("core/mRTypes", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
/** @module thing1 */
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
/** @module thing1 */
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
/** @module thing1 */
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
/**
 * Event module
 *
 * @module event
 * @preferred
 */
define("core_tmp", ["require", "exports", "Events/EventSystem"], function (require, exports, EventSystem_1) {
    "use strict";
    function __export(m) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    __export(EventSystem_1);
});
define("Structs/QuerySet", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class QuerySet {
        constructor(key) {
            this.result = new Map();
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
        addQuery(name, filter, sort) {
            // Note that every time you call this will force the query to be refreshed even if it is the same query
            this.result.set(name, {
                'filter': filter,
                'sort': sort,
                'latest': -1,
                'data': [],
            });
        }
        addItem(item, failCallback) {
            if (this.keyFn) {
            }
            else {
                let key = this.keyFn(item);
                if (!this.data.has(key)) {
                    this.data.set(key, item);
                }
                else if (failCallback) {
                }
            }
        }
        query(name) {
        }
    }
    exports.default = QuerySet;
});
define("core/BattleMonitor", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class BattleMonitor {
    }
    exports.default = BattleMonitor;
});
//# sourceMappingURL=gameMain.js.map