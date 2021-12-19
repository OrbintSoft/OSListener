import { ErrorThrowable } from "./ErrorThrowable";

export interface SubscribeOptions extends ErrorThrowable {
    /**
     * allows to subscribe multiple times the same function
     */
    allowMultipleSubscribeSameFunction: boolean
}