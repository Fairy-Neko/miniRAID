import { Scene } from "Phaser";

export class PopupText extends Phaser.GameObjects.Text
{
    time: number;
    velX: number;
    velY: number;
    accX: number;
    accY: number;

    dead: boolean;

    constructor(
        scene:Phaser.Scene, x:number, y:number, text:string,
        style:Phaser.Types.GameObjects.Text.TextSyle,
        time:number = 1.0,
        velX:number = -64,velY:number = -256,
        accX:number = 0.0, accY:number = 512.0)
    {
        super(scene, x, y, text, style);

        this.time = time;
        this.velX = velX;
        this.velY = velY;
        this.accX = accX;
        this.accY = accY;

        this.dead = false;
    }

    update(dt:number)
    {
        // perhaps we don't need this?
        super.update();

        this.time -= dt;
        
        if(this.time < 0)
        {
            this.dead = true;
            return;
        }

        this.x    += this.velX * dt;
        this.y    += this.velY * dt;
        this.velX += this.accX * dt;
        this.velY += this.accY * dt;

        this.alpha = this.time;
    }
}

export class PopUpManager extends Scene
{
    textList: Set<PopupText>;
    static instance: PopUpManager;

    static getSingleton(): PopUpManager
    {
        if(!PopUpManager.instance)
        {
            PopUpManager.instance = new PopUpManager({key: 'PopupManagerScene'});
            console.log("registering dynamic loader...");
        }
        return PopUpManager.instance;
    }

    create()
    {
        this.textList = new Set<PopupText>();
    }

    addText(
        text:string, 
        posX:number = 100,
        posY:number = 100,
        color:Phaser.Display.Color = new Phaser.Display.Color(255, 255, 255, 255),
        time:number = 1.0, 
        velX:number = -64, 
        velY:number = -256, // jumping speed
        accX:number = 0.0,   // gravity
        accY:number = 512,// gravity
    )
    {
        let txt = new PopupText(this, posX, posY, text, {'color': color.rgba, 'fontSize': '12px'}, time, velX, velY, accX, accY);
        this.add.existing(txt);
    }

    update(time:number, dt:number)
    {
        this.children.each(
            (item: Phaser.GameObjects.GameObject) => 
            {
                item.update(dt / 1000.0);
                if(item instanceof PopupText)
                {
                    if(item.dead)
                    {
                        item.destroy();
                    }
                }
            }
        );
        // for(let txt of this.textList)
        // {
        //     txt.update(dt);
        //     if(txt.dead)
        //     {
        //         this.textList.delete(txt);
        //     }
        // }
    }
}
