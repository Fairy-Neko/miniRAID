/** @packageDocumentation @module GameObjects */

import { dPhysSprite } from "../DynamicLoader/dPhysSprite"
// import { Scene } from "phaser"
import { mRTypes } from "../Core/mRTypes";
import { Mob } from "./Mob";
import { BattleScene } from "../ScenePrototypes/BattleScene";
import { HealDmg } from "../Core/Helper";
import { GameData } from "../Core/GameData";

export enum SpellFlags
{
    isDamage,
    isHeal,
    hasTarget,
    areaEffect,
    overTime, // DOT / HOT
    targetingEverything,
}

export enum Targeting
{
    Player,
    Enemy,
    Both
}

/**
 * Spell class, which is different from core/SpellData.
 * Spells are renderable, moveable entities that directly appears in the game screen, 
 * and is responsible for dealing damage / heals from its source to its target.
 * 
 * Spells must have a source, so it must be casted from a mob.
 * Spells will be automatically added into its source's scene.
 * 
 * use SpellFlags.targetingEverything to make the spell to hit with everything.
 */
export class Spell extends dPhysSprite
{
    name: string;

    source: Mob;
    target: Mob | Phaser.Math.Vector2;

    flags: Set<SpellFlags>;
    info: mRTypes.SpellInfo;

    useCollider: boolean;
    targeting: Targeting;
    destroying: boolean;

    lifeRemain: number;

    _onHit: (self: Spell, arg: Phaser.GameObjects.GameObject) => void;
    _onMobHit: (self: Spell, arg: Mob) => void;
    _onWorldHit: (self: Spell, arg: Phaser.GameObjects.GameObject) => void;
    _onDestroy: (self: Spell, arg: Phaser.GameObjects.GameObject) => void;
    _onUpdate: (self: Spell, dt: number) => void;

    constructor(
        x: number, y: number,
        sprite: string,
        settings: mRTypes.Settings.Spell,
        useCollider: boolean = true,
        maxLifeSpan: number = 30.0,
        subsprite?: string,
        frame?: string | number)
    {
        super(settings.source.scene, x, y, sprite, subsprite, frame);

        this.useCollider = useCollider;
        this.info = settings.info;
        this.flags = this.info.flags;
        this.name = this.info.name;

        this.lifeRemain = maxLifeSpan;
        this.destroying = false;

        this.source = settings.source;
        this.target = settings.target;
        if (this.target instanceof Mob)
        {
            this.targeting = this.target.mobData.isPlayer ? Targeting.Player : Targeting.Enemy;
        }

        this.targeting = this.flags.has(SpellFlags.targetingEverything) ? Targeting.Both : this.targeting;

        if (this.useCollider === false)
        {
            this.disableBody();
        }
        else
        {
            if (this.targeting == Targeting.Both)
            {
                (<BattleScene>this.scene).everyoneTargetingObjectGroup.add(this);
            }
            else if (this.targeting == Targeting.Player)
            {
                (<BattleScene>this.scene).playerTargetingObjectGroup.add(this);
            }
            else
            {
                (<BattleScene>this.scene).enemyTargetingObjectGroup.add(this);
            }
        }

        // Apply tint color
        this.setTint(Phaser.Display.Color.GetColor(settings.color.red, settings.color.green, settings.color.blue));

        // Register events
        this._onHit = settings.onHit;
        this._onMobHit = settings.onMobHit;
        this._onWorldHit = settings.onWorldHit;
        this._onDestroy = settings.onDestroy;
        this._onUpdate = settings.onUpdate;

        this.scene.add.existing(this);
    }

    checkInCamera(): boolean
    {
        // TODO
        return true;
    }

    update(dt: number)
    {
        // Life counter
        this.lifeRemain -= dt;
        if (this.lifeRemain < 0)
        {
            this.selfDestroy();
        }
        else
        {
            // Check is target alive
            // If target dead, set it to undefined
            if (this.target instanceof Mob && Mob.checkAlive(this.target) !== true)
            {
                this.target = undefined;
            }

            // Cannot see me so die
            if (this.checkInCamera() === false)
            {
                this.selfDestroy();
            }

            this.updateSpell(dt);
        }
    }

    dieAfter(foo: any, arg: any, other: Phaser.GameObjects.GameObject)
    {
        foo.apply(this, arg);
        this.selfDestroy(other);
    }

    selfDestroy(other: Phaser.GameObjects.GameObject = this)
    {
        if (!this.destroying)
        {
            if (this.body)
            {
                this.disableBody(true, true);
            }
            this.onDestroy(other);

            this.destroy();
        }
    }

    HealDmg(target: Mob, dmg: number, type: GameData.Elements): mRTypes.DamageHeal
    {
        return HealDmg({
            'source': this.source,
            'target': target,
            'value': dmg,
            'type': type,
            'popUp': true,
            'spell': this.info,
        });
    }

    updateSpell(dt: number) { if (this._onUpdate) { this._onUpdate(this, dt); } }

    onHit(obj: Phaser.GameObjects.GameObject) { if (this._onHit) { this._onHit(this, obj); } }
    onMobHit(mob: Mob) { if (this._onMobHit) { this._onMobHit(this, mob); } }
    onWorldHit(obj: Phaser.GameObjects.GameObject) { if (this._onWorldHit) { this._onWorldHit(this, obj); } }

    onDestroy(obj: Phaser.GameObjects.GameObject = this) { if (this._onDestroy) { this._onDestroy(this, obj); } }
}

/**
 * Dummy spell instance which is not represented as a Projectile (e.g. sword slash, melee attacks etc.)
 */
export class DummySpell extends Spell
{
    triggerTime: number;
    _onSpell: (self: DummySpell, source: Mob, target: Mob) => void;
    _onSpellVec2: (self: DummySpell, source: Mob, target: Phaser.Math.Vector2) => void;
    spellDone: boolean;

    constructor(
        x: number, y: number,
        sprite: string,
        settings: mRTypes.Settings.DummySpell,
        subsprite?: string,
        frame?: string | number)
    {
        settings.info.name = settings.info.name || "DummySpell";
        super(x, y, sprite, settings, false, 60.0, subsprite, frame);

        this.triggerTime = -1 || settings.triggerTime;
        this._onSpell = settings.onSpell;
        this._onSpellVec2 = settings.onSpellVec2;

        this.spellDone = false;
        if (this.triggerTime < 0)
        {
            this.onSpell(this.source, this.target);
        }
    }

    updateSpell(dt: number)
    {
        this.triggerTime -= dt;
        if (this.spellDone == false && this.triggerTime < 0)
        {
            this.onSpell(this.source, this.target);
        }

        super.updateSpell(dt);
    }

    onSpell(source: Mob, target: Mob | Phaser.Math.Vector2)
    {
        this.spellDone = true;
        if (this._onSpell && target instanceof Mob)
        {
            this._onSpell(this, source, target);
        }
        else if (this._onSpellVec2 && target instanceof Phaser.Math.Vector2)
        {
            this._onSpellVec2(this, source, target);
        }
    }
}
