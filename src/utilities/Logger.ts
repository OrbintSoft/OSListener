export interface Logger{
    debug(...data: any[]): void;
    error(...data: any[]): void;
    info(...data: any[]): void;
    log(...data: any[]): void;
    trace(...data: any[]): void;
    warn(...data: any[]): void;
}