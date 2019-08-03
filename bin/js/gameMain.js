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
define("ExampleScene", ["require", "exports", "Events/EventSystem", "Phaser"], function (require, exports, Events, Phaser) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Events = __importStar(Events);
    Phaser = __importStar(Phaser);
    class ExampleScene extends Phaser.Scene {
        constructor() {
            super({ key: 'ExampleScene' });
            this.logo_scale = 0.5;
            this.eventSystem = new Events.EventSystem();
            this.objs = [];
            this.cnt = 0;
        }
        preload() {
            this.load.image('logo', 'assets/BlueHGRMJsm.png');
            this.width = this.sys.game.canvas.width;
            this.height = this.sys.game.canvas.height;
        }
        create() {
            this.logo = this.add.image(this.width / 2, this.height / 2, 'logo');
            this.logo.setScale(this.logo_scale, this.logo_scale);
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
        }
        update(time, dt) {
            // this.cnt ++;
            // if(this.cnt > 20)
            // {
            //     console.log(1000.0 / dt);
            //     this.cnt = 0;
            // }
            this.logo_scale = time / 10000.0;
            this.logo.setScale(this.logo_scale, this.logo_scale);
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
                width: 400,
                height: 240,
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