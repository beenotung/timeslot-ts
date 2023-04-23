import { Slots } from './core'
import { indexToStr, strToIndex } from './internal'

export const SECOND = 1000
export const MINUTE = SECOND * 60
export const HOUR = MINUTE * 60
export const DefaultInterval = MINUTE
export const DefaultQuota = 1

export type StartEnd = {
  start: string
  end: string
  quota?: number
}
export type BW = 'black' | 'white'

const FIRST_TIME = '00:00'
const LAST_TIME = '24:00'

enum Mode {
  find_start,
  find_end,
}

export type Options = {
  whitelistSlots?: StartEnd[]
  blacklistSlots?: StartEnd[]
  interval?: number // unit in ms, default is 1 second
  defaultState?: BW // for unspecified slots, default is black
  priority?: BW // when the blacklist and whitelist conflict, which one to favour? default is white
}

export function mergeSlots(slots: Slots, options: Options): StartEnd[] {
  const INTERVAL = options.interval || DefaultInterval
  const START = strToIndex(FIRST_TIME, INTERVAL)
  const END = strToIndex(LAST_TIME, INTERVAL)

  const res: StartEnd[] = []
  let mode = Mode.find_start
  let start: number
  let end: number
  let isFullDay = true
  for (let i = START; i <= END; i++) {
    isFullDay = isFullDay && slots[i] > 0
    if (mode === Mode.find_start && slots[i]) {
      start = i
      mode = Mode.find_end
    } else if (mode === Mode.find_end && !slots[i]) {
      end = i
      mode = Mode.find_start
      res.push({
        start: indexToStr(start!, INTERVAL),
        end: indexToStr(end, INTERVAL),
      })
    }
  }
  if (mode === Mode.find_end) {
    res.push({
      start: indexToStr(start!, INTERVAL),
      end: indexToStr(END, INTERVAL),
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
  return a.start === b.start && a.end === b.end
}

enum SlotType {
  black = 1,
  white = 2,
}

export function flattenSlots(options: Options): Slots {
  const INTERVAL = options.interval || DefaultInterval
  const START = strToIndex(FIRST_TIME, INTERVAL)
  const END = strToIndex(LAST_TIME, INTERVAL)
  const DEFAULT_STATE = (options.defaultState || 'black') === 'white'
  const PRIORITY = options.priority || 'white'
  const FULL_DAY = getFullDay(INTERVAL)

  const slots: Slots = new Array(END - START)
  for (let i = START; i <= END; i++) {
    slots[i] = DEFAULT_STATE ? DefaultQuota : 0
  }

  if (PRIORITY === 'white') {
    applySlots(SlotType.black, options.blacklistSlots)
    applySlots(SlotType.white, options.whitelistSlots)
  } else {
    applySlots(SlotType.white, options.whitelistSlots)
    applySlots(SlotType.black, options.blacklistSlots)
  }

  return slots

  function applySlots(type: SlotType, startEnds?: StartEnd[]) {
    if (!startEnds) {
      return
    }
    for (const startEnd of startEnds) {
      const quota = startEnd.quota ?? DefaultQuota
      let start: number
      let end: number
      if (isSameStartEnd(startEnd, FULL_DAY)) {
        start = 0
        end = slots.length
      } else {
        start = strToIndex(startEnd.start, INTERVAL)
        end = strToIndex(startEnd.end, INTERVAL)
      }
      for (let i = start; i < end; i++) {
        let slot = slots[i] || 0
        if (type === SlotType.black) {
          slots[i] = slot - quota
        } else {
          slots[i] = slot + quota
        }
      }
    }
  }
}

const fullDays: StartEnd[] = []

export function getFullDay(interval: number) {
  if (interval in fullDays) {
    return fullDays[interval]
  }
  const index = strToIndex(FIRST_TIME, interval)
  const str = indexToStr(index, interval)
  return (fullDays[interval] = {
    start: str,
    end: str,
  })
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
