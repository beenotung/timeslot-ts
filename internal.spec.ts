import { indexToStr, strToIndex } from './internal'
import { MINUTE, SECOND } from './helpers'
import { expect } from 'chai'

describe('strToIndex TestSuit', () => {
  strToIndex_test()
})

function strToIndex_test() {
  function test(str: string, interval: number, expected: number) {
    it(`should handle '${str}' at interval ${interval}`, () => {
      let got = strToIndex(str, interval)
      expect(got).to.equals(expected)
    })
  }

  test('08:30', MINUTE, 8 * 60 + 30)
}

describe('timeToStr TestSuit', () => {
  timeToStr_test()
})

function timeToStr_test() {
  function test(expected: string, interval: number) {
    it(`should handle at interval ${interval}`, () => {
      let time = strToIndex(str, interval)
      let res = indexToStr(time, interval)
      expect(res).to.equals(expected)
    })
  }

  let str = '19:12:13.123'
  test('19:12:13.123', 1)
  test('19:12:14', SECOND)
  test('19:12:30', SECOND * 30)
  test('19:12:15', SECOND * 15)
  test('19:13', MINUTE)
  test('19:15', MINUTE * 15)
  test('19:30', MINUTE * 30)
  test('20:00', MINUTE * 60)
}
