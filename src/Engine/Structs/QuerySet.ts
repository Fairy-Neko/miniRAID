/** @packageDocumentation @module Struct */

import { Data } from "Phaser";
import { mRTypes } from "../Core/mRTypes";
// import { mRTypes } from "../core/ModuleProxy";

interface QueryCache<T>
{
    filter?: (arg: T) => boolean;
    sort?: (lhs: T, rhs: T) => number;
    latest: integer;
    result: Array<T>;
}

export class QuerySet<T>
{
    data: Set<T> | Map<string, T>;
    queries: Map<string, QueryCache<T>> = new Map<string, QueryCache<T>>();

    /** Used to determine are the queries dirty or not. */
    currentTimestamp: integer = 0;

    keyFn?: (a: T) => string;

    constructor(key?: (a: T) => string)
    {
        if (key)
        {
            this.keyFn = key;
            this.data = new Map<string, T>();
        }
        else
        {
            this.keyFn = undefined;
            this.data = new Set<T>();
        }
    }

    /**
     * Get all data inside this set as an array.
     */
    getAll(): IterableIterator<T>
    {
        return this.data.values();
    }

    has(item: T): boolean
    {
        if (this.keyFn)
        {
            return (<Map<string, T>>this.data).has(this.keyFn(item));
        }
        else
        {
            return (<Set<T>>this.data).has(item);
        }
    }

    /**
     * Add a query to the QuerySet.
     * @param name Name for this query, will be used in query() function.
     * @param filter filtering function as in Array.filter. It defines a criteia that whether an element in the query should be keeped or discarded. Returns false to filter out that element.
     * @param sort compareFunction as in Array.sort. You want to return a negative value if lhs < rhs and vice versa. The result then will come with an ascending order if you do so (smaller first).
     */
    addQuery(
        name: string,
        filter?: mRTypes.FilterFunc<T>,
        sort?: mRTypes.CompareFunc<T>
    )
    {
        // Note that every time you call this will force the query to be refreshed even if it is the same query
        this.queries.set(name, {
            'filter': filter,
            'sort': sort,
            'latest': -1,
            'result': [],
        });
    }

    /**
     * Add an item to this QuerySet.
     * 
     * @param item The item needs to be added
     * @param failCallback Callback if the item was already in this QuerySet. This callback takes the item (inside the QuerySet) as input and returns whether the item in this QuerySet is modified or not by the callback function (e.g. buffs might want to +1 stack if already exists), and updates currentTimeStep if modification was done.
     * @returns If the item has been added (no duplicates).
     */
    addItem(item: T, failCallback?: mRTypes.FailCallback<T>): boolean
    {
        if (!this.keyFn)
        {
            if (!(<Set<T>>this.data).has(item))
            {
                (<Set<T>>this.data).add(item);
                return true;
            }
            else if (failCallback)
            {
                let modified = failCallback(item); // since this condition implies item === item in the Set
                if (modified)
                {
                    this.currentTimestamp += 1;
                }

                return false;
            }
        }
        else
        {
            let key = this.keyFn(item);
            if (!(<Map<string, T>>this.data).has(key))
            {
                (<Map<string, T>>this.data).set(key, item);
                return true;
            }
            else if (failCallback)
            {
                let modified = failCallback((<Map<string, T>>this.data).get(key));
                if (modified)
                {
                    this.currentTimestamp += 1;
                }
                return false;
            }
        }
    }

    removeItem(item: T): boolean
    {
        if (!this.keyFn)
        {
            if ((<Set<T>>this.data).delete(item))
            {
                this.currentTimestamp += 1;
                return true;
            }
        }
        else
        {
            if ((<Map<string, T>>this.data).delete(this.keyFn(item)))
            {
                this.currentTimestamp += 1;
                return true;
            }
        }

        return false;
    }

    /**
     * Apply a query and return the results.
     * 
     * @param name The query needs to be performed.
     * @returns An array contains a sorted query results.
     */
    query(name: string): Array<T>
    {
        let q = this.queries.get(name);
        if (q.latest < this.currentTimestamp)
        {
            q.result = this.liveQuery(q.filter, q.sort);
            q.latest = this.currentTimestamp;
        }

        return q.result;
    }

    /**
     * Perform an online query with input functions.
     * @param filter Filter function
     * @param sort Compare function
     */
    liveQuery(
        filter?: mRTypes.FilterFunc<T>,
        sort?: mRTypes.CompareFunc<T>): Array<T>
    {
        let arr = Array.from<T>(this.data.values());

        if (filter)
        {
            arr = arr.filter(filter);
        }
        if (sort)
        {
            arr.sort(sort);
        }

        return arr;
    }
}