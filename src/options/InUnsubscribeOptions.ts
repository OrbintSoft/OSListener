export interface IUnsubscribeOptions {
    /**
     * throw errors in case unsubscribe fails
     */
    canThrowError: boolean
    /**
     * if true remove only the first occurence otherwise all occurrences of same subscribed function 
     */
    removeOnlyFirstOccurrence: boolean
}