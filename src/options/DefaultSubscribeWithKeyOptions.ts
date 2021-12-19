import { DefaultSubscribeOptions } from "./DefaultSubscribeOptions";
import { SubscribeWithKeyOptions } from "./SubscribeWithKeyOptions";

export const DefaultSubscribeWithKeyOptions: SubscribeWithKeyOptions = {
    allowMultipleListernersPerKey: true,
    shouldThrowErrors: DefaultSubscribeOptions.shouldThrowErrors,
    allowMultipleSubscribeSameFunction: DefaultSubscribeOptions.allowMultipleSubscribeSameFunction
};