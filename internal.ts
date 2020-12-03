import { d2, d3, MINUTE, SECOND } from './helpers'

/**
 * str format:
 *   hh:mm
 *   hh:mm:ss
 *   hh:mm:ss.sss
 * */
export function strToIndex(str: string, interval: number) {
  const [hh, mm, ss] = str.split(':')
  const hour = +hh || 0
  const minute = +mm || 0
  const second = +ss || 0
  const time = ((hour * 60 + minute) * 60 + second) * SECOND
  return Math.ceil(time / interval)
}

/**
 * output format:
 *   hh:mm
 *   hh:mm:ss
 *   hh:mm:ss.sss
 * */
export function indexToStr(index: number, interval: number) {
  let time = index * interval
  const ms = time % SECOND
  time = (time - ms) / SECOND
  const second = time % 60
  time = (time - second) / 60
  const minute = time % 60
  time = (time - minute) / 60
  const hour = time % 60
  if (interval < SECOND) {
    return d2(hour) + ':' + d2(minute) + ':' + d2(second) + '.' + d3(ms)
  } else if (interval < MINUTE) {
    return d2(hour) + ':' + d2(minute) + ':' + d2(second)
  }
  return d2(hour) + ':' + d2(minute)
}
