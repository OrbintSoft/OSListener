import { NullLogger } from "../utilities/NullLogger";
import { EventListenerOptions } from "./EventListenerOptions";

export const DefaultEventListenerOptions: EventListenerOptions = {
    logger: console || NullLogger
}