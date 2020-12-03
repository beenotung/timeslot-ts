# timeslot-ts

Whitelist and blacklist timeslots for booking/scheduling system
  
[![npm Package Version](https://img.shields.io/npm/v/timeslot-ts.svg?maxAge=2592000)](https://www.npmjs.com/package/timeslot-ts)

## Example
```typescript
import { flattenSlots, isAvailable, MINUTE } from 'timeslot-ts'

let interval = 30 * MINUTE

let slots = flattenSlots({
  whitelistSlots: [
    { start: '09:00', end: '10:30' },
    { start: '14:00', end: '16:30' },
  ],
  interval, // optional, default is one MINUTE
})

let canBook = isAvailable(slots, {
  start: '15:00',
  end: '15:30',
  interval, // optional, default is one MINUTE
})

console.log(canBook) // true
```
