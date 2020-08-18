/**
 * @module Events
 */

import * as Collections from 'typescript-collections'

type EventCallback = (...args: any[]) => any;
type ListenRecord = { src: IEventEmitter, evt: String };

export interface IEventEmitter
{
    parentSystem: EventSystem;
    emit(evt: String, resCallback: (res: any) => void, ...args: any[]): number;
    emitArray(evt: String, resCallback: (res: any) => void, args: any[]): number;
    discardEmitter(): void;
}

export interface IEventReceiver
{
    parentSystem: EventSystem;
    listenRecord: Collections.Set<ListenRecord>;
    listen(src: IEventEmitter, evt: String, callback: EventCallback): boolean;
    discardReceiver(): void;
}

export class EventElement implements IEventEmitter, IEventReceiver
{
    parentSystem: EventSystem;
    listenRecord: Collections.Set<ListenRecord> = new Collections.Set<ListenRecord>();

    constructor(parentSystem: EventSystem)
    {
        this.parentSystem = parentSystem;
    }

    public emit(evt: String, resCallback: (res: any) => void, ...args: any[]): number
    {
        return this.parentSystem.emit(this, resCallback, evt, args);
    }

    public emitArray(evt: String, resCallback: (res: any) => void, args: any[]): number
    {
        return this.parentSystem.emit(this, resCallback, evt, args);
    }

    public listen(src: IEventEmitter, evt: String, callback: EventCallback): boolean
    {
        var result: boolean = this.parentSystem.listen(src, this, callback, evt);
        this.listenRecord.add({ src: src, evt: evt });

        // result?

        return result;
    }

    public unlisten(src: IEventEmitter, evt: String): boolean
    {
        if (this.listenRecord.contains({ src: src, evt: evt }))
        {
            this.parentSystem.discardListener(src, this, evt);
            this.listenRecord.remove({ src: src, evt: evt });
            return true;
        }

        return false;
    }

    // So lazy to use another dict omg
    public unlistenAll(src: IEventEmitter): boolean
    {
        var result = false;

        // Will "this" be correct here? idk
        this.listenRecord.forEach((obj) => 
        {
            if (obj.src === src)
            {
                result = true;
                this.unlisten(obj.src, obj.evt);
            }
        });

        return result;
    }

    public discardEmitter()
    {
        this.parentSystem.discardEmitter(this);
    }

    public discardReceiver()
    {
        // Will "this" be correct here? idk
        this.listenRecord.forEach((element) =>
        {
            this.parentSystem.discardListener(element.src, this, element.evt);
        });
    }

    public discard()
    {
        this.discardEmitter();
        this.discardReceiver();
    }
}

export class EventSystem
{
    private dict: Collections.Dictionary<IEventEmitter, Collections.Dictionary<String, Collections.LinkedDictionary<IEventReceiver, EventCallback>>> = new Collections.Dictionary<IEventEmitter, Collections.Dictionary<String, Collections.LinkedDictionary<IEventReceiver, EventCallback>>>();

    constructor()
    {
        // nothing to do?
    }

    listen(src: IEventEmitter, dst: IEventReceiver, callback: EventCallback, evt: String): boolean
    {
        // Check if the source object is in our dict
        if (!this.dict.containsKey(src))
        {
            this.dict.setValue(src, new Collections.Dictionary<String, Collections.LinkedDictionary<IEventReceiver, EventCallback>>());
        }

        var srcDict = this.dict.getValue(src);

        // Check if the event type is in our dict
        if (!srcDict.containsKey(evt))
        {
            srcDict.setValue(evt, new Collections.LinkedDictionary<IEventReceiver, EventCallback>());
        }

        var evtList = srcDict.getValue(evt);

        // Check if the destnation is already be in the listener list
        var overlay = true;
        if (!evtList.containsKey(dst))
        {
            overlay = false;
        }

        // Use new value anyway
        evtList.setValue(dst, callback);

        return overlay;
    }

    emit(src: IEventEmitter, resCallback: (res: any) => void, evt: String, args: any[]): number
    {
        var totalCnt: number = 0;
        if (this.dict.containsKey(src))
        {
            var srcDict = this.dict.getValue(src);
            if (srcDict.containsKey(evt))
            {
                var evtList = srcDict.getValue(evt);

                // Pack argument array
                var lst: any[] = [src];
                lst.push.apply(lst, args);

                // Call the event callback function for each destination
                evtList.forEach((dst, callback) => 
                {
                    let result = callback.apply(dst, args);
                    if (resCallback)
                    {
                        resCallback(result);
                    }

                    totalCnt += 1;
                });
            }
        }

        return totalCnt;
    }

    discardEmitter(src: IEventEmitter)
    {
        if (this.dict.containsKey(src))
        {
            this.dict.remove(src);
        }
    }

    discardListener(src: IEventEmitter, dst: IEventReceiver, evt: String, clean: boolean = false)
    {
        if (this.dict.containsKey(src))
        {
            var srcDict = this.dict.getValue(src);
            if (srcDict.containsKey(evt))
            {
                var evtList = srcDict.getValue(evt);
                if (evtList.containsKey(dst))
                {
                    evtList.remove(dst);
                }

                if (clean === true && evtList.isEmpty())
                {
                    srcDict.remove(evt);
                }
            }
            if (clean === true && srcDict.isEmpty())
            {
                this.dict.remove(src);
            }
        }
    }
}

/* Example usage
                                        // Create //
let tween = this.tweens.add({
                targets: this.logo,
                scaleX: { value: 1.0, duration: 2000, ease: 'Back.easeInOut' },
                scaleY: { value: 1.0, duration: 2000, ease: 'Back.easeInOut' },
                yoyo: true,
                repeat: -1
                });

for (var i:number = 0; i < 4000; i++)
{
    var tmpText = this.add.text(16 + (i % 40) * 20, 16 + Math.floor(i / 40) * 20, '哇哦', {fontSize: '9px'});
}

console.log('Building event system...')
// Init event system
// 50x {1 Main -> 9 Sub}
// this.num = 5000; // <-- This still runs at 60 FPS! with the update operation 7.88ms. Although the starting process is quite long (around 2min). This system is strong!
this.num = 500;
for(var i = 0; i < this.num * 10; i++)
{
    this.objs.push(new Events.EventElement(this.eventSystem));
}

// Create relationships
for(var i = 0; i < this.num * 10; i++)
{
    if(i % 10 >= 0)
    {
        this.objs[i].listen(this.objs[Math.floor(i / 10) * 10], 'update', (mob, dt) => {return 0;});
        this.objs[i].listen(this.objs[Math.floor(i / 10) * 10], 'onDamageReceived', (mob, src, dmg, hit, crit) => {console.log(dmg);});
        this.objs[i].listen(this.objs[Math.floor(i / 10) * 10], 'onDead', (mob, lastHit) => {return 0;});
        for(var j = 0; j < this.num; j++)
        {
            if(Math.random() < 0.5)
            {
                this.objs[i].listen(this.objs[j * 10], 'onDamageReceived', (mob, src, dmg, hit, crit) => {console.log(dmg);})
            }
        }
    }

    if(i % 1000 == 0)
    {
        console.log(i / 10);
    }
}

                                        Update //
this.cnt ++;
if(this.cnt > 20)
{
    console.log(1000.0 / dt);
    this.cnt = 0;
}
this.logo_scale = time / 10000.0;
this.logo.setScale(this.logo_scale, this.logo_scale);

this.ground_rt.scale -= 0.01;
this.ground_rt.draw(this.mesh0);

for(var i = 0; i < this.num; i++)
{
    this.objs[i * 10].emit('update', this.objs[i * 10], dt);
    if(Math.random() < 0.6)
    {
        var src = Math.floor(Math.random() * this.num);
        var dmg = Math.random() * 100.0;
        this.objs[i * 10].emit('onDamageReceived', this.objs[i * 10], src, dmg, true, false);
    }
}
*/