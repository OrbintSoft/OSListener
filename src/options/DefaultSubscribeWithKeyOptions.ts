import { DefaultSubscribeOptions } from "./DefaultSubscribeOptions";
import { ISubscribeWithKeyOptions } from "./ISubscribeWithKeyOptions";

export const DefaultSubscribeWithKeyOptions: ISubscribeWithKeyOptions = {
    allowMultipleListernersPerKey: true,
    canThrowError: DefaultSubscribeOptions.canThrowError,
    allowMultipleSubscribeSameFunction: DefaultSubscribeOptions.allowMultipleSubscribeSameFunction
};