/**
 * Utility to map default properties
 */
export class OptionsMapper {
    static map(options, defaultOptions) {
        if (defaultOptions === options) {
            return defaultOptions;
        }
        for (const p in defaultOptions) {
            if (Object.prototype.hasOwnProperty.call(defaultOptions, p)) {
                if (!Object.prototype.hasOwnProperty.call(options, p)) {
                    options[p] = defaultOptions[p];
                }
            }
        }
        return options;
    }
}
//# sourceMappingURL=OptionsMapper.js.map