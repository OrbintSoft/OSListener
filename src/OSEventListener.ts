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
import { UnsubscribeWithKeyOptions } from "./options/UnsubscribeWithKeyOptions";
import { DefaultUnsubscribeWithKeyOptions } from "./options/DefaultUnsubscribeWithKeyOptions";
import { DefaultDispatchOptions } from "./options/DefaultDispatchOptions";
import { WaitUntilFirstDispatchOptions } from "./options/WaitUntilFirstDispatchOptions";
import { DefaultWaitUntilFirstDispatchOptions } from "./options/DefaultWaitUntilFirstDispatchOptions";

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
    #latestData: unknown = null;

    /**
     * The event name
     * @returns {string}
     */
    get name() : string {
        return this.#name;
    }

    /**
     * Gets the internal logger
     */
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
    

    #removeFunctionFromKeyMap(fn: ListenerFunction, options: UnsubscribeOptions){
        if (fn._keyedOsEvent){
            const possibleFns = this.#keyMappedListeners.get(fn._keyedOsEvent);
            if (possibleFns){
                let i = -1;
                do {
                    i = possibleFns.indexOf(fn);
                    if (i!== -1){
                        possibleFns.splice(i, 1);
                    }   
                    if (options.removeOnlyFirstOccurrence){
                        break;
                    }                             
                } while (i !== -1);   
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
                this.#listeners.splice(i, 1);
                found = true;
            }
            if (options.removeOnlyFirstOccurrence){
                break;
            }
        } while (i !== -1);
        if (found){
            this.#removeFunctionFromKeyMap(fn, options);
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
     * Resets the first dispatch status
     */
    resetFirstDispatch(){
        this.#firstDispatchOccurred = false;
    }

    /**
     * Dispatch the event
     * @param {any} sender 
     * @param {any} data 
     */
    dispatch(sender: any, data: any, options = DefaultDispatchOptions){
        options = OptionsMapper.map(options, DefaultDispatchOptions);
        if (options.storeData){
            this.#latestData = data;
        }
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
     * @returns {Promise<unknown>}
     */
    waitUntilFirstDispatchAsync(options: WaitUntilFirstDispatchOptions = DefaultWaitUntilFirstDispatchOptions) : Promise<unknown> {        
        const self = this;
        options = OptionsMapper.map(options, DefaultWaitUntilFirstDispatchOptions);
        if (options.resetFirstDispatchBefore){
            this.resetFirstDispatch();
        }
        if (this.#firstDispatchOccurred){
            if (options.resetFirstDispatchAfter){
                this.resetFirstDispatch();
            }
            return Promise.resolve(this.#latestData);
        } else {
            let listener: ListenerFunction = null;
            
            const promise = new Promise<unknown>((resolve, reject) => {
                listener = (sender, data) => {
                    self.unsubscribe(listener);
                    if (options.resetFirstDispatchAfter){
                        self.resetFirstDispatch();
                    }
                    resolve(data);
                }
                if (!self.subscribe(listener)){
                    reject();
                }                                
            });
            return promise;
        }
    }

    /**
     * @param {ListenerFunction} fn the function to subscribe
     * @param {string} key the key to be used fir subscribe
     * @param {SubscribeWithKeyOptions} [options = DefaultSubscribeWithKeyOptions]
     * @returns {boolean} if subscribed successfully
     */
    subscribeWithKey(fn: ListenerFunction, key: string, options: SubscribeWithKeyOptions = DefaultSubscribeWithKeyOptions) : boolean{
        options = OptionsMapper.map(options, DefaultSubscribeWithKeyOptions);
        const mappedListeners = this.#keyMappedListeners.get(key) || [];
        if (mappedListeners.length === 0 || options.allowMultipleListernersPerKey){
            mappedListeners.push(fn);
        } else {
            const errorMessage = 'An attempt to add a listener with same key occurred';
            if (options.shouldThrowErrors){
                throw Error(errorMessage);
            } else {
                this.#logger.error(errorMessage);
                return false;
            }
        }

        this.#keyMappedListeners.set(key, mappedListeners);
        return this.subscribe(fn);
    }

    /**
     * @param {string} key the key to use for unsubscribe
     * @param {UnsubscribeWithKeyOptions} [options = DefaultUnsubscribeWithKeyOptions]
     * @returns {boolean} if unsubscribed successfully
     */
    unsubscribeWithKey(key: string, options: UnsubscribeWithKeyOptions = DefaultUnsubscribeWithKeyOptions): boolean{
        const mappedListeners = this.#keyMappedListeners.get(key) || [];
        let found = false;
        for (const fn of mappedListeners){            
            this.unsubscribe(fn, options);
            found = true;            
            if (options.removeOnlyFirstKeyedListener){
                break;   
            }
        }     
        if (!found){
            const errorMessage = "An attempt to unsubscribe a non mapped listener occurred";
            if (options.shouldThrowErrors){
                throw Error(errorMessage);
            } else {
                this.#logger.warn(errorMessage);
            }
        }   
        return found;
    }    
} 