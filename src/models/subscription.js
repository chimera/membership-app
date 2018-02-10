const dot = require('dot-wild')

class Subscription {
  //---------------------------------------------------------------
  // Instance methods
  //---------------------------------------------------------------

  constructor(fields) {
    this.id = fields.id
    this.start = fields.start
    this.end = fields.end
    this.days = fields.days || null
    this.isActive = fields.isActive || false
    this.isMembership = fields.isMembership || false
    this.isUnlimited = fields.isUnlimited || false
    this.status = fields.status
  }

  //---------------------------------------------------------------
  // Class methods
  //---------------------------------------------------------------

  static fromStripe(data) {
    return new Subscription({
      id: data.id,
      start: data.current_period_start,
      end: data.current_period_end,
      days: dot.get(data, 'items.data[0].plan.metadata.days', null),
      isActive: data.status === 'active',
      isMembership: dot.get(
        data,
        'items.data[0].plan.metadata.membership',
        false
      ),
      isUnlimited: dot.get(
        data,
        'items.data[0].plan.metadata.unlimited',
        false
      ),
      status: data.status,
    })
  }
}

module.exports = Subscription
