import { Logger } from "./Logger";

export const NullLogger: Logger = {
    debug: function (...data: any[]): void {        
    },
    error: function (...data: any[]): void {
    },
    info: function (...data: any[]): void {
    },
    log: function (...data: any[]): void {
    },
    trace: function (...data: any[]): void {
    },
    warn: function (...data: any[]): void {
    }
}