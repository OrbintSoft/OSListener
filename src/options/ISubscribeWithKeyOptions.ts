import { ISubscribeOptions } from "./ISubscribeOptions";

export interface ISubscribeWithKeyOptions extends ISubscribeOptions {
    allowMultipleListernersPerKey: boolean
}