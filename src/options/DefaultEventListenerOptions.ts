import { NullLogger } from "../utilities/NullLogger";
import { IEventListenerOptions } from "./IEventListenerOptions";

export const DefaultEventListenerOptions: IEventListenerOptions = {
    logger: console || NullLogger
}