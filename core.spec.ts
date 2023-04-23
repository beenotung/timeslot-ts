import { compactSlots, isAvailable } from './core'
import { flattenSlots, HOUR, MINUTE, StartEnd } from './helpers'
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

describe('quota TestSuit', () => {
  it('quota should default to 1', () => {
    let slots = flattenSlots({
      whitelistSlots: [{ start: '09:00', end: '10:00' }],
      interval: HOUR,
    })
    expect(slots[8]).to.equals(0)
    expect(slots[9]).to.equals(1)
    expect(slots[10]).to.equals(0)
  })
  it('quota should be customizable', () => {
    let slots = flattenSlots({
      whitelistSlots: [{ start: '09:00', end: '10:00', quota: 2 }],
      interval: HOUR,
    })
    expect(slots[8]).to.equals(0)
    expect(slots[9]).to.equals(2)
    expect(slots[10]).to.equals(0)
  })
  context('multiple booking sharing the same slot', () => {
    context('when having enough quota', () => {
      function test(title: string, quota: number | undefined) {
        it(title, () => {
          let slots = flattenSlots({
            whitelistSlots: [{ start: '09:00', end: '10:00', quota }],
            interval: MINUTE,
          })
          expect(isAvailable(slots, { start: '09:00', end: '10:00', quota })).to
            .be.true
        })
      }
      test('default quota', undefined)
      test('1 quota', 1)
      test('2 quota', 2)
    })
    context('when having not enough quota', () => {
      function test(
        title: string,
        having_quota: number | undefined,
        booking_quota: number | undefined,
      ) {
        it(title, () => {
          let slots = flattenSlots({
            whitelistSlots: [
              { start: '09:00', end: '10:00', quota: having_quota },
            ],
            interval: MINUTE,
          })
          expect(
            isAvailable(slots, {
              start: '09:00',
              end: '10:00',
              quota: booking_quota,
            }),
          ).to.be.false
        })
      }
      test('default quota', undefined, 2)
      test('1 quota', 1, 2)
      test('2 quota', 2, 3)
    })
  })
})
