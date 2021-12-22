var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _OSDomEventListener_boundedDomEvents, _OSDomEventListener_attachedDomElements;
import { DefaultBindToDOMEventsOptions } from "./options/DefaultBindToDOMEventsOptions";
import { DefaultDispatchOptions } from "./options/DefaultDispatchOptions";
import { DefaultUnbindToDOMEventsOptions } from "./options/DefaultUnbindToDomEventsOptions";
import { OptionsMapper } from "./options/OptionsMapper";
import { OSEventListener } from "./OSEventListener";
export class OSDomEventListener extends OSEventListener {
    constructor() {
        super(...arguments);
        _OSDomEventListener_boundedDomEvents.set(this, []);
        _OSDomEventListener_attachedDomElements.set(this, []);
    }
    /**
     * @param {any} sender
     * @param {any} data
     * @param {DispatchOptions} [options = DefaultDispatchOptions]
     */
    dispatch(sender, data, options = DefaultDispatchOptions) {
        super.dispatch(sender, data);
        const event = new CustomEvent(this.name, {
            detail: {
                sender: sender,
                data: data
            }
        });
        for (const el of __classPrivateFieldGet(this, _OSDomEventListener_attachedDomElements, "f")) {
            el.dispatchEvent(event);
        }
    }
    /**
     * @param {EventTarget} element
     * @param {string} eventName
     * @param {AddEventListenerOptions} [options]
     * @returns {boolean} true if event has been bounded successfully
     */
    bindToDOMEvent(element, eventName, options = DefaultBindToDOMEventsOptions) {
        const myself = this;
        options = OptionsMapper.map(options, DefaultBindToDOMEventsOptions);
        if (__classPrivateFieldGet(this, _OSDomEventListener_boundedDomEvents, "f").findIndex(bde => bde.eventName === eventName && bde.element === element) === -1) {
            const fn = function (event, ...args) {
                const sender = element;
                const data = {
                    event: event,
                    otherArgs: args
                };
                myself.dispatch(sender, data);
            };
            __classPrivateFieldGet(this, _OSDomEventListener_boundedDomEvents, "f").push({
                element: element,
                eventName: eventName,
                eventHandler: fn
            });
            element.addEventListener(eventName, fn, options);
            return true;
        }
        else {
            const errorMessage = 'An attempt to bound an already bounded dom event occurred';
            if (options.shouldThrowErrors) {
                throw Error(errorMessage);
            }
            else {
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
    unbindDOMEvent(element, eventName, options = DefaultUnbindToDOMEventsOptions) {
        options = OptionsMapper.map(options, DefaultUnbindToDOMEventsOptions);
        const i = __classPrivateFieldGet(this, _OSDomEventListener_boundedDomEvents, "f").findIndex(bde => bde.eventName === eventName && bde.element === element);
        if (i !== -1) {
            const boundedEvent = __classPrivateFieldGet(this, _OSDomEventListener_boundedDomEvents, "f")[i];
            element.removeEventListener(eventName, boundedEvent.eventHandler, options);
            __classPrivateFieldGet(this, _OSDomEventListener_boundedDomEvents, "f").splice(i, 1);
            return true;
        }
        else {
            const errorMessage = 'An attempt to unbound a non bounded dom event occurred';
            if (options.shouldThrowErrors) {
                throw Error(errorMessage);
            }
            else {
                this.logger.warn(errorMessage);
                return false;
            }
        }
    }
    attachToDOMElement(element) {
        if (!__classPrivateFieldGet(this, _OSDomEventListener_attachedDomElements, "f").includes(element)) {
            __classPrivateFieldGet(this, _OSDomEventListener_attachedDomElements, "f").push(element);
        }
    }
    detachFromDOMElement(element) {
        const i = __classPrivateFieldGet(this, _OSDomEventListener_attachedDomElements, "f").indexOf(element);
        if (i !== -1) {
            __classPrivateFieldGet(this, _OSDomEventListener_attachedDomElements, "f").splice(i, 1);
        }
    }
}
_OSDomEventListener_boundedDomEvents = new WeakMap(), _OSDomEventListener_attachedDomElements = new WeakMap();
//# sourceMappingURL=OSDomEventListener.js.map