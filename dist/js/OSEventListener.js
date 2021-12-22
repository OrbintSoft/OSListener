var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _OSEventListener_instances, _OSEventListener_name, _OSEventListener_listeners, _OSEventListener_logger, _OSEventListener_firstDispatchOccurred, _OSEventListener_keyMappedListeners, _OSEventListener_latestData, _OSEventListener_removeFunctionFromKeyMap;
import { DefaultSubscribeOptions } from "./options/DefaultSubscribeOptions";
import { DefaultEventListenerOptions } from "./options/DefaultEventListenerOptions";
import { DefaultUnsubscribeOptions } from "./options/DefaultUnsubscribeOptions";
import { NullLogger } from "./utilities/NullLogger";
import { OptionsMapper } from "./options/OptionsMapper";
import { DefaultSubscribeWithKeyOptions } from "./options/DefaultSubscribeWithKeyOptions";
import { DefaultUnsubscribeWithKeyOptions } from "./options/DefaultUnsubscribeWithKeyOptions";
import { DefaultDispatchOptions } from "./options/DefaultDispatchOptions";
import { DefaultWaitUntilFirstDispatchOptions } from "./options/DefaultWaitUntilFirstDispatchOptions";
/**
 * @author Stefano Balzarotti
 * @copyright OrbintSoft
 * Simple event listener.
 */
export class OSEventListener {
    /**
     * @param {string} name the name of the event
     * @param {IEventListenerOptions} options
      */
    constructor(name, options = DefaultEventListenerOptions) {
        _OSEventListener_instances.add(this);
        _OSEventListener_name.set(this, '');
        _OSEventListener_listeners.set(this, []);
        _OSEventListener_logger.set(this, NullLogger);
        _OSEventListener_firstDispatchOccurred.set(this, false);
        _OSEventListener_keyMappedListeners.set(this, new Map());
        _OSEventListener_latestData.set(this, null);
        options = OptionsMapper.map(options, DefaultEventListenerOptions);
        __classPrivateFieldSet(this, _OSEventListener_logger, options.logger, "f");
        __classPrivateFieldSet(this, _OSEventListener_name, name, "f");
    }
    /**
     * The event name
     * @returns {string}
     */
    get name() {
        return __classPrivateFieldGet(this, _OSEventListener_name, "f");
    }
    /**
     * Gets the internal logger
     */
    get logger() {
        return __classPrivateFieldGet(this, _OSEventListener_logger, "f");
    }
    /**
     * @param {ListenerFunction} fn the function you want subscribe to the event
     * @param {SubscribeOptions} [options=DefaultSubscribeOptions]
     * @returns {boolean} function successfully subscribed
     */
    subscribe(fn, options = DefaultSubscribeOptions) {
        options = OptionsMapper.map(options, DefaultSubscribeOptions);
        if (!__classPrivateFieldGet(this, _OSEventListener_listeners, "f").includes(fn) || options.allowMultipleSubscribeSameFunction) {
            __classPrivateFieldGet(this, _OSEventListener_listeners, "f").push(fn);
            return true;
        }
        else {
            const errorMessage = 'An attempt to subscribe multiple times the same function occurred';
            if (options.shouldThrowErrors) {
                throw new Error(errorMessage);
            }
            else {
                __classPrivateFieldGet(this, _OSEventListener_logger, "f").warn(errorMessage);
                return false;
            }
        }
    }
    /**
     * @param {ListenerFunction} fn the function you want unsubscribe from the event
     * @param {UnsubscribeOptions} [options]
     * @returns {boolean} function successfully unsubscribed
     */
    unsubscribe(fn, options = DefaultUnsubscribeOptions) {
        options = OptionsMapper.map(options, DefaultUnsubscribeOptions);
        let i = -1;
        let found = false;
        do {
            i = __classPrivateFieldGet(this, _OSEventListener_listeners, "f").indexOf(fn);
            if (i !== -1) {
                __classPrivateFieldGet(this, _OSEventListener_listeners, "f").splice(i, 1);
                found = true;
            }
            if (options.removeOnlyFirstOccurrence) {
                break;
            }
        } while (i !== -1);
        if (found) {
            __classPrivateFieldGet(this, _OSEventListener_instances, "m", _OSEventListener_removeFunctionFromKeyMap).call(this, fn, options);
            return true;
        }
        else {
            const errorMessage = 'An attempt to unsubscribe a non sunscribed function occurred';
            if (options.shouldThrowErrors) {
                throw new Error(errorMessage);
            }
            else {
                __classPrivateFieldGet(this, _OSEventListener_logger, "f").warn(errorMessage);
                return false;
            }
        }
    }
    /**
     * Resets the first dispatch status
     */
    resetFirstDispatch() {
        __classPrivateFieldSet(this, _OSEventListener_firstDispatchOccurred, false, "f");
    }
    /**
     * Dispatch the event
     * @param {any} sender
     * @param {any} data
     */
    dispatch(sender, data, options = DefaultDispatchOptions) {
        options = OptionsMapper.map(options, DefaultDispatchOptions);
        if (options.storeData) {
            __classPrivateFieldSet(this, _OSEventListener_latestData, data, "f");
        }
        __classPrivateFieldSet(this, _OSEventListener_firstDispatchOccurred, true, "f");
        for (const f of __classPrivateFieldGet(this, _OSEventListener_listeners, "f")) {
            try {
                f(sender, data);
            }
            catch (ex) {
                __classPrivateFieldGet(this, _OSEventListener_logger, "f").error(ex);
            }
        }
    }
    /**
     * @returns {Promise<unknown>}
     */
    waitUntilFirstDispatchAsync(options = DefaultWaitUntilFirstDispatchOptions) {
        const myself = this;
        options = OptionsMapper.map(options, DefaultWaitUntilFirstDispatchOptions);
        if (options.resetFirstDispatchBefore) {
            this.resetFirstDispatch();
        }
        if (__classPrivateFieldGet(this, _OSEventListener_firstDispatchOccurred, "f")) {
            if (options.resetFirstDispatchAfter) {
                this.resetFirstDispatch();
            }
            return Promise.resolve(__classPrivateFieldGet(this, _OSEventListener_latestData, "f"));
        }
        else {
            let listener;
            const promise = new Promise((resolve, reject) => {
                listener = (sender, data) => {
                    myself.unsubscribe(listener);
                    if (options.resetFirstDispatchAfter) {
                        myself.resetFirstDispatch();
                    }
                    resolve(data);
                };
                if (!myself.subscribe(listener)) {
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
    subscribeWithKey(fn, key, options = DefaultSubscribeWithKeyOptions) {
        options = OptionsMapper.map(options, DefaultSubscribeWithKeyOptions);
        const mappedListeners = __classPrivateFieldGet(this, _OSEventListener_keyMappedListeners, "f").get(key) || [];
        if (mappedListeners.length === 0 || options.allowMultipleListernersPerKey) {
            mappedListeners.push(fn);
        }
        else {
            const errorMessage = 'An attempt to add a listener with same key occurred';
            if (options.shouldThrowErrors) {
                throw Error(errorMessage);
            }
            else {
                __classPrivateFieldGet(this, _OSEventListener_logger, "f").error(errorMessage);
                return false;
            }
        }
        __classPrivateFieldGet(this, _OSEventListener_keyMappedListeners, "f").set(key, mappedListeners);
        return this.subscribe(fn);
    }
    /**
     * @param {string} key the key to use for unsubscribe
     * @param {UnsubscribeWithKeyOptions} [options = DefaultUnsubscribeWithKeyOptions]
     * @returns {boolean} if unsubscribed successfully
     */
    unsubscribeWithKey(key, options = DefaultUnsubscribeWithKeyOptions) {
        const mappedListeners = __classPrivateFieldGet(this, _OSEventListener_keyMappedListeners, "f").get(key) || [];
        let found = false;
        for (const fn of mappedListeners) {
            this.unsubscribe(fn, options);
            found = true;
            if (options.removeOnlyFirstKeyedListener) {
                break;
            }
        }
        if (!found) {
            const errorMessage = "An attempt to unsubscribe a non mapped listener occurred";
            if (options.shouldThrowErrors) {
                throw Error(errorMessage);
            }
            else {
                __classPrivateFieldGet(this, _OSEventListener_logger, "f").warn(errorMessage);
            }
        }
        return found;
    }
}
_OSEventListener_name = new WeakMap(), _OSEventListener_listeners = new WeakMap(), _OSEventListener_logger = new WeakMap(), _OSEventListener_firstDispatchOccurred = new WeakMap(), _OSEventListener_keyMappedListeners = new WeakMap(), _OSEventListener_latestData = new WeakMap(), _OSEventListener_instances = new WeakSet(), _OSEventListener_removeFunctionFromKeyMap = function _OSEventListener_removeFunctionFromKeyMap(fn, options) {
    if (typeof (fn._keyedOsEvent) === 'string') {
        const possibleFns = __classPrivateFieldGet(this, _OSEventListener_keyMappedListeners, "f").get(fn._keyedOsEvent);
        if (possibleFns) {
            let i = -1;
            do {
                i = possibleFns.indexOf(fn);
                if (i !== -1) {
                    possibleFns.splice(i, 1);
                }
                if (options.removeOnlyFirstOccurrence) {
                    break;
                }
            } while (i !== -1);
        }
    }
};
//# sourceMappingURL=OSEventListener.js.map