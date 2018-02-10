const dot = require('dot-wild')
const { flatten } = require('lodash')
const Checkin = require('./checkin')
const config = require('config')
const moment = require('moment')
const Fuse = require('fuse.js')
const STRIPE_API_KEY = config.get('stripeAPIKey')
const stripe = require('stripe')(STRIPE_API_KEY)
const Subscription = require('./subscription')

let customers = []

class Customer {
  //---------------------------------------------------------------
  // Instance methods
  //---------------------------------------------------------------

  constructor(fields) {
    this.email = fields.email
    this.id = fields.id
    this.interests = fields.interests || []
    this.name = fields.name
    this.phone = fields.phone || ''
    this.rfids = fields.rfids || []
    this.stripeData = fields.stripeData || {}
  }

  get firstName() {
    return this.name.split(' ')[0]
  }

  get isDelinquent() {
    return dot.get(this.stripeData, 'delinquent', false)
  }

  get isStaff() {
    return dot.get(this.stripeData, 'metadata.staff', false)
  }

  get isActive() {
    if (this.isStaff) return true
    if (this.isDelinquent) return false

    // Has at least one active membership available. They could
    // have multiple but one is all we need to consider them "active"
    const activeMemberships = this.memberships.filter(m => m.isActive)
    if (activeMemberships.length) return true

    return false
  }

  get isUnlimited() {
    const unlimited = this.memberships.filter(m => m.isUnlimited)
    if (unlimited.length) return true
    return false
  }

  get subscriptions() {
    const subs = dot.get(this.stripeData, 'subscriptions.data', [])
    return subs.map(sub => Subscription.fromStripe(sub))
  }

  get memberships() {
    return this.subscriptions.filter(s => s.isMembership)
  }

  async checkins() {
    return []
  }

  validPassword(password) {
    return password === dot.get(this.stripeData, 'metadata.password', '')
  }

  toJSON() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      firstName: this.firstName,
      phone: this.phone,
      isDelinquent: this.isDelinquent,
      isActive: this.isActive,
      isStaff: this.isStaff,
      isUnlimited: this.isUnlimited,
      rfids: this.rfids,
      memberships: this.memberships,
      subscriptions: this.subscriptions,
      interests: this.interests,
      // stripeData: this.stripeData,
    }
  }

  //---------------------------------------------------------------
  // Class methods
  //---------------------------------------------------------------

  static async create(fields) {
    const customer = new Customer(fields)
    customers.push(customer)
    return customer
  }

  static async destroyAll() {
    customers = []
  }

  static async where(query) {
    return customers
  }

  static async fromStripe(data) {
    const customer = new Customer({
      id: data.id,
      email: data.email,
      interests: dot.get(data, 'metadata.interests', '').split(','),
      name: data.description,
      phone: dot.get(data, 'metadata.phone', ''),
      rfids: dot.get(data, 'metadata.rfids', '').split(','),
      stripeData: data,
    })
    await Customer.create(customer)
    return customer
  }

  // fromCobot...?

  /**
   * A "day pass" subscription is one where the subscription is active,
   * the customer isn't a staff member and the plan isn't "unlimited".
   */
  static async withActiveDayPassSubscriptions() {
    return customers.filter(c => c.isActive && (!c.isStaff && !c.isUnlimited))
  }

  static async withOverages() {
    const over = []
    await Promise.all(
      customers.map(
        async customer =>
          await Promise.all(
            customer.memberships.map(async membership => {
              const count = await Checkin.dailyChekinCountForRange(
                customer.rfids[0],
                membership.start,
                membership.end
              )
              // TODO: what if multiple memership plans?
              const days = customer.memberships[0].days
              if (count >= days) {
                over.push(customer)
              }
            })
          )
      )
    )
    return flatten(over)
  }

  static async find(query) {
    let { data } = await stripe.customers.list({ limit: 100 })
    const { filter, search } = query

    if (query) {
      if (filter) {
        // Limit results to either members or non-members
        if (filter.member && filter.member !== 'either') {
          data = data.filter(customer => {
            const hasSubs = Boolean(customer.subscriptions.data.length)
            return filter.member === 'no' ? !hasSubs : hasSubs
          })
        }
      }

      if (search) {
        const options = {
          shouldSort: true,
          // threshold: 0.6,
          // location: 0,
          // distance: 100,
          // maxPatternLength: 32,
          minMatchCharLength: 1,
          keys: ['description', 'email'],
        }
        const fuse = new Fuse(data, options)
        data = fuse.search(search)
      }
    }

    return data
  }

  static async findByEmail(email) {
    const { data } = await stripe.customers.list({ email })
    if (!data || !data.length) return
    return Customer.fromStripe(data[0])
  }

  static async get(id) {
    const data = await stripe.customers.retrieve(id)
    return Customer.fromStripe(data)
  }

  static async update(id, fields) {
    return await stripe.customers.update(id, fields)
  }
}

module.exports = Customer
