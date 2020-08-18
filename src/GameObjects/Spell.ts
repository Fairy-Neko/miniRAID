/** @module GameObjects */

import { dPhysSprite } from "../DynamicLoader/Modules"
import { Scene } from "Phaser"
import { mRTypes } from "../core/mRTypes";
import { Mob } from "../Mob";
import { BattleScene } from "../scenes/BattleScene";
import { HealDmg } from "../core/Helper";

export enum SpellFlags
{
    isDamage,
    isHeal,
    hasTarget,
    areaEffect,
    overTime, // DOT / HOT
    targetingEverything,
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
    isTargetPlayer: boolean;
    isTargetEverything: boolean;

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
        subsprite?: string,
        frame?: string | number)
    {
        super(settings.source.scene, x, y, sprite, subsprite, frame);

        this.useCollider = useCollider;
        this.info = settings.info;
        this.flags = this.info.flags;
        this.name = this.info.name;

        this.source = settings.source;
        this.target = settings.target;
        if (this.target instanceof Mob)
        {
            this.isTargetPlayer = this.target.mobData.isPlayer;
        }

        this.isTargetEverything = this.flags.has(SpellFlags.targetingEverything);

        if (this.useCollider === false)
        {
            this.disableBody();
        }
        else
        {
            if (this.isTargetEverything)
            {
                (<BattleScene>this.scene).everyoneTargetingObjectGroup.add(this);
            }
            else if (this.isTargetPlayer)
            {
                (<BattleScene>this.scene).playerTargetingObjectGroup.add(this);
            }
            else
            {
                (<BattleScene>this.scene).enemyTargetingObjectGroup.add(this);
            }
        }

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

    dieAfter(foo: any, arg: any, other: Phaser.GameObjects.GameObject)
    {
        foo.apply(this, arg);
        this.selfDestroy(other);
    }

    selfDestroy(other: Phaser.GameObjects.GameObject = this)
    {
        this.disableBody(true, true);
        this.onDestroy(other);

        this.destroy();
    }

    HealDmg(target: Mob, dmg: number, type: string)
    {
        HealDmg({
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
