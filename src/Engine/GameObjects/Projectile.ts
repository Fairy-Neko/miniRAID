/** @packageDocumentation @module GameObjects */

import { Spell } from "./Spell";
import { mRTypes } from "../Core/mRTypes";
import { Mob } from "./Mob";

export class Projectile extends Spell
{
    chasingRange: number;
    chasingPower: number;
    speed: number;

    moveDirc: Phaser.Math.Vector2;

    constructor(
        x: number, y: number,
        sprite: string,
        settings: mRTypes.Settings.Projectile,
        useCollider: boolean = true,
        subsprite?: string,
        frame?: string | number)
    {
        super(x, y, sprite, settings, useCollider, subsprite, frame);

        this.chasingRange = settings.chasingRange || 0;
        this.chasingPower = settings.chasingPower || 0;
        this.speed = settings.speed || 200;

        if (this.target instanceof Phaser.Math.Vector2)
        {
            this.moveDirc = this.target.clone().subtract(this.getPosition()).normalize();
            this.target = undefined;
        }
        else
        {
            this.moveDirc = this.target.footPos().clone().subtract(this.getPosition()).normalize();
        }
    }

    updateSpell(dt: number)
    {
        // Homing
        if (this.target instanceof Mob && (this.chasingRange < 0 || this.target.footPos().clone().subtract(this.getPosition()).length() < this.chasingRange))
        {
            let newDirc = this.target.footPos().clone().subtract(this.getPosition()).normalize();
            this.moveDirc = this.moveDirc.clone().scale(1 - dt * this.chasingPower).add(newDirc.clone().scale(dt * this.chasingPower));
        }

        this.setVelocity(this.moveDirc.x * this.speed, this.moveDirc.y * this.speed);

        super.updateSpell(dt);
    }
}
