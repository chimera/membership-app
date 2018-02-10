class Plan {
  //---------------------------------------------------------------
  // Instance methods
  //---------------------------------------------------------------

  constructor(fields) {
    this.description = fields.description || ''
    this.interval = fields.interval || 'month'
    this.intervalCount = fields.intervalCount || 1
    this.isMembership = fields.isMembership || false
    this.isPublic = fields.isPublic || false
    this.name = fields.name
    this.priceCents = fields.priceCents
    this.stripeData = fields.stripeData || {}
  }

  get isPublicMembership() {
    return this.isPublic && this.isMembership
  }

  //---------------------------------------------------------------
  // Class methods
  //---------------------------------------------------------------

  static fromStripe(data) {
    return new Plan({
      description: data.metadata.description,
      name: data.name,
      interval: data.interval,
      intervalCount: data.interval_count,
      isMembership: data.metadata.membership,
      isPublic: data.metadata.public,
      priceCents: data.amount,
      stripeData: data,
    })
  }
}

module.exports = Plan
