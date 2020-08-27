/** @packageDocumentation @moduleeDocumentation @module SpellData */

import { SpellData } from "../Engine/Core/SpellData";
import { mRTypes } from "../Engine/Core/mRTypes";
import { Mob } from "../Engine/GameObjects/Mob";
import { UnitManager } from "../Engine/Core/UnitManager";
import { GameData } from "../Engine/Core/GameData";
import { SpellFlags } from "../Engine/GameObjects/Spell";
import { Helper, getRandomInt } from "../Engine/Core/Helper";

export class FloraHeal extends SpellData
{
    totalTime: number;
    hitCount: number;

    constructor(settings: mRTypes.Settings.SpellData)
    {
        super(settings);

        this.isCast = true;
        this.isChannel = true;
        this.channelTime = 2.0;
        this.castTime = 1.5;

        this.totalTime = 0;
        this.hitCount = 0;
    }

    onCast(mob: Mob, target: Mob | Phaser.Math.Vector2)
    {
        this.totalTime = 0;
        this.hitCount = -1;
    }

    onChanneling(mob: Mob, target: Mob | Phaser.Math.Vector2, dt: number)
    {
        this.totalTime += dt;
        if (Math.ceil(this.totalTime / 0.3) > this.hitCount)
        {
            this.hitCount++;

            UnitManager.getCurrent().getUnitList(
                UnitManager.sortByHealthPercentage,
                UnitManager.NOOP,
                mob.mobData.isPlayer,
            ).forEach(target =>
            {
                target.receiveHeal({
                    'source': mob,
                    'value': getRandomInt(2, 5),
                    'type': GameData.Elements.heal,
                    'spell': {
                        'name': this.name,
                        'flags': new Set([
                            SpellFlags.areaEffect,
                            SpellFlags.isHeal,
                        ])
                    }
                });
            })
        }
    }
}
