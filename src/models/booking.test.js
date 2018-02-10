const Booking = require('./booking')
const moment = require('moment')

describe('Booking model', () => {
  describe('instance methods', () => {
    describe('construction', () => {
      test('should return the expected properties', () => {
        const start = moment('1 Jan 2018 10:00 PST').valueOf()
        const booking = new Booking({
          customerId: 1,
          durationMinutes: 60,
          resourceId: 1,
          start,
        })
        expect(booking).toEqual({
          customerId: 1,
          durationMinutes: 60,
          resourceId: 1,
          start,
        })
      })

      describe('.end', () => {
        test('should return proper end timestamp', () => {
          const start = moment('1 Jan 2018 10:00 PST')
          const end = moment(start)
            .add(1, 'hour')
            .valueOf()
          const booking = new Booking({ durationMinutes: 60, start })
          expect(booking.end).toEqual(end)
        })
      })
    })
  })
  describe('class methods', () => {})
})
