/** @packageDocumentation @module Core */

import { MobData } from "./MobData";
import { GameData } from "./GameData";
import { UnitManager } from "./UnitManager";
import { DataBackend } from "./DataBackend";
import { mRTypes } from "./mRTypes";

export namespace BattleData
{
    export interface dmgData
    {
        total: number,
        normal: number,
        crit: number,
        targetDict: { [index: string]: { total: number, normal: number, crit: number } },
        typeDict: { [index: string]: { total: number, normal: number, crit: number } },
        spellDict: { [index: string]: { total: number, normal: number, crit: number } },
        player: MobData,
    }

    export interface healData
    {
        total: number,
        real: number,
        over: number,
        targetDict: { [index: string]: { total: number, real: number, over: number } },
        spellDict: { [index: string]: { total: number, real: number, over: number } },
        player: MobData,
    }

    export type MonitorOutputRow = { number: number; length: number; slices: [number, number]; colors: [number, number]; player: MobData };
    export type MonitorOutput = [MonitorOutputRow];
}

export class BattleMonitor
{
    time: number;
    damageDict: { [index: string]: BattleData.dmgData };
    healDict: { [index: string]: BattleData.healData };

    private static instance: BattleMonitor;
    static getSingleton(): BattleMonitor
    {
        if (!BattleMonitor.instance)
        {
            BattleMonitor.instance = new BattleMonitor();
        }
        return BattleMonitor.instance;
    }

    private constructor()
    {
        this.time = 0;
        this.damageDict = {};
        this.healDict = {};
    }

    update(dt: number)
    {
        // If there are any enemy on the field
        if (UnitManager.getCurrent().enemy.size > 0 && UnitManager.getCurrent().getPlayerList(UnitManager.IDENTITY, UnitManager.NOOP, false).length > 0)
        {
            this.time += dt;
        }
    }

    clear(dt: number)
    {
        this.time = 0;
        this.damageDict = {};
        this.healDict = {};
    }

    add(dmg: mRTypes.DamageHeal)
    {
        if (dmg.source)
        {
            let source = dmg.source;
            let value = dmg.value;

            let spell: string = undefined;
            if (dmg.spell)
            {
                spell = dmg.spell.name;
            }

            if (source.isPlayer === true)
            {
                if (dmg.type !== GameData.Elements.heal)
                {
                    // Create a dict if it does not exist
                    this.damageDict[source.name] = this.damageDict[source.name] ||
                    {
                        total: 0,
                        normal: 0,
                        crit: 0,
                        targetDict: {},
                        typeDict: {},
                        spellDict: {},
                        player: source,
                    };

                    //Category: spell
                    if (typeof spell !== "undefined")
                    {
                        this.damageDict[source.name].spellDict[spell] = this.damageDict[source.name].spellDict[spell] || { total: 0, normal: 0, crit: 0 };
                    }

                    this.damageDict[source.name].total += value;
                    if (spell) { this.damageDict[source.name].spellDict[spell].total += value; }

                    if (dmg.isCrit === true)
                    {
                        this.damageDict[source.name].crit += value;
                        if (spell) { this.damageDict[source.name].spellDict[spell].crit += value; }
                    }
                    else
                    {
                        this.damageDict[source.name].normal += value;
                        if (spell) { this.damageDict[source.name].spellDict[spell].normal += value; }
                    }

                    //TODO: Category - target, type
                }
                else
                {
                    // Calculate the propotion of overheal
                    let overhealPropotion = dmg.overdeal / dmg.value;

                    // Create a dict if it does not exist
                    this.healDict[source.name] = this.healDict[source.name] ||
                    {
                        total: 0,
                        real: 0,
                        over: 0,
                        // TODO: crit
                        targetDict: {},
                        spellDict: {},
                        player: source,
                    };

                    let realHeal = value;
                    let overHeal = dmg.overdeal;

                    this.healDict[source.name].total += realHeal + overHeal;
                    this.healDict[source.name].real += realHeal;
                    this.healDict[source.name].over += overHeal;

                    //Category: spell
                    if (typeof spell !== "undefined")
                    {
                        this.healDict[source.name].spellDict[spell] = this.healDict[source.name].spellDict[spell] || { total: 0, real: 0, over: 0 };
                        this.healDict[source.name].spellDict[spell].total += realHeal + overHeal;
                        this.healDict[source.name].spellDict[spell].real += realHeal;
                        this.healDict[source.name].spellDict[spell].over += overHeal;
                    }
                }
            }
        }
    }

    getDamageList(): BattleData.MonitorOutput
    {
        var dmgList = [];
        for (let player in this.damageDict)
        {
            dmgList.push({
                number: this.damageDict[player].total,
                length: this.damageDict[player].total,
                slices: [
                    this.damageDict[player].normal,
                    this.damageDict[player].crit],
                colors: [
                    0xffc477,
                    0xff7777],
                player: this.damageDict[player].player
            });
        }

        dmgList.sort((a, b) => { return b.number - a.number; });
        return <BattleData.MonitorOutput>dmgList;
    }

    getDPSList(): BattleData.MonitorOutput
    {
        var dmgList = this.getDamageList();
        for (let element in dmgList)
        {
            dmgList[element].number = Math.round(dmgList[element].number / this.time);
        }

        return dmgList;
    }

    getHealList(): BattleData.MonitorOutput
    {
        var healList = [];
        for (let player in this.healDict)
        {
            healList.push({
                number: this.healDict[player].real,
                length: this.healDict[player].total,
                slices: [
                    this.healDict[player].real,
                    this.healDict[player].over],
                colors: [
                    0x00ff00,
                    0xff0000],
                player: this.healDict[player].player
            });
        }

        healList.sort((a, b) => { return b.number - a.number });
        return <BattleData.MonitorOutput>healList;
    }

    getHPSList(): BattleData.MonitorOutput
    {
        var healList = this.getHealList();
        for (let element in healList)
        {
            healList[element].number = Math.round(healList[element].number / this.time);
        }

        return healList;
    }
}