import { ErrorThrowable } from "./ErrorThrowable";

export interface UnsubscribeOptions extends ErrorThrowable {
    /**
     * if true remove only the first occurence otherwise all occurrences of same subscribed function 
     */
    removeOnlyFirstOccurrence: boolean
}