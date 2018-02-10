const Checkin = require('./checkin')
const Customer = require('./customer')
const moment = require('moment')
const Subscription = require('./subscription')

describe('Customer model', () => {
  describe('instance methods', () => {
    describe('construction', () => {
      test('assigns expected fields', () => {
        const customer = new Customer({
          email: 'a@b.com',
          id: '1234',
          interests: ['stuff', 'things'],
          name: 'John',
          phone: '1234',
          rfids: ['999'],
          stripeData: {},
        })
        expect(customer).toEqual({
          email: 'a@b.com',
          id: '1234',
          interests: ['stuff', 'things'],
          name: 'John',
          phone: '1234',
          rfids: ['999'],
          stripeData: {},
        })
      })
    })

    describe('.isDelinquent', () => {
      test('should return true if delinquent', () => {
        const customer = new Customer({
          email: 'a@b.com',
          name: 'John',
          stripeData: {
            delinquent: true,
          },
        })
        expect(customer.isDelinquent).toBe(true)
      })

      test('should return false if not delinquent', () => {
        const customer = new Customer({
          email: 'a@b.com',
          name: 'John',
          stripeData: {
            delinquent: false,
          },
        })
        expect(customer.isDelinquent).toBe(false)
      })
    })

    describe('.isStaff', () => {
      test('returns true if metadata field is set', () => {
        const customer = new Customer({
          email: 'a@b.com',
          name: 'John',
          stripeData: {
            metadata: {
              staff: true,
            },
          },
        })
        expect(customer.isStaff).toBe(true)
      })
    })

    describe('.isActive', () => {
      test('returns false if delinquent', () => {
        const customer = new Customer({
          email: 'a@b.com',
          name: 'John',
          stripeData: {
            delinquent: true,
          },
        })
        expect(customer.isActive).toBe(false)
      })

      test('returns true if staff', () => {
        const customer = new Customer({
          email: 'a@b.com',
          name: 'John',
          stripeData: {
            metadata: {
              staff: true,
            },
          },
        })
        expect(customer.isActive).toBe(true)
      })

      test('returns false if no active subscriptions', () => {
        const customer = new Customer({
          email: 'a@b.com',
          name: 'John',
          stripeData: {
            subscriptions: {
              data: [
                {
                  id: '1234',
                  metadata: {
                    membership: true,
                  },
                  status: 'past_due',
                },
                {
                  id: '1234',
                  metadata: {
                    membership: true,
                  },
                  status: 'cancelled',
                },
              ],
            },
          },
        })
        expect(customer.isActive).toBe(false)
      })

      test('returns true if they have an active subscription', () => {
        const customer = new Customer({
          email: 'a@b.com',
          name: 'John',
          stripeData: {
            subscriptions: {
              data: [
                {
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
                },
                {
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
                  status: 'inactive',
                },
              ],
            },
          },
        })
        expect(customer.isActive).toBe(true)
      })
    })

    describe('.isUnlimited', () => {
      test('should return true if on an "unlimited" plan', () => {
        const customer = new Customer({
          email: 'a@b.com',
          name: 'John',
          stripeData: {
            subscriptions: {
              data: [
                {
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
                },
              ],
            },
          },
        })
        expect(customer.isUnlimited).toBe(true)
      })

      test('should return false if not on an "unlimited" plan', () => {
        const customer = new Customer({
          email: 'a@b.com',
          name: 'John',
          stripeData: {
            subscriptions: {
              data: [
                {
                  id: '1234',
                  items: {
                    data: [
                      {
                        plan: {
                          metadata: {
                            membership: true,
                          },
                        },
                      },
                    ],
                  },
                  status: 'active',
                },
              ],
            },
          },
        })
        expect(customer.isUnlimited).toBe(false)
      })
    })

    describe('.subscriptions', () => {
      test('should return an empty array if no subscriptions found', () => {
        const customer = new Customer({
          email: 'a@b.com',
          name: 'John',
          stripeData: {
            // delinquent: true,
          },
        })
        expect(customer.subscriptions).toEqual([])
      })

      test('should return an array of subscriptions if found', () => {
        const subscription = {
          id: '1234',
          status: 'active',
          items: {
            data: [
              {
                id: '345',
              },
            ],
          },
        }
        const customer = new Customer({
          email: 'a@b.com',
          name: 'John',
          stripeData: {
            subscriptions: {
              data: [subscription],
            },
          },
        })
        expect(customer.subscriptions).toEqual([
          new Subscription({
            id: '1234',
            isActive: true,
            isMembership: false,
            isUnlimited: false,
            status: 'active',
          }),
        ])
      })
    })

    describe('.memberships', () => {
      test('should return an empty array if no membership-type subscriptions were found', () => {
        const subscription = {
          id: '1234',
          status: 'active',
          items: {
            data: [
              {
                id: '345',
              },
            ],
          },
        }
        const customer = new Customer({
          email: 'a@b.com',
          name: 'John',
          stripeData: {
            subscriptions: {
              data: [subscription],
            },
          },
        })
        expect(customer.memberships).toEqual([])
      })

      test('should return membership-type subscriptions if found', () => {
        const membership = {
          id: '1234',
          status: 'active',
          items: {
            data: [
              {
                id: '345',
                plan: {
                  metadata: {
                    membership: true,
                  },
                },
              },
            ],
          },
        }
        const other = {
          id: '66677',
          items: {
            data: [
              {
                id: '678',
              },
            ],
          },
        }
        const customer = new Customer({
          email: 'a@b.com',
          name: 'John',
          stripeData: {
            subscriptions: {
              data: [membership, other],
            },
          },
        })
        expect(customer.memberships).toEqual([
          new Subscription({
            id: '1234',
            isActive: true,
            isMembership: true,
            isUnlimited: false,
            status: 'active',
          }),
        ])
      })
    })

    describe('.checkins', () => {
      test('should return an empty array if no checkins', async () => {
        const customer = new Customer({
          email: 'a@b.com',
          name: 'John',
        })
        expect(await customer.checkins()).toEqual([])
      })

      test.skip('should return a list of checkins if found', async () => {
        const checkin = await Checkin.create({
          card: '999',
          date: 1516336777898,
        })
        const customer = new Customer({
          email: 'a@b.com',
          name: 'John',
        })
        expect(await customer.checkins()).toEqual([checkin])
      })
    })

    describe.skip('.validPassword', () => {})

    describe.skip('.firstName', () => {})
  })

  describe('class methods', () => {
    beforeEach(async () => {
      await Customer.destroyAll()
    })

    describe('.where', () => {
      test('should return all customers if no query provided', async () => {
        const customer = await Customer.create({})
        expect(await Customer.where()).toEqual([customer])
      })
    })

    describe('.create', () => {
      test('should add customer to list of customers', async () => {
        const customer = await Customer.create({})
        expect(await Customer.where()).toEqual([customer])
      })
    })

    describe('.fromStripe', () => {
      test('assigns stripe fields to model and creates customer', async () => {
        const data = {
          id: '1234',
          description: 'Fake Guy',
          email: 'a@b.com',
          metadata: {
            interests: 'stuff,things',
            phone: '999',
            rfids: '1234,7890',
          },
        }
        const customer = await Customer.fromStripe(data)
        expect(customer).toEqual({
          email: 'a@b.com',
          id: '1234',
          interests: ['stuff', 'things'],
          name: 'Fake Guy',
          phone: '999',
          rfids: ['1234', '7890'],
          stripeData: data,
        })
        expect(await Customer.where()).toEqual([customer])
      })
    })

    describe('.withActiveDayPassSubscriptions', () => {
      test('should return a list of customers who have active, non-staff, non-unlimited "membership" type plans', async () => {
        const customerA = await Customer.fromStripe({
          subscriptions: {
            data: [
              {
                id: '1234',
                items: {
                  data: [
                    {
                      plan: {
                        metadata: {
                          membership: true,
                        },
                      },
                    },
                  ],
                },
                status: 'active',
              },
            ],
          },
        })
        await Customer.fromStripe({
          subscriptions: {
            data: [
              {
                id: '333',
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
              },
            ],
          },
        })
        await Customer.fromStripe({
          metadata: { staff: true },
          subscriptions: {
            data: [
              {
                id: '999',
                items: {
                  data: [
                    {
                      plan: {
                        metadata: {
                          membership: true,
                        },
                      },
                    },
                  ],
                },
                status: 'active',
              },
            ],
          },
        })
        const subs = await Customer.withActiveDayPassSubscriptions()
        expect(subs).toEqual([customerA])
      })
    })

    describe('.withOverages', () => {
      test('should return an empty list if no customers over their usage for the billing period', async () => {
        const customerA = new Customer({})
        const customerB = new Customer({})
        const customerC = new Customer({})
        expect(await Customer.withOverages()).toEqual([])
      })

      test('should return a list of customers who have gone over their alloted usage for the billing period', async () => {
        // Subscription range
        const start = '2018-01-01'
        const end = '2018-02-01'

        // This member should be "over" their usage
        const card = '555'
        const customerA = await Customer.create({
          rfids: [card],
          stripeData: {
            subscriptions: {
              data: [
                {
                  id: '1234',
                  current_period_start: moment(start).valueOf(),
                  current_period_end: moment(end).valueOf(),
                  status: 'active',
                  items: {
                    data: [
                      {
                        id: '345',
                        plan: {
                          metadata: {
                            membership: true,
                            days: 2,
                          },
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        })
        await Checkin.create({ date: moment('2018-01-01').valueOf(), card })
        await Checkin.create({ date: moment('2018-01-03').valueOf(), card })
        await Checkin.create({ date: moment('2018-01-12').valueOf(), card })
        await Checkin.create({ date: moment('2018-02-01').valueOf(), card })
        await Checkin.create({ date: moment('2018-03-01').valueOf(), card })

        // This member should be "under" their usage
        const other = 'underlimit'
        await Customer.create({
          rfids: [other],
          stripeData: {
            subscriptions: {
              data: [
                {
                  id: '1234',
                  current_period_start: moment(start).valueOf(),
                  current_period_end: moment(end).valueOf(),
                  status: 'active',
                  items: {
                    data: [
                      {
                        id: '345',
                        plan: {
                          metadata: {
                            membership: true,
                            days: 8,
                          },
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        })
        await Checkin.create({ date: moment('2018-01-01').valueOf(), other })
        await Checkin.create({ date: moment('2018-01-03').valueOf(), other })

        expect(await Customer.withOverages()).toEqual([customerA])
      })
    })

    describe.skip('.findByEmail', () => {})
  })
})
