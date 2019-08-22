import { mRTypes } from "./mRTypes";
import { Mob } from "../Mob";

/**
 * Data backend for spells.
 * This is different from Spell outside databackend, this is only for spells could cast by mob (& player).
 * And this is the data "backend" for spells, they don't have any renderable and physics body.
 * When used, they create a Spell in the game world, and reset cooldown time etc.
 */
export class SpellData
{
    name: string;

    coolDown: number;
    manaCost: number;
    
    coolDownRemain: number;
    globalCoolDown: number;

    priority: number;
    available: boolean;

    isChannel: boolean;
    isCast: boolean;
    castTime: number;
    channelTime: number;

    constructor(settings:mRTypes.Settings.SpellData)
    {
        // CD (sec)
        this.coolDown = settings.coolDown || 10.0;
        this.manaCost = settings.manaCost || 0;
        this.name = settings.name || "Spell";

        // Available when init
        this.coolDownRemain = 0;
        this.globalCoolDown = 0;

        // priority should be calculated on the fly
        this.priority = 0;
        this.available = true;

        this.isChannel = false;
        this.isCast = false;
        this.castTime = 0;
        this.channelTime = 0;
    }

    update(mob:Mob, dt:number)
    {
        if(this.coolDownRemain >= 0)
        {
            this.coolDownRemain -= dt * 0.001;
        }

        this.available = this.isAvailable(mob);
        this.onUpdate(mob, dt);
    }

    onUpdate(mob:Mob, dt:number) {}

    onCast(mob:Mob, target:Mob|Phaser.Math.Vector2) {}

    onChanneling(mob:Mob, target:Mob|Phaser.Math.Vector2, dt:number) {}

    preCast(mob:Mob, target:Mob|Phaser.Math.Vector2)
    {
        if(this.available && mob.mobData.canCastSpell() && mob.mobData.hasMana(this.getManaCost(mob)))
        {
            return true;
        }

        return false;
    }

    cast(mob:Mob, target:Mob|Phaser.Math.Vector2)
    {
        if(this.available && mob.mobData.useMana(this.getManaCost(mob)))
        {
            this.coolDownRemain = this.coolDown;
            this.onCast(mob, target);
        }
    }

    forceCast(mob:Mob, target:Mob|Phaser.Math.Vector2)
    {
        this.onCast(mob, target);
    }

    isAvailable(mob:Mob)
    {
        return (this.coolDownRemain <= 0);
    }

    getManaCost(mob:Mob)
    {
        return this.manaCost;
    }
}
