import {
  DefaultInterval,
  DefaultQuota,
  flattenSlots,
  isFullDay,
  mergeSlots,
  Options,
  StartEnd,
} from './helpers'
import { strToIndex } from './internal'

export function compactSlots(options: Options): StartEnd[] {
  const slots = flattenSlots(options)
  return mergeSlots(slots, options)
}

export type Slot = number

export type Slots = Slot[]

export function isAvailable(
  slots: Slots,
  options: {
    interval?: number // unit in ms, default is 1 second
    start: string
    end: string
    quota?: number
  },
): boolean {
  const INTERVAL = options.interval || DefaultInterval
  let START = strToIndex(options.start, INTERVAL)
  let END = strToIndex(options.end, INTERVAL)
  const quota = options.quota || DefaultQuota

  if (isFullDay(options, INTERVAL)) {
    START = 0
    END = slots.length
  }

  for (let i = START; i < END; i++) {
    const availableSlot = slots[i] || 0
    if (availableSlot < quota) {
      return false
    }
  }
  return true
}
