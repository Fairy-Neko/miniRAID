"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Example;
(function (Example) {
    var ExampleScene = /** @class */ (function (_super) {
        __extends(ExampleScene, _super);
        function ExampleScene() {
            return _super.call(this, { key: 'ExampleScene' }) || this;
        }
        ExampleScene.prototype.preload = function () {
            this.load.image('logo', 'assets/BlueHGRMJsm.png');
        };
        ExampleScene.prototype.create = function () {
            this.logo = this.add.image(Example.InitPhaser.gameRef.config["width"] / 2, Example.InitPhaser.gameRef.config["height"] / 2, 'logo');
            this.logo.setScale(.5, .5);
            var tween = this.tweens.add({
                targets: this.logo,
                scaleX: { value: 1.0, duration: 2000, ease: 'Back.easeInOut' },
                scaleY: { value: 1.0, duration: 2000, ease: 'Back.easeInOut' },
                yoyo: true,
                repeat: -1
            });
            // for (var i:number = 0; i < 4000; i++)
            // {
            //     var tmpText = this.add.text(16 + (i % 40) * 20, 16 + Math.floor(i / 40) * 20, '哇哦', {fontSize: '9px'});
            // }
        };
        return ExampleScene;
    }(Phaser.Scene));
    Example.ExampleScene = ExampleScene;
})(Example || (Example = {}));
/// <reference path='ExampleScene.ts'/>
var Example;
(function (Example) {
    var InitPhaser = /** @class */ (function () {
        function InitPhaser() {
        }
        InitPhaser.initGame = function () {
            var config = {
                type: Phaser.AUTO,
                width: 960,
                height: 540,
                scene: [Example.ExampleScene],
                banner: true,
                title: 'Playground',
                url: 'https://updatestage.littlegames.app',
                version: '-1.0',
            };
            this.gameRef = new Phaser.Game(config);
        };
        return InitPhaser;
    }());
    Example.InitPhaser = InitPhaser;
})(Example || (Example = {}));
window.onload =
    function () {
        Example.InitPhaser.initGame();
    };
//# sourceMappingURL=gameMain.js.map