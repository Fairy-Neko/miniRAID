/** @packageDocumentation @module Agent */

import { MobAgent } from "../Engine/Agents/MobAgent";
import { Mob } from "../Engine/GameObjects/Mob";
import { GameData } from "../Engine/Core/GameData";
import { UnitManager } from "../Engine/Core/UnitManager";

export class KeepMoving extends MobAgent
{
    center: Phaser.Math.Vector2;
    range: number;
    dirc: Phaser.Math.Vector2;

    constructor(parentMob: Mob, range: number = 150, dirc: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 1))
    {
        super(parentMob);
        this.center = parentMob.getPosition();
        this.range = range;
        this.dirc = dirc.normalize();
    }

    updateMob(mob: Mob, dt: number)
    {
        if (mob.getPosition().add(this.dirc.clone().scale(20.0)).distance(this.center) > this.range)
        {
            this.dirc = this.dirc.negate();
        }

        mob.setVelocity(this.dirc.x * 100.0, this.dirc.y * 100.0);
    }
}