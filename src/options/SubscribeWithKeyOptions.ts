import { SubscribeOptions } from "./SubscribeOptions";

export interface SubscribeWithKeyOptions extends SubscribeOptions {
    allowMultipleListernersPerKey: boolean
}