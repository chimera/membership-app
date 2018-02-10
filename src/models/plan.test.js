const Plan = require('./plan')

describe('Plan model', () => {
  describe('instance methods', () => {
    describe('constructor', () => {
      test('should provided the expected properties', () => {
        const plan = new Plan({
          description: 'Cool!',
          name: 'Pro',
          interval: 'month',
          intervalCount: 1,
          isMembership: true,
          isPublic: true,
          priceCents: 4500,
          stripeData: {
            membership: true,
          },
        })
        expect(plan).toEqual({
          description: 'Cool!',
          name: 'Pro',
          interval: 'month',
          intervalCount: 1,
          isMembership: true,
          isPublic: true,
          priceCents: 4500,
          stripeData: {
            membership: true,
          },
        })
      })

      test('should set sane defaults if some values are missing', () => {
        const plan = new Plan({
          name: 'Pro',
          interval: 'month',
          intervalCount: 1,
          priceCents: 4500,
        })
        expect(plan).toEqual({
          description: '',
          name: 'Pro',
          interval: 'month',
          intervalCount: 1,
          isMembership: false,
          isPublic: false,
          priceCents: 4500,
          stripeData: {},
        })
      })
    })

    describe('.isPublicMembership', () => {
      test('should return true if is public and a membership', () => {
        const plan = new Plan({
          name: 'Pro',
          interval: 'month',
          intervalCount: 1,
          isMembership: true,
          isPublic: true,
          priceCents: 4500,
        })
        expect(plan.isPublicMembership).toBe(true)
      })

      test('should return false if not a public membership or public', () => {
        expect(
          new Plan({
            name: 'Pro',
            interval: 'month',
            intervalCount: 1,
            isMembership: false,
            isPublic: true,
            priceCents: 4500,
          }).isPublicMembership
        ).toBe(false)
        expect(
          new Plan({
            name: 'Pro',
            interval: 'month',
            intervalCount: 1,
            isMembership: true,
            isPublic: false,
            priceCents: 4500,
          }).isPublicMembership
        ).toBe(false)
      })
    })
  })

  describe('class methods', () => {
    describe('.fromStripe', () => {
      test('should assign the expected fields', () => {
        const data = {
          id: 'pro',
          amount: 4500,
          interval: 'month',
          interval_count: 1,
          metadata: {
            description: 'Hi!',
            membership: true,
            public: true,
          },
          name: 'Pro',
        }
        const plan = Plan.fromStripe(data)
        expect(plan).toEqual({
          description: 'Hi!',
          name: 'Pro',
          interval: 'month',
          intervalCount: 1,
          isMembership: true,
          isPublic: true,
          priceCents: 4500,
          stripeData: data,
        })
      })
    })
  })
})
