import { DefaultSubscribeOptions } from "./options/DefaultSubscribeOptions";
import { ISubscribeOptions } from "./options/ISubscribeOptions";
import { ListenerFunction } from "./ListenerFunction";
import { ILogger } from "./utilities/ILogger";
import { IEventListenerOptions } from "./options/IEventListenerOptions";
import { DefaultEventListenerOptions } from "./options/DefaultEventListenerOptions";
import { IUnsubscribeOptions } from "./options/InUnsubscribeOptions";
import { DefaultUnsubscribeOptions } from "./options/DefaultUnsubscribeOptions";
import { NullLogger } from "./utilities/NullLogger";
import { ISubscribeWithKeyOptions } from "./options/ISubscribeWithKeyOptions";
import { OptionsMapper } from "./options/OptionsMapper";
import { DefaultSubscribeWithKeyOptions } from "./options/DefaultSubscribeWithKeyOptions";
import { DOMEvent } from "./DOMEvent";

/**
 * @author Stefano Balzarotti
 * @copyright OrbintSoft
 * Simple event listener.
 */
export class OSEventListener {    
    #name : string = '';
    #listeners: ListenerFunction[] = [];
    #logger: ILogger = NullLogger;
    #firstDispatchOccurred: boolean = false;
    #keyMappedListeners: Map<string, ListenerFunction[]> = new Map(); 
    #boundedDomEvents: DOMEvent[] = [];

    /**
     * The event name
     * @returns {string}
     */
    get name() : string {
        return this.#name;
    }

    /**
     * @param {string} name the name of the event 
     * @param {IEventListenerOptions} options
      */
    constructor(name: string, options: IEventListenerOptions = DefaultEventListenerOptions){
        options = OptionsMapper.map(options, DefaultEventListenerOptions);
        this.#logger = options.logger; 
        this.#name = name;
    }

    /**
     * @param {ListenerFunction} fn the function you want subscribe to the event
     * @param {ISubscribeOptions} [options=DefaultSubscribeOptions] 
     * @returns {boolean} function successfully subscribed
     */
    subscribe(fn: ListenerFunction, options: ISubscribeOptions = DefaultSubscribeOptions): boolean {
        options = OptionsMapper.map(options, DefaultSubscribeOptions);
        if (!this.#listeners.includes(fn) || options.allowMultipleSubscribeSameFunction){
            this.#listeners.push(fn);
            return true;
        } else {
            const errorMessage = 'An attempt to subscribe multiple times the same function occurred';
            if (options.canThrowError){
                throw new Error(errorMessage);                
            } else {
                this.#logger.warn(errorMessage);
                return false;
            }
        }
    }

    /**
     * @param {ListenerFunction} fn the function you want unsubscribe from the event
     * @param {IUnsubscribeOptions} [options] 
     * @returns {boolean} function successfully unsubscribed
     */
    unsubscribe(fn: ListenerFunction, options: IUnsubscribeOptions = DefaultUnsubscribeOptions) :boolean {
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
            if (options.canThrowError){
                throw new Error(errorMessage);                
            } else {
                this.#logger.warn(errorMessage);
                return false;
            }
        }        
    }

    /**
     * @returns {Promise<void>}
     */
    waitUntilFirstDispatchAsync() : Promise<void> {        
        const self = this;
        if (this.#firstDispatchOccurred){
            return Promise.resolve();
        } else {
            let listener: ListenerFunction = null;
            
            const promise = new Promise<void>((resolve, reject) => {
                listener = (sender, data) => {
                    self.unsubscribe(listener);
                    resolve();
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
     * @param {ISubscribeWithKeyOptions} [options = DefaultSubscribeWithKeyOptions]
     * @returns {boolean} if subscribed successfully
     */
    subscribeWithKey(fn: ListenerFunction, key: string, options: ISubscribeWithKeyOptions = DefaultSubscribeWithKeyOptions) : boolean{
        options = OptionsMapper.map(options, DefaultSubscribeWithKeyOptions);
        const mappedListeners = this.#keyMappedListeners.get(key) || [];
        if (mappedListeners.length === 0 || options.allowMultipleListernersPerKey){
            mappedListeners.push(fn);
        } else {
            const message = 'An attempt to add a listener with same key occurred';
            if (options.canThrowError){
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

    /**
     * @param {EventTarget} element 
     * @param {string} eventName 
     * @param {AddEventListenerOptions} [options]
     * @returns {boolean} if event has been bounded successfully
     */
    bindToDOMEvent(element: EventTarget, eventName: string, options : AddEventListenerOptions = null): boolean{
        const self = this;
        if (this.#boundedDomEvents.findIndex(bde => bde.eventName === eventName && bde.element === element) === -1){
            const fn = function (event: Event) {
                const sender = this;
                const data = {
                    event: event,
                    args: arguments
                };
                self.dispatch(sender, data);
            };
            this.#boundedDomEvents.push({
                element: element,
                eventName: eventName,
                eventHandler: fn
            });
            element.addEventListener(eventName, fn, options);
            return true;
        } else{
            const errorMessage = 'An attempt to bound an already bounded dom event occurred';
            this.#logger.warn(errorMessage);
            return false;
        }
    }

    /**
     * @param {EventTarget} element 
     * @param {string} eventName 
     * @param {EventListenerOptions} [options] 
     */
    unbindDOMEvent(element: EventTarget, eventName: string, options : EventListenerOptions = null): boolean{
        const i = this.#boundedDomEvents.findIndex(bde => bde.eventName === eventName && bde.element === element);
        if (i !== -1){
            const boundedEvent = this.#boundedDomEvents[i];
            element.removeEventListener(eventName, boundedEvent.eventHandler, options);
            this.#boundedDomEvents = this.#boundedDomEvents.splice(i, 1);
        }        
        return false;
    }    
} 