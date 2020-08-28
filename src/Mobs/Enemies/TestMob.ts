/** @packageDocumentation @module Mobs.Enemies */

import { Mob } from "../../Engine/GameObjects/Mob";
import { mRTypes } from "../../Engine/Core/mRTypes";
import * as Agents from "../../Agents"
import { TauntBasedAgent } from "../../Engine/Agents/MobAgent";
import * as Weapons from "../../Weapons"
import { EquipSlots } from "../../Engine/Core/MobData";

export class TestMob extends Mob
{
    constructor(scene: Phaser.Scene, x: number, y: number, sprite: string, settings: mRTypes.Settings.Mob)
    {
        settings.agent = settings.agent || TauntBasedAgent;
        super(scene, x, y, sprite || 'sheet_gripe_run_right', settings);

        this.imageFacingRight = true;

        let myWeapon = new Weapons.CometWand();
        myWeapon.manaCost = 0;
        myWeapon.activeRange = 150;
        myWeapon.targetCount = 2;
        this.mobData.equip(myWeapon, EquipSlots.MainHand);
    }
}