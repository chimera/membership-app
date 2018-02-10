const moment = require('moment')
const Subscription = require('./subscription')

describe('Subscription model', () => {
  describe('instance methods', () => {
    describe('construction', () => {
      test('should return sane defaults', () => {
        const start = moment('2018-01-01').valueOf()
        const end = moment('2018-02-01').valueOf()
        const sub = new Subscription({ id: '100', start, end })
        expect(sub.id).toEqual('100')
        expect(sub.start).toEqual(start)
        expect(sub.end).toEqual(end)
        expect(sub.isActive).toEqual(false)
        expect(sub.isMembership).toEqual(false)
        expect(sub.isUnlimited).toEqual(false)
        expect(sub.status).toEqual(undefined)
      })

      test.skip('should include associated plan information', () => {})
    })
  })

  describe('class methods', () => {
    describe('.fromStripe', () => {
      test('should handle missing values well', () => {
        const start = moment('2018-01-01').valueOf()
        const end = moment('2018-02-01').valueOf()
        const sub = Subscription.fromStripe({
          id: '1234',
          current_period_start: moment(start).valueOf(),
          current_period_end: moment(end).valueOf(),
          items: {
            data: [{ plan: { metadata: { days: 5 } } }],
          },
          status: 'inactive',
        })
        expect(sub.id).toEqual('1234')
        expect(sub.start).toEqual(start)
        expect(sub.end).toEqual(end)
        expect(sub.days).toEqual(5)
        expect(sub.isMembership).toEqual(false)
        expect(sub.isUnlimited).toEqual(false)
        expect(sub.isActive).toEqual(false)
        expect(sub.status).toEqual('inactive')
      })

      test('should set proper fields', () => {
        const sub = Subscription.fromStripe({
          id: '1234',
          items: {
            data: [
              {
                plan: {
                  metadata: {
                    membership: true,
                    unlimited: true,
                  },
                },
              },
            ],
          },
          status: 'active',
        })
        expect(sub.id).toEqual('1234')
        expect(sub.isMembership).toEqual(true)
        expect(sub.isUnlimited).toEqual(true)
        expect(sub.isActive).toEqual(true)
        expect(sub.status).toEqual('active')
      })
    })
  })
})
