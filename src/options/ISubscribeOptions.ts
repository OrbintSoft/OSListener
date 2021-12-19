export interface ISubscribeOptions {
    /**
     * throw errors in case subscribe fails
     */
    canThrowError: boolean
    /**
     * allows to subscribe multiple times the same function
     */
    allowMultipleSubscribeSameFunction: boolean
}