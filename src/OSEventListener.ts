import { DefaultSubscribeOptions } from "./options/DefaultSubscribeOptions";
import { ISubscribeOptions } from "./options/ISubscribeOptions";
import { ListenerFunction } from "./ListenerFunction";
import { ILogger } from "./utilities/ILogger";
import { IEventListenerOptions } from "./options/IEventListenerOptions";
import { DefaultEventListenerOptions } from "./options/DefaultEventListenerOptions";
import { IUnsubscribeOptions } from "./options/InUnsubscribeOptions";
import { DefaultUnsubscribeOptions } from "./options/DefaultUnsubscribeOptions";

/**
 * @author Stefano Balzarotti
 * @copyright OrbintSoft
 * Simple event listener.
 */
export class OSEventListener {    
    #name : string = '';
    #listeners: ListenerFunction[] = [];
    #logger: ILogger

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
        this.#logger = options.logger; 
        this.#name = name;
    }

    /**
     * @param {ListenerFunction} fn the function you want subscribe to the event
     * @param {ISubscribeOptions} [options=DefaultSubscribeOptions] 
     */
    subscribe(fn: ListenerFunction, options: ISubscribeOptions = DefaultSubscribeOptions){
        if (!this.#listeners.includes(fn) || options.allowMultipleSubscribeSameFunction){
            this.#listeners.push(fn);
        } else {
            const errorMessage = 'An attempt to subscribe multiple times the same function occurred';
            if (options.canThrowError){
                throw new Error(errorMessage);                
            } else {
                this.#logger.warn(errorMessage);
            }
        }
    }

    /**
     * @param {ListenerFunction} fn the function you want unsubscribe from the event
     * @param {IUnsubscribeOptions} [options] 
     */
    unsubscribe(fn: ListenerFunction, options: IUnsubscribeOptions = DefaultUnsubscribeOptions){
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
        if (!found){
            const errorMessage = 'An attempt to unsubscribe a non sunscribed function occurred';
            if (options.canThrowError){
                throw new Error(errorMessage);                
            } else {
                this.#logger.warn(errorMessage);
            }
        }        
    }
} 