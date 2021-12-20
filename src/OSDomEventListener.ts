import { DOMEvent } from "./DOMEvent";
import { BindToDOMEventOptions } from "./options/BindToDOMEventOptions";
import { DefaultBindToDOMEventsOptions } from "./options/DefaultBindToDOMEventsOptions";
import { DefaultUnbindToDOMEventsOptions } from "./options/DefaultUnbindToDomEventsOptions";
import { OptionsMapper } from "./options/OptionsMapper";
import { UnbindToDOMEventOptions } from "./options/UnbindToDOMEventOptions";
import { OSEventListener } from "./OSEventListener";

export class OSDomEventListener extends OSEventListener{
    #boundedDomEvents: DOMEvent[] = [];
    #attachedDomElements : EventTarget[]=  [];

    dispatch(sender: any, data: any): void {
        super.dispatch(sender, data);
        const event = new CustomEvent(this.name, {
            detail: {
                sender: sender,
                data: data
            }
        });
        for (const el of this.#attachedDomElements){
            el.dispatchEvent(event);
        }
    }

    /**
     * @param {EventTarget} element 
     * @param {string} eventName 
     * @param {AddEventListenerOptions} [options]
     * @returns {boolean} true if event has been bounded successfully
     */
     bindToDOMEvent(element: EventTarget, eventName: string, options : BindToDOMEventOptions = DefaultBindToDOMEventsOptions): boolean{
        const self = this;
        options = OptionsMapper.map(options, DefaultBindToDOMEventsOptions);
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
            if (options.shouldThrowErrors){

            } else {
                this.logger.warn(errorMessage);
                return false;
            }
        }
    }

    /**
     * @param {EventTarget} element 
     * @param {string} eventName 
     * @param {EventListenerOptions} [options=DefaultUnbindToDOMEventsOptions] 
     * @returns {boolean} true if event has been unbounded successfully
     */
    unbindDOMEvent(element: EventTarget, eventName: string, options : UnbindToDOMEventOptions = DefaultUnbindToDOMEventsOptions): boolean{
        options = OptionsMapper.map(options, DefaultUnbindToDOMEventsOptions);
        const i = this.#boundedDomEvents.findIndex(bde => bde.eventName === eventName && bde.element === element);
        if (i !== -1){
            const boundedEvent = this.#boundedDomEvents[i];
            element.removeEventListener(eventName, boundedEvent.eventHandler, options);
            this.#boundedDomEvents = this.#boundedDomEvents.splice(i, 1);
            return true;
        } else {
            const errorMessage = 'An attempt to unbound a non bounded dom event occurred';
            if (options.shouldThrowErrors){
                throw Error(errorMessage);
            } else {
                this.logger.warn(errorMessage);
                return false;
            }            
        }                
    }

    attachToDOMElement(element: EventTarget){
        if (!this.#attachedDomElements.includes(element)){
            this.#attachedDomElements.push(element);
        }
    }

    detachFromDOMElement(element: EventTarget){
        const i = this.#attachedDomElements.indexOf(element);
        if (i !== -1){
            this.#attachedDomElements = this.#attachedDomElements.splice(i, 1);
        }
    }
}