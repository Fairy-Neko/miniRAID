import * as Collections from 'typescript-collections'

type EventCallback = (...args: any[]) => void;
type ListenRecord  = {src: IEventEmitter, evt: String};

export interface IEventEmitter
{
    parentSystem: EventSystem;
    emit(evt: String, ...args: any[]): number;
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

    public emit(evt: String, ...args: any[]): number
    {
        return this.parentSystem.emit(this, evt, args);
    }

    public listen(src: IEventEmitter, evt: String, callback: EventCallback): boolean
    {
        var result: boolean = this.parentSystem.listen(src, this, callback, evt);
        this.listenRecord.add({src: src, evt: evt});
 
        // result?
        
        return result;
    }

    public unlisten(src: IEventEmitter, evt: String): boolean
    {
        if(this.listenRecord.contains({src: src, evt: evt}))
        {
            this.parentSystem.discardListener(src, this, evt);
            this.listenRecord.remove({src: src, evt: evt});
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
            if(obj.src === src)
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
        this.listenRecord.forEach((element) => {
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
        if(!this.dict.containsKey(src))
        {
            this.dict.setValue(src, new Collections.Dictionary<String, Collections.LinkedDictionary<IEventReceiver, EventCallback>>());
        }

        var srcDict = this.dict.getValue(src);

        // Check if the event type is in our dict
        if(!srcDict.containsKey(evt))
        {
            srcDict.setValue(evt, new Collections.LinkedDictionary<IEventReceiver, EventCallback>());
        }

        var evtList = srcDict.getValue(evt);

        // Check if the destnation is already be in the listener list
        var overlay = true;
        if(!evtList.containsKey(dst))
        {
            overlay = false;
        }
        
        // Use new value anyway
        evtList.setValue(dst, callback);
        
        return overlay;
    }

    emit(src: IEventEmitter, evt: String, args: any[]): number
    {
        var totalCnt: number = 0;
        if(this.dict.containsKey(src))
        {
            var srcDict = this.dict.getValue(src);
            if(srcDict.containsKey(evt))
            {
                var evtList = srcDict.getValue(evt);
                
                // Pack argument array
                var lst: any[] = [src];
                lst.push.apply(lst, args);

                // Call the event callback function for each destination
                evtList.forEach((dst, callback) => 
                {
                    callback.apply(dst, args);
                    totalCnt += 1;
                });
            }
        }

        return totalCnt;
    }

    discardEmitter(src: IEventEmitter)
    {
        if(this.dict.containsKey(src))
        {
            this.dict.remove(src);
        }
    }

    discardListener(src: IEventEmitter, dst: IEventReceiver, evt: String, clean: boolean = false)
    {
        if(this.dict.containsKey(src))
        {
            var srcDict = this.dict.getValue(src);
            if(srcDict.containsKey(evt))
            {
                var evtList = srcDict.getValue(evt);
                if(evtList.containsKey(dst))
                {
                    evtList.remove(dst);
                }

                if(clean === true && evtList.isEmpty())
                {
                    srcDict.remove(evt);
                }
            }
            if(clean === true && srcDict.isEmpty())
            {
                this.dict.remove(src);
            }
        }
    }
}
