/** @packageDocumentation @moduleeDocumentation @module SpellDatas */

import { SpellData } from "../Engine/Core/SpellData";
import { mRTypes } from "../Engine/Core/mRTypes";
import { Mob } from "../Engine/GameObjects/Mob";
import { UnitManager } from "../Engine/Core/UnitManager";
import { GameData } from "../Engine/Core/GameData";
import { SpellFlags } from "../Engine/GameObjects/Spell";
import { Helper, getRandomInt } from "../Engine/Core/Helper";
import { TauntBasedAgent } from "../Engine/Agents/MobAgent";
import { Game } from "phaser";
import { Buff } from "../Engine/Core/Buff";
import * as Buffs from '../Buffs/'

export class FloraHeal extends SpellData
{
    totalTime: number;
    hitCount: number;

    constructor(settings: mRTypes.Settings.SpellData)
    {
        super(settings);

        this.isCast = true;
        this.isChannel = true;
        this.channelTime = 2.4;
        this.castTime = 1.4;

        this.manaCost = 8;

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
        if (Math.ceil(this.totalTime / 0.8) > this.hitCount)
        {
            this.hitCount++;

            UnitManager.getCurrent().getUnitList(
                UnitManager.sortByHealthPercentage,
                UnitManager.NOOP,
                mob.mobData.isPlayer,
            ).slice(0, 3).forEach(target =>
            {
                mob.dealDamageHeal(target, {
                    'value': getRandomInt(4, 6),
                    'type': GameData.Elements.heal,
                    'spell': {
                        'name': this.name,
                        'flags': new Set([
                            SpellFlags.areaEffect,
                        ])
                    }
                });
            })
        }
    }
}

export class Taunt extends SpellData
{
    constructor(settings: mRTypes.Settings.SpellData)
    {
        settings.coolDown = settings.coolDown || 8;

        super(settings);

        this.isCast = true;
        this.castTime = 0.7;

        this.manaCost = 0;
    }

    onCast(mob: Mob, target: Mob | Phaser.Math.Vector2)
    {
        let myPos = mob.footPos();
        let targets = UnitManager.getCurrent().getUnitList(
            UnitManager.IDENTITY,
            (a: Mob) => (myPos.distance(a.footPos()) < 250),
            !mob.mobData.isPlayer
        );

        if (targets.length <= 0) { return; }

        for (let i = 0; i < targets.length; i++)
        {
            let agent = targets[i].agent;
            if (agent instanceof TauntBasedAgent)
            {
                agent.changeTaunt(mob, 2000);
            }
        }
    }
}

export class BigHeal extends SpellData
{
    constructor(settings: mRTypes.Settings.SpellData)
    {
        settings.coolDown = settings.coolDown || 6;

        super(settings);

        this.isCast = true;
        this.castTime = 1.5;

        this.manaCost = 25;
    }

    onCast(mob: Mob, target: Mob | Phaser.Math.Vector2)
    {
        let myPos = mob.footPos();
        let targets = UnitManager.getCurrent().getUnitList(
            UnitManager.sortByHealthPercentage,
            UnitManager.NOOP,
            mob.mobData.isPlayer
        );

        if (targets.length <= 0) { return; }

        mob.dealDamageHeal(targets[0], {
            'type': GameData.Elements.heal,
            'value': 186,
            'spell': {
                'name': 'BigHeal',
                'flags': new Set<SpellFlags>([SpellFlags.hasTarget])
            }
        });

        targets[0].receiveBuff(mob, new Buffs.HDOT(Buff.fromKey('test_GodHeal', { 'source': mob.mobData, 'time': 12.0 }), GameData.Elements.heal, 5, 10, 0.5))
    }
}
