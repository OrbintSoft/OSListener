/**
 * Utility to map default properties
 */
export class OptionsMapper {
    static map<T>(options: unknown, defaultOptions: T): T{
        if (defaultOptions === options){
            return defaultOptions;
        }
        for (const p in defaultOptions){
            if (defaultOptions.hasOwnProperty(p)){
                if (!options.hasOwnProperty(p)){
                    options[p] = defaultOptions[p];
                }
            }
        }   
        return options as T;
    }
}