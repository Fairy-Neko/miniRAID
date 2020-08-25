/**
 * @packageDocumentation
 * @module UI
 */

import { ProgressBar, TextAlignment } from "./ProgressBar";
import { UnitManager } from "../Core/UnitManager";
import { Mob } from "../GameObjects/Mob";
import { dSprite } from "../DynamicLoader/dSprite";
import { Weapon } from "../Core/EquipmentCore";
import { mRTypes } from "../Core/mRTypes";
import { _ } from "./Localization";
import { ScrollMaskedContainer, ScrollDirc } from "./ScrollMaskedContainer";
import { MobData } from "../Core/MobData";
import { Buff } from "../Core/Buff";

export class WeaponFrame extends Phaser.GameObjects.Container
{
    targetWeapon: Weapon;
    wpIcon: dSprite;
    hitBox: Phaser.Geom.Rectangle;

    constructor(scene: Phaser.Scene, x: number, y: number, target: Weapon)
    {
        super(scene, x, y);
        this.targetWeapon = target;

        this.wpIcon = new dSprite(this.scene, 0, 4, 'img_weapon_icon_test');
        this.wpIcon.setOrigin(0);
        this.wpIcon.setTint((this.targetWeapon && this.targetWeapon.activated) ? 0xffffff : 0x888888);
        this.add(this.wpIcon);

        this.add(new ProgressBar(this.scene, 0, 0,
            () =>
            {
                if (this.targetWeapon)
                {
                    return [this.targetWeapon.weaponGauge, this.targetWeapon.weaponGaugeMax];
                }
                else
                {
                    return [0, 0];
                }
            }, 24, 2, 0, true, 0x000000, 0x333333, 0x659ad2, true, 'smallPx', TextAlignment.Center, 12, -10, 0x659ad2,
            () => 
            {
                if (this.targetWeapon && this.targetWeapon.weaponGauge >= this.targetWeapon.weaponGaugeMax)
                {
                    return "MAX";
                }
                else if (this.targetWeapon && this.targetWeapon.weaponGauge < 0)
                {
                    return "<0?!";
                }
                else
                {
                    return "";
                }
            }));
    }

    setWeapon(target: Weapon)
    {
        this.targetWeapon = target;
        this.wpIcon.setTexture('img_weapon_icon_test');
        this.wpIcon.setTint((this.targetWeapon && this.targetWeapon.activated) ? 0xffffff : 0x888888);
    }

    update(time: number, dt: number)
    {
        this.each((obj: Phaser.GameObjects.GameObject) => { obj.update(); });
    }
}

export class BuffIcon extends Phaser.GameObjects.Container
{
    timeRemain: Phaser.GameObjects.Rectangle;
    stacks: Phaser.GameObjects.BitmapText;
    buff: Buff;
    len: number;
    isOver: boolean;

    constructor(scene: Phaser.Scene, x: number, y: number, buff: Buff, subsTexture?: string, frame?: string | integer)
    {
        super(scene, x, y);

        this.buff = buff;
        this.isOver = false;

        this.len = buff.UIimportant ? 26 : 18;

        let rect = new Phaser.GameObjects.Rectangle(this.scene, 0, 0, buff.UIimportant ? 26 : 18, buff.UIimportant ? 26 : 18, buff.color.clone().darken(20).color);
        rect.setOrigin(0, 0);
        this.add(rect);

        if (scene === undefined)
        {
            console.warn("?!");
        }

        let dspr = new dSprite(scene, 1, 1, buff.UIimportant ? 'img_imp_buff_icon_test' : 'img_buff_icon_test', subsTexture, frame);
        dspr.setOrigin(0);
        this.add(dspr);

        if (buff.countTime)
        {
            this.timeRemain = new Phaser.GameObjects.Rectangle(this.scene, this.len, 0, this.len, this.len, 0x000000, 0.5);
            this.timeRemain.setOrigin(1, 0);
            this.add(this.timeRemain);
        }

        if (buff.stackable)
        {
            this.stacks = new Phaser.GameObjects.BitmapText(this.scene, this.len - 1, this.len - 1, 'smallPx_HUD', '1');
            this.stacks.setOrigin(1);
            this.stacks.setTint(0xffffff);
            this.stacks.depth = 10;
            this.add(this.stacks);
        }
    }

    update()
    {
        if (this.buff.countTime)
        {
            this.timeRemain.width = ((this.buff.timeMax - this.buff.timeRemain[0]) / this.buff.timeMax) * (this.len);
            this.timeRemain.x = this.len;
            this.timeRemain.setOrigin(1, 0);
        }

        if (this.buff.stackable)
        {
            this.stacks.text = this.buff.stacks.toString();
        }
    }
}

// export class BuffFrame extends ScrollMaskedContainer
export class BuffFrame extends Phaser.GameObjects.Container
{
    target: MobData;
    icons: BuffIcon[];
    more: dSprite;

    constructor(scene: Phaser.Scene, x: number, y: number, globalX: number, globalY: number, width: number, height: number, target: MobData)
    {
        // super(scene, x, y, width, height, ScrollDirc.Horizontal, globalX, globalY);
        super(scene, x, y);
        this.target = target;

        this.icons = [];
        let len = 0;

        this.more = new dSprite(this.scene, 200, 1, 'img_more_buff');
        this.more.alpha = 0.0;
        this.more.setOrigin(0, 0)
        this.add(this.more);

        let buffList = this.obtainList();
        let bLen = buffList.length;
        buffList = buffList.slice(0, 6);

        for (let buff of buffList)
        {
            let bI = new BuffIcon(this.scene, len, 0, buff);
            len += bI.len + 2;
            this.icons.push(bI);
            this.add(bI);
        }

        if (bLen > 6) { this.hasMore(len); }
        else { this.noMore(); }
        // this.updateContentLength();
    }

    compare(a: Buff, b: Buff): number
    {
        if (a.UIimportant && (!b.UIimportant)) { return -1; }
        else if ((!a.UIimportant) && b.UIimportant) { return 1; }
        else
        {
            return b.UIpriority - a.UIpriority;
        }
    }

    compareIcon(a: BuffIcon, b: BuffIcon): number
    {
        return this.compare(a.buff, b.buff);
    }

    obtainList(): Buff[]
    {
        return this.target.buffList.slice().sort(this.compare);
    }

    // update(time: number, dt: number)
    // {
    //     if (this.target._buffListDirty)
    //     {
    //         this.removeAll(true);
    //         let len = 0;
    //         let buffList = this.obtainList();
    //         for (let buff of buffList)
    //         {
    //             let bI = new BuffIcon(this.scene, len, 0, buff);
    //             len += bI.len + 2;
    //             this.add(bI);
    //         }
    //         this.target._buffListDirty = false;
    //     }
    //     this.each((obj: Phaser.GameObjects.GameObject) => { obj.update(); });
    // }

    hasMore(len: number)
    {
        this.scene.tweens.add({
            targets: this.more,
            x: len,
            alpha: 1,
            duration: 100,
        });
    }

    noMore()
    {
        this.scene.tweens.add({
            targets: this.more,
            alpha: 0,
            duration: 100,
        });
    }

    update(time: number, dt: number)
    {
        if (this.target._buffListDirty)
        {
            let newList = this.obtainList();
            let bLen = newList.length;
            newList = newList.slice(0, 6);

            let newIcons = [];
            let iOld = 0;
            let iNew = 0;

            while (iNew < newList.length || iOld < this.icons.length)
            {
                if ((iNew < newList.length && iOld < this.icons.length) && newList[iNew].toString() === this.icons[iOld].buff.toString())
                {
                    iNew++;
                    iOld++;
                }
                else if (iNew < newList.length)
                {
                    let iiOld = iOld + 1;
                    let flag = false;
                    while (iiOld < this.icons.length && this.compare(this.icons[iiOld].buff, newList[iNew]) <= 0)
                    {
                        // We found the same buff
                        if (this.icons[iiOld].buff.toString() == newList[iNew].toString())
                        {
                            // We need to delete everything between iOld & iiOld
                            flag = true;
                            break;
                        }
                        iiOld++;
                    }

                    if (flag)
                    {
                        // remove iOld ~ iiOld from the container
                        for (let ix = iOld; ix < iiOld; ix++)
                        {
                            this.icons[ix].isOver = true;
                            this.remove(this.icons[ix], true);
                        }
                        iOld = iiOld;
                    }
                    else
                    {
                        // iNew is a new buff
                        // Add iNew to the container
                        let bI = new BuffIcon(this.scene, 160, 0, newList[iNew]);
                        bI.alpha = 0.0;
                        newIcons.push(bI);
                        this.add(bI);
                        iNew++;
                    }
                }
                else
                {
                    // Delete everything after iOld
                    for (let ix = iOld; ix < this.icons.length; ix++)
                    {
                        this.icons[ix].isOver = true;
                        this.remove(this.icons[ix], true);
                    }
                    iOld = this.icons.length;
                }
            }

            this.icons = this.icons.filter((value: BuffIcon) => !value.isOver);
            this.icons.push(...newIcons);

            // Calculate new positions
            this.icons = this.icons.sort((a: BuffIcon, b: BuffIcon) => this.compare(a.buff, b.buff));
            let len = 0;
            for (let icon of this.icons)
            {
                this.scene.tweens.add({
                    targets: icon,
                    x: len,
                    alpha: 1.0,
                    duration: 100,
                });
                len += icon.len + 2;
            }

            if (bLen > 6) { this.hasMore(len); }
            else { this.noMore(); }

            // this.updateContentLength();
        }

        this.each((obj: Phaser.GameObjects.GameObject) => { obj.update(); });
    }
}

export class UnitFrame extends Phaser.GameObjects.Container
{
    wpCurrent: WeaponFrame;
    wpAlter: WeaponFrame;
    castingBar: ProgressBar;
    targetMob: Mob;
    buffFrame: BuffFrame;

    constructor(scene: Phaser.Scene, x: number, y: number, target: Mob)
    {
        super(scene, x, y);
        this.targetMob = target;

        // this.add(new Phaser.GameObjects.BitmapText(this.scene, 0, 0, 'simsun_o', target.mobData.name + ": 魔法值"));
        // this.add(new Phaser.GameObjects.BitmapText(this.scene, 0, 3, 'smallPx', "Mana of testGirl0"));

        // Name
        let txt = new Phaser.GameObjects.BitmapText(this.scene, 0, 9, _('UIFont'), target.mobData.name);
        txt.setOrigin(0, 1);
        this.add(txt);

        // Avatar
        let avatar = new Phaser.GameObjects.Image(this.scene, 0, 3, 'elf', 0);
        avatar.setOrigin(1, 0);
        this.add(avatar);

        // Weapon, TODO: switch weapons on click
        this.wpCurrent = new WeaponFrame(this.scene, 75, 7, this.targetMob.mobData.currentWeapon);
        this.wpAlter = new WeaponFrame(this.scene, 105, 7, this.targetMob.mobData.anotherWeapon);

        this.wpCurrent.wpIcon.setInteractive();
        this.wpCurrent.wpIcon.on('pointerdown', () => { this.switchWeapon(); });

        this.wpAlter.wpIcon.setInteractive();
        this.wpAlter.wpIcon.on('pointerdown', () => { this.switchWeapon(); });

        this.add(this.wpCurrent);
        this.add(this.wpAlter);

        // Health
        this.add(new ProgressBar(this.scene, 0, 10, () =>
        {
            return [target.mobData.currentHealth, target.mobData.maxHealth];
        }, 70, 16, 1, true, 0x222222, 0x20604F, 0x1B813E, true, 'smallPx_HUD', TextAlignment.Left, 5, 6, 0xffffff));

        // Mana
        this.add(new ProgressBar(this.scene, 0, 25, () =>
        {
            return [target.mobData.currentMana, target.mobData.maxMana];
        }, 70, 11, 1, true, 0x222222, 0x20604F, 0x33A6B8, true, 'smallPx_HUD', TextAlignment.Left, 5, 2, 0xffffff));

        // // Buffs
        let bF = new BuffFrame(this.scene, -28, 37, x - 28, y + 37, 160, 30, this.targetMob.mobData);
        bF.depth = 0;
        this.add(bF);

        // Current Spell
        this.castingBar = new ProgressBar(this.scene, 10, 35, () =>
        {
            return [0.3, 1.8];
        }, 60, 4, 1, false, 0x222222, 0x20604F, 0xffe8af, true, _('UIFont'), TextAlignment.Right, 58, 7, 0xffffff, () => _("Wind Blade"));
        this.add(this.castingBar);
        this.castingBar.depth = 40;
    }

    switchWeapon()
    {
        // TODO: switch the weapon
        let res = this.targetMob.mobData.switchWeapon();
        if (res === false)
        {
            return;
        }

        this.wpCurrent.setWeapon(this.targetMob.mobData.anotherWeapon);
        this.wpAlter.setWeapon(this.targetMob.mobData.currentWeapon);

        this.scene.add.tween({
            targets: this.wpCurrent,
            x: { from: 105, to: 75 },
            duration: 200,
        });

        this.scene.add.tween({
            targets: this.wpAlter,
            x: { from: 75, to: 105 },
            duration: 200,
        });
    }

    update(time: number, dt: number)
    {
        if (this.targetMob.mobData.inCasting)
        {

        }
        else if (this.targetMob.mobData.inChanneling)
        {

        }
        else
        {
            this.castingBar.setVisible(false);
        }
        this.each((obj: Phaser.GameObjects.GameObject) => { obj.update(); });
    }
}
