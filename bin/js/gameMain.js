"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var Example;
(function (Example) {
    class ExampleScene extends Phaser.Scene {
        constructor() {
            super({ key: 'ExampleScene' });
            this.logo_scale = 0.5;
        }
        preload() {
            this.load.image('logo', 'assets/BlueHGRMJsm.png');
        }
        create() {
            this.logo = this.add.image(Example.InitPhaser.gameRef.config["width"] / 2, Example.InitPhaser.gameRef.config["height"] / 2, 'logo');
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
        }
        update(time, dt) {
            this.logo_scale = time / 10000.0;
            this.logo.setScale(this.logo_scale, this.logo_scale);
        }
    }
    Example.ExampleScene = ExampleScene;
})(Example || (Example = {}));
/// <reference path='ExampleScene.ts'/>
var Example;
(function (Example) {
    class InitPhaser {
        static initGame() {
            let config = {
                type: Phaser.AUTO,
                width: 400,
                height: 240,
                scene: [Example.ExampleScene],
                banner: true,
                title: 'Playground',
                url: 'https://updatestage.littlegames.app',
                version: '-1.0',
            };
            this.gameRef = new Phaser.Game(config);
        }
    }
    Example.InitPhaser = InitPhaser;
})(Example || (Example = {}));
window.onload =
    () => {
        Example.InitPhaser.initGame();
    };
define("Events/EventSystem", ["require", "exports", "typescript-collections"], function (require, exports, Collections) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Collections = __importStar(Collections);
    class EventElement {
        constructor(parentSystem) {
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
        emit(src, evt, ...args) {
            var totalCnt = 0;
            if (this.dict.containsKey(src)) {
                var srcDict = this.dict.getValue(src);
                if (srcDict.containsKey(evt)) {
                    var evtList = srcDict.getValue(evt);
                    // Pack argument array
                    var lst = [src];
                    lst.push.apply(args);
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
//# sourceMappingURL=gameMain.js.map