/**
 * @packageDocumentation
 * @module UI
 */

import { BattleMonitor, BattleData } from "../Core/BattleMonitor";
import { ProgressBar } from "./ProgressBar";
import { _ } from "./Localization";
import { Game } from "phaser";
import { GameData } from "../Core/GameData";
import { ScrollMaskedContainer } from "./ScrollMaskedContainer";
import { UIScene } from "./UIScene";
import { mRTypes } from "../Core/mRTypes";

export class MonitorRow extends Phaser.GameObjects.Container
{
    rowData: BattleData.MonitorOutputRow;
    slOne: Phaser.GameObjects.Rectangle; // First slice
    slTwo: Phaser.GameObjects.Rectangle; // Second slice
    bg: Phaser.GameObjects.Rectangle; // Background
    refWidth: number;
    playerName: Phaser.GameObjects.BitmapText;
    valueText: Phaser.GameObjects.BitmapText;

    consTotal: boolean = true;
    consSecond: boolean = false;

    constructor(scene: Phaser.Scene, x: number, y: number, refWidth: number = 100, bgColor: number = 0xff0000, height: number = 18, textGap: number = 1)
    {
        super(scene, x, y);

        this.refWidth = refWidth;

        this.bg = new Phaser.GameObjects.Rectangle(this.scene, 0, 0, 2 + this.refWidth, height, bgColor, 0.2);
        this.bg.setOrigin(0);
        this.bg.on('pointerover', () => { this.bg.fillAlpha = 0.6; UIScene.getSingleton().showToolTip(this.getToolTip()); });
        this.bg.on('pointerout', () => { this.bg.fillAlpha = 0.2; UIScene.getSingleton().hideToolTip(); });
        this.bg.on('pointerdown', () => { if (this.rowData) { console.log(this.rowData.player); } });
        this.bg.on('wheel', (evt: Phaser.Input.Pointer) => { (<ScrollMaskedContainer>this.parentContainer).onWheel(evt); });
        this.add(this.bg);

        this.slTwo = new Phaser.GameObjects.Rectangle(this.scene, 1, height - 2, this.refWidth, 1, 0xffffff);
        this.slTwo.setOrigin(0);
        this.add(this.slTwo);

        this.slOne = new Phaser.GameObjects.Rectangle(this.scene, 1, height - 2, this.refWidth, 1, 0xffffff);
        this.slOne.setOrigin(0);
        this.add(this.slOne);

        this.playerName = new Phaser.GameObjects.BitmapText(this.scene, 2, height - 2 - textGap, _("UIFont"), "Player");
        this.playerName.setAlpha(0.5);
        this.playerName.setOrigin(0, 1);
        this.valueText = new Phaser.GameObjects.BitmapText(this.scene, this.refWidth + 2, height - 2 - textGap, "smallPx_HUD", "255,630");
        this.valueText.setOrigin(1, 1);

        this.add(this.playerName);
        this.add(this.valueText);

        this.setRow(undefined, 0, 0);
    }

    getToolTip(): mRTypes.HTMLToolTip
    {
        let text = "<div>";
        let playerData = BattleMonitor.getSingleton().damageDict[this.rowData.player.name];
        if (playerData)
        {
            let bySpell = playerData.spellDict;
            let allSpell = [];
            for (let spell in bySpell)
            {
                allSpell.push({ spell: spell, val: bySpell[spell].total });
            }
            allSpell.sort((a, b) =>
            {
                return b.val - a.val;
            });

            for (let spV of allSpell)
            {
                let spell = spV.spell;
                text +=
                    `<p>
                    <span style="max-width: 120px;">${_(spell)}</span><span style="font-size: 8pt">${this.formatNumber(bySpell[spell].total, this.consTotal)}, ${(bySpell[spell].total / this.rowData.number * 100).toFixed(2)}%</span>
                </p>`;
            }
        }

        text +=
            `<p style = "margin-top: 10px; color: #ffc477">
                <span>${_("totalDmg") + _("col_normalDmg")}</span>
                <span style="font-size: 8pt">${this.formatNumber(this.rowData.slices[0], this.consTotal)}, ${(this.rowData.slices[0] / this.rowData.number * 100).toFixed(2)}%</span>
            </p>
            <p style = "color: #ff7777">
                <span>${_("totalDmg") + _("col_critDmg")}</span>
                <span style="font-size: 8pt">${this.formatNumber(this.rowData.slices[1], this.consTotal)}, ${(this.rowData.slices[1] / this.rowData.number * 100).toFixed(2)}%</span>
            </p>
            <p style = "color: coral">
                <span>${_("totalDmg")}</span>
                <span style="font-size: 8pt">${this.formatNumber(this.rowData.number, false)}</span>
            </p>`

        text += "</div>";

        return {
            title: this.rowData.player.name,
            text: text,
            color: "#ffffff",
        }
    }

    formatNumber(num: number, cons: boolean): string
    {
        let postfix = "";
        if (cons)
        {
            if (num > 1000) { num = num / 1000; postfix = "K"; }
            if (num > 1000) { num = num / 1000; postfix = "M"; }
        }

        if (postfix !== "")
        {
            return num.toFixed(1).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') + postfix;
        }
        return num.toFixed(0).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') + postfix;
    }

    setRow(rowData: BattleData.MonitorOutputRow, maxLen: number, time: number)
    {
        this.rowData = rowData;
        if (rowData == undefined)
        {
            this.setVisible(false);
            this.bg.disableInteractive();
        }
        else
        {
            this.setVisible(true);
            this.bg.setInteractive();

            this.slOne.width = (rowData.slices[0] / maxLen * this.refWidth);
            this.slTwo.width = (rowData.length / maxLen * this.refWidth);

            this.slOne.fillColor = rowData.colors[0];
            this.slTwo.fillColor = rowData.colors[1];

            this.playerName.text = rowData.player.name;
            this.valueText.text = this.formatNumber(rowData.number, this.consTotal) + ` (${this.formatNumber(rowData.number / Math.max(0.01, time), this.consSecond)})`;
        }
    }
}

export class MonitorFrame extends ScrollMaskedContainer
{
    rows: MonitorRow[];
    fetchFunc: () => BattleData.MonitorOutput;

    constructor(scene: Phaser.Scene, x: number, y: number, fetchFunc: () => BattleData.MonitorOutput, width: number = 125, height: number = 120)
    {
        super(scene, x, y, width, height);

        this.rows = [];
        let gap = _('UIFont') === 'simsun' ? 18 : 14;
        let tGap = gap === 18 ? 3 : 0;

        for (let i = 0; i < GameData.playerMax; i++)
        {
            let mr = new MonitorRow(this.scene, 0, i * gap, width - 2, i % 2 == 0 ? 0x92d7e7 : 0x92d7e7, gap, tGap);
            this.rows.push(mr);
            this.add(mr);
        }

        this.fetchFunc = fetchFunc;
        this.updateContentLength();
    }

    update(time: number, dt: number)
    {
        let result = this.fetchFunc();
        let maxLen = 0;

        for (let i = 0; i < result.length; i++)
        {
            if (result[i].length > maxLen)
            {
                maxLen = result[i].length;
            }
        }

        for (let i = 0; i < this.rows.length; i++)
        {
            if (i < result.length)
            {
                this.rows[i].setRow(result[i], maxLen, BattleMonitor.getSingleton().time);
            }
        }

        this.each((obj: Phaser.GameObjects.GameObject) => { obj.update(); });
    }
}
