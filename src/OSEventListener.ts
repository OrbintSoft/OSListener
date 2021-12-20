import { DefaultSubscribeOptions } from "./options/DefaultSubscribeOptions";
import { SubscribeOptions } from "./options/SubscribeOptions";
import { ListenerFunction } from "./ListenerFunction";
import { Logger } from "./utilities/Logger";
import { EventListenerOptions } from "./options/EventListenerOptions";
import { DefaultEventListenerOptions } from "./options/DefaultEventListenerOptions";
import { UnsubscribeOptions } from "./options/UnsubscribeOptions";
import { DefaultUnsubscribeOptions } from "./options/DefaultUnsubscribeOptions";
import { NullLogger } from "./utilities/NullLogger";
import { SubscribeWithKeyOptions } from "./options/SubscribeWithKeyOptions";
import { OptionsMapper } from "./options/OptionsMapper";
import { DefaultSubscribeWithKeyOptions } from "./options/DefaultSubscribeWithKeyOptions";

/**
 * @author Stefano Balzarotti
 * @copyright OrbintSoft
 * Simple event listener.
 */
export class OSEventListener {    
    #name : string = '';
    #listeners: ListenerFunction[] = [];
    #logger: Logger = NullLogger;
    #firstDispatchOccurred: boolean = false;
    #keyMappedListeners: Map<string, ListenerFunction[]> = new Map(); 

    /**
     * The event name
     * @returns {string}
     */
    get name() : string {
        return this.#name;
    }

    protected get logger(): Logger {
        return this.#logger;
    }

    /**
     * @param {string} name the name of the event 
     * @param {IEventListenerOptions} options
      */
    constructor(name: string, options: EventListenerOptions = DefaultEventListenerOptions){
        options = OptionsMapper.map(options, DefaultEventListenerOptions);
        this.#logger = options.logger; 
        this.#name = name;
    }

    /**
     * @param {ListenerFunction} fn the function you want subscribe to the event
     * @param {SubscribeOptions} [options=DefaultSubscribeOptions] 
     * @returns {boolean} function successfully subscribed
     */
    subscribe(fn: ListenerFunction, options: SubscribeOptions = DefaultSubscribeOptions): boolean {
        options = OptionsMapper.map(options, DefaultSubscribeOptions);
        if (!this.#listeners.includes(fn) || options.allowMultipleSubscribeSameFunction){
            this.#listeners.push(fn);
            return true;
        } else {
            const errorMessage = 'An attempt to subscribe multiple times the same function occurred';
            if (options.shouldThrowErrors){
                throw new Error(errorMessage);                
            } else {
                this.#logger.warn(errorMessage);
                return false;
            }
        }
    }

    /**
     * @param {ListenerFunction} fn the function you want unsubscribe from the event
     * @param {UnsubscribeOptions} [options] 
     * @returns {boolean} function successfully unsubscribed
     */
    unsubscribe(fn: ListenerFunction, options: UnsubscribeOptions = DefaultUnsubscribeOptions) :boolean {
        options = OptionsMapper.map(options, DefaultUnsubscribeOptions);
        let i = -1;
        let found = false;
        do {
            i = this.#listeners.indexOf(fn);
            if (i !== -1){
                this.#listeners = this.#listeners.splice(i, 1);
                found = true;
            }
            if (options.removeOnlyFirstOccurrence){
                break;
            }
        } while (i !== -1);
        if (found){
            return true;
        } else {
            const errorMessage = 'An attempt to unsubscribe a non sunscribed function occurred';
            if (options.shouldThrowErrors){
                throw new Error(errorMessage);                
            } else {
                this.#logger.warn(errorMessage);
                return false;
            }
        }        
    }

    /**
     * @returns {Promise<unknown>}
     */
    waitUntilFirstDispatchAsync(options = null) : Promise<unknown> {        
        const self = this;
        if (this.#firstDispatchOccurred){
            return Promise.resolve();
        } else {
            let listener: ListenerFunction = null;
            
            const promise = new Promise<unknown>((resolve, reject) => {
                listener = (sender, data) => {
                    self.unsubscribe(listener);
                    resolve(null);
                }
                self.subscribe(listener);                                
            });
            return promise;
        }
    }

    /**
     * Dispatch the event
     * @param {any} sender 
     * @param {any} data 
     */
    dispatch(sender: any, data: any){
        this.#firstDispatchOccurred = true;
        for (const f of this.#listeners){
            try {
                f(sender, data);
            } catch (ex){
                this.#logger.error(ex);
            }
        }
    }

    /**
     * @param {ListenerFunction} fn 
     * @param {string} key 
     * @param {SubscribeWithKeyOptions} [options = DefaultSubscribeWithKeyOptions]
     * @returns {boolean} if subscribed successfully
     */
    subscribeWithKey(fn: ListenerFunction, key: string, options: SubscribeWithKeyOptions = DefaultSubscribeWithKeyOptions) : boolean{
        options = OptionsMapper.map(options, DefaultSubscribeWithKeyOptions);
        const mappedListeners = this.#keyMappedListeners.get(key) || [];
        if (mappedListeners.length === 0 || options.allowMultipleListernersPerKey){
            mappedListeners.push(fn);
        } else {
            const message = 'An attempt to add a listener with same key occurred';
            if (options.shouldThrowErrors){
                throw Error(message);
            } else {
                this.#logger.error(message);
                return false;
            }
        }

        this.#keyMappedListeners.set(key, mappedListeners);
        return this.subscribe(fn);
    }

    /**
     * @param {string} key 
     * @returns {boolean} if unsubscribed successfully
     */
    unsubscribeWithKey(key: string): boolean{
        const mappedListeners = this.#keyMappedListeners.get(key) || [];
        let found = false;
        for (const fn of mappedListeners){
            this.unsubscribe(fn);
            found = true;
        }
        return found;
    }    
} 