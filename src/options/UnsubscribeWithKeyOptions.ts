import { UnsubscribeOptions } from "./UnsubscribeOptions";

export interface UnsubscribeWithKeyOptions extends UnsubscribeOptions {
    removeOnlyFirstKeyedListener: boolean
}