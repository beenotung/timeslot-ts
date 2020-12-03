import {indexToStr, strToIndex} from "./internal"

export const SECOND = 1000
export const MINUTE = SECOND * 60
export const DefaultInterval = MINUTE

export type StartEnd = {
    start: string
    end: string
}
export type BW = 'black' | 'white'


const FIRST_TIME = '00:00'
const LAST_TIME = '24:00'

enum Mode {
    find_start,
    find_end
}


export type Options = {
    whitelistSlots?: StartEnd[],
    blacklistSlots?: StartEnd[],
    interval?: number // unit in ms, default is 1 second
    defaultState?: BW // for unspecified slots, default is black
    priority?: BW // when the blacklist and whitelist conflict, which one to favour? default is white
}


export function mergeSlots(slots: boolean[], options: Options): StartEnd[] {
    const INTERVAL = options.interval || DefaultInterval
    const START = strToIndex(FIRST_TIME, INTERVAL);
    const END = strToIndex(LAST_TIME, INTERVAL);

    let res: StartEnd[] = []
    let mode = Mode.find_start
    let start: number
    let end: number
    let isFullDay = true
    for (let i = START; i <= END; i++) {
        isFullDay = isFullDay && slots[i]
        if (mode == Mode.find_start && slots[i]) {
            start = i
            mode = Mode.find_end
        } else if (mode == Mode.find_end && !slots[i]) {
            end = i
            mode = Mode.find_start
            res.push({
                start: indexToStr(start!, INTERVAL),
                end: indexToStr(end, INTERVAL)
            })
        }
    }
    if (mode == Mode.find_end) {
        res.push({
            start: indexToStr(start!, INTERVAL),
            end: indexToStr(END, INTERVAL)
        })
    }

    if (isFullDay) {
        return [getFullDay(INTERVAL)]
    }

    return res

}

export function isFullDay(startEnd: StartEnd, interval: number) {
    const FullDay = getFullDay(interval)
    return isSameStartEnd(startEnd, FullDay)
}

export function isSameStartEnd(a: StartEnd, b: StartEnd) {
    return a.start == b.start && a.end == b.end
}

export function flattenSlots(options: Options): boolean[] {
    const INTERVAL = options.interval || DefaultInterval
    const START = strToIndex(FIRST_TIME, INTERVAL);
    const END = strToIndex(LAST_TIME, INTERVAL);
    const DEFAULT_STATE = (options.defaultState || "black") === "white"
    const PRIORITY = options.priority || "white"
    const FULL_DAY = getFullDay(INTERVAL)


    let slots: boolean[] = new Array(END - START)
    for (let i = START; i <= END; i++) {
        slots[i] = DEFAULT_STATE
    }

    if (PRIORITY === "white") {
        applySlots(false, options.blacklistSlots)
        applySlots(true, options.whitelistSlots)
    } else {
        applySlots(true, options.whitelistSlots)
        applySlots(false, options.blacklistSlots)
    }

    return slots

    function applySlots(state: boolean, startEnds?: StartEnd[]) {
        if (!startEnds) {
            return
        }
        for (let startEnd of startEnds) {
            if (isSameStartEnd(startEnd, FULL_DAY)) {
                slots.fill(state)
                return
            }
            let start = strToIndex(startEnd.start, INTERVAL)
            let end = strToIndex(startEnd.end, INTERVAL)
            for (let i = start; i < end; i++) {
                slots[i] = state
            }
        }
    }
}

let fullDays: StartEnd[] = [];

export function getFullDay(interval: number) {
    if (interval in fullDays) {
        return fullDays[interval]
    }
    let index = strToIndex(FIRST_TIME, interval)
    let str = indexToStr(index, interval)
    return fullDays[interval] = {
        start: str,
        end: str,
    }
}

export function d2(d: number) {
    if (d < 10) {
        return '0' + d
    }
    return '' + d
}

export function d3(d: number) {
    if (d < 10) {
        return '00' + d
    } else if (d < 100) {
        return '0' + d
    }
    return '' + d
}
