/**
 * Utility to map default properties
 */
export class OptionsMapper {
    static map<T>(options: any, defaultOptions: (T & object)): T{
        if (defaultOptions === options){
            return defaultOptions;
        }
        for (const p in defaultOptions){
            if (Object.prototype.hasOwnProperty.call(defaultOptions, p)){
                if (!Object.prototype.hasOwnProperty.call(options, p)){
                    options[p] = defaultOptions[p];
                }
            }
        }   
        return options as T;
    }
}