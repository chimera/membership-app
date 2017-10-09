const config = require('config')
const STRIPE_API_KEY = config.get('stripeAPIKey')
const stripe = require('stripe')(STRIPE_API_KEY)

class Customer {
  static async find(query) {
    const { data } = await stripe.customers.list({ limit: 50 })
    return data
  }

  static async get(id) {
    return await stripe.customers.retrieve(id)
  }

  static async update(id, fields) {
    return await stripe.customers.update(id, fields)
  }
}

module.exports = Customer
