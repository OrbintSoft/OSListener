import { Logger } from "./Logger";

export const NullLogger: Logger = {
    debug: function (): void {        
         // do nothing.
    },
    error: function (): void {
         // do nothing.
    },
    info: function (): void {
         // do nothing.
    },
    log: function (): void {
         // do nothing.
    },
    trace: function (): void {
         // do nothing.
    },
    warn: function (): void {
         // do nothing.
    }
}