import { compactSlots, isAvailable } from './core'
import { flattenSlots, MINUTE, StartEnd } from './helpers'
import { expect } from 'chai'

describe('compactSlots TestSuit', () => {
  compactSlots_test()
})

function compactSlots_test() {
  function test(
    name: string,
    startEnds: [string, string][],
    expected: [string, string][],
  ) {
    it(`should handle ${name}`, () => {
      let slots = startEnds.map(([start, end]) => ({ start, end }))
      let res = compactSlots({
        whitelistSlots: slots,
        interval: MINUTE,
      })
      let got = res.map(({ start, end }) => [start, end])
      expect(got).to.deep.equals(expected)
      if (JSON.stringify(got) !== JSON.stringify(expected)) {
        console.log('failed', {
          name,
          expected,
          got,
          startEnds,
        })
      }
    })
  }

  test('single-slot', [['05:00', '08:30']], [['05:00', '08:30']])
  test(
    'multi-slot',
    [
      ['05:00', '08:30'],
      ['10:00', '14:30'],
    ],
    [
      ['05:00', '08:30'],
      ['10:00', '14:30'],
    ],
  )
  test(
    'merge',
    [
      ['08:00', '08:30'],
      ['03:00', '10:30'],
    ],
    [['03:00', '10:30']],
  )
  test('fullday', [['00:00', '00:00']], [['00:00', '00:00']])
  test(
    'merged fullday',
    [
      ['00:00', '03:00'],
      ['03:00', '10:30'],
      ['10:30', '21:30'],
      ['21:30', '23:30'],
      ['23:30', '24:00'],
    ],
    [['00:00', '24:00']],
  )
  test(
    'fullday with overlap',
    [
      ['00:00', '00:00'],
      ['03:00', '10:30'],
    ],
    [['00:00', '00:00']],
  )
}

describe('isAvailable', () => {
  isAvailable_test()
})

function isAvailable_test() {
  function test(
    name: string,
    availableSlots: StartEnd[],
    bookingSlot: StartEnd,
    expected: boolean,
  ) {
    it(`should ${expected ? 'accept' : 'reject'} ${name}`, () => {
      let slots = flattenSlots({ whitelistSlots: availableSlots })
      expect(isAvailable(slots, bookingSlot)).to.equals(expected)
    })
  }

  test('blank calendar', [], { start: '09:00', end: '10:00' }, false)
  test(
    'exact booking',
    [{ start: '09:00', end: '10:00' }],
    { start: '09:00', end: '10:00' },
    true,
  )
  test(
    'partly booking',
    [{ start: '08:00', end: '11:00' }],
    { start: '09:00', end: '10:00' },
    true,
  )
  test(
    'pre-over-booking',
    [{ start: '09:00', end: '10:00' }],
    { start: '08:00', end: '10:00' },
    false,
  )
  test(
    'post-over-booking',
    [{ start: '09:00', end: '11:00' }],
    { start: '08:00', end: '10:00' },
    false,
  )
  test(
    'both-sided over-booking',
    [{ start: '09:00', end: '10:00' }],
    { start: '08:00', end: '11:00' },
    false,
  )
}
