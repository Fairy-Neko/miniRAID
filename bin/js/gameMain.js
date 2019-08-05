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
define("mob", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Mob {
        constructor(sprite, moveAnim) {
            this.sprite = sprite;
            this.moveAnim = moveAnim;
            this.sprite.play(this.moveAnim);
        }
        update(dt) {
            this.sprite.x += dt / 1000.0 * 10;
        }
    }
    exports.default = Mob;
});
define("ExampleScene", ["require", "exports", "Events/EventSystem", "Phaser", "mob"], function (require, exports, Events, Phaser, mob_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Events = __importStar(Events);
    Phaser = __importStar(Phaser);
    mob_1 = __importDefault(mob_1);
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
            this.load.spritesheet('elf', 'assets/forestElfMyst.png', { frameWidth: 32, frameHeight: 32, endFrame: 3 });
        }
        create() {
            this.map = this.make.tilemap({ key: 'overworld' });
            this.tiles = this.map.addTilesetImage('Grass_Overworld', 'Grass_Overworld');
            this.terrainLayer = this.map.createStaticLayer('Terrain', this.tiles, 0, 0);
            this.anims.create({ key: 'move', frames: this.anims.generateFrameNumbers('elf', { start: 0, end: 3, first: 0 }), frameRate: 8 });
            this.alive.push(new mob_1.default(this.add.sprite(100, 200, 'elf', 4), 'move'));
        }
        update(time, dt) {
            for (let m of this.alive) {
                m.update(dt);
            }
        }
    }
    exports.default = ExampleScene;
});
define("SimpleGame", ["require", "exports", "ExampleScene"], function (require, exports, ExampleScene_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ExampleScene_1 = __importDefault(ExampleScene_1);
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
        }
    }
    exports.default = InitPhaser;
    console.log("!");
    InitPhaser.initGame();
});
//# sourceMappingURL=gameMain.js.map