import {DefaultInterval, flattenSlots, isFullDay, mergeSlots, Options, StartEnd} from "./helpers";
import {strToIndex} from "./internal";


export function compactSlots(options: Options): StartEnd[] {
    let slots = flattenSlots(options)
    return mergeSlots(slots, options)
}

export function isAvailable(slots: boolean[], options: {
    interval?: number // unit in ms, default is 1 second
    start: string
    end: string
}): boolean {
    const INTERVAL = options.interval || DefaultInterval
    let START = strToIndex(options.start, INTERVAL);
    let END = strToIndex(options.end, INTERVAL);

    if (isFullDay(options, INTERVAL)) {
        START = 0
        END = slots.length
    }


    for (let i = START; i < END; i++) {
        if (!slots[i]) {
            return false
        }
    }
    return true
}
