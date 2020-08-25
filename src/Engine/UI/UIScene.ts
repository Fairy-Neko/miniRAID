/**
 * @packageDocumentation
 * @module UI
 */

import { PopUpManager } from "./PopUpManager";
import { UnitFrame, BuffFrame } from "./UnitFrame";
import { UnitManager } from "../Core/UnitManager";
import { Mob } from "../GameObjects/Mob";
import { Localization, _ } from "./Localization";
import { MonitorFrame } from "./MonitorFrame";
import { BattleMonitor } from "../Core/BattleMonitor";

export class UIScene extends Phaser.Scene
{
    static instance: UIScene;
    loaded: boolean = false;
    unitFrames: UnitFrame[] = [];
    playerCache: Mob[];

    static getSingleton(): UIScene
    {
        if (!UIScene.instance)
        {
            UIScene.instance = new UIScene({ key: 'UIScene' });
            console.log("registering UI Scene...");
        }
        return UIScene.instance;
    }

    preload()
    {
        this.load.bitmapFont('smallPx', './assets/fonts/smallPx_C_0.png', './assets/fonts/smallPx_C.fnt');
        this.load.bitmapFont('smallPx_HUD', './assets/fonts/smallPx_HUD_0.png', './assets/fonts/smallPx_HUD.fnt');
        this.load.bitmapFont('mediumPx', './assets/fonts/mediumPx_04b03_0.png', './assets/fonts/mediumPx_04b03.fnt');
        this.load.bitmapFont('simsun', './assets/fonts/simsun_0.png', './assets/fonts/simsun.fnt');
        this.load.bitmapFont('simsun_o', './assets/fonts/simsun_outlined_0.png', './assets/fonts/simsun_outlined.fnt');

        this.load.json('locals', './assets/locals.json');

        this.add.existing(PopUpManager.register(this));
    }

    create()
    {
        this.loaded = true;
        Localization.setData(this.cache.json.get('locals'));
        this.initUnitFrames();
        PopUpManager.getSingleton().hasLoaded();

        // this.add.rectangle(750 + 61, 520 + 8, 122, 16, 0x948779);
        let bt = this.add.bitmapText(755, 530, _("UIFont"), _("Damage Done (DPS)"));
        bt.setOrigin(0, 1);

        // this.add.rectangle(880 + 61, 520 + 8, 122, 16, 0x948779);
        bt = this.add.bitmapText(885, 530, _("UIFont"), _("Healing Done (HPS)"));
        bt.setOrigin(0, 1);

        this.add.existing(new MonitorFrame(this, 750, 534, () => { return BattleMonitor.getSingleton().getDamageList(); }, 122, 114));
        this.add.existing(new MonitorFrame(this, 880, 534, () => { return BattleMonitor.getSingleton().getHealList(); }, 122, 114));
    }

    clearUnitFrame()
    {
        for (let u of this.unitFrames)
        {
            u.destroy();
        }
        this.unitFrames = [];
    }

    resetPlayers()
    {
        this.clearUnitFrame();

        this.playerCache = Array.from(UnitManager.getCurrent().player.values());
        if (this.loaded)
        {
            this.initUnitFrames();
        }
    }

    initUnitFrames()
    {
        if (this.playerCache === undefined) { return; }
        let cnt = 0;
        for (let player of this.playerCache)
        {
            let x = 35 + (cnt % 4) * 180;
            let y = 522 + Math.floor(cnt / 4) * 70;

            let tmp = new UnitFrame(this, x, y, player);
            // let bF = new BuffFrame(this, x - 28, y + 37, x - 28, y + 37, 160, 30, player.mobData);
            // let tmp = new UnitFrame(this, 20, 20 + cnt * 70, player);
            // this.add.existing(bF);
            this.add.existing(tmp);
            this.unitFrames.push(tmp);
            cnt += 1;
        }
    }

    update(time: number, dt: number)
    {
        this.children.each((item: Phaser.GameObjects.GameObject) => { item.update(time / 1000.0, dt / 1000.0); });
    }
}
