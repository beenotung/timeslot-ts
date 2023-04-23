# timeslot-ts

Whitelist and blacklist time slots for booking/scheduling system

[![npm Package Version](https://img.shields.io/npm/v/timeslot-ts.svg)](https://www.npmjs.com/package/timeslot-ts)

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

More usage examples can refer to [core.spec.ts](./core.spec.ts)

## License

This project is licensed with [BSD-2-Clause](./LICENSE)

This is free, libre, and open-source software. It comes down to four essential freedoms [[ref]](https://seirdy.one/2021/01/27/whatsapp-and-the-domestication-of-users.html#fnref:2):

- The freedom to run the program as you wish, for any purpose
- The freedom to study how the program works, and change it so it does your computing as you wish
- The freedom to redistribute copies so you can help others
- The freedom to distribute copies of your modified versions to others
