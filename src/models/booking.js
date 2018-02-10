const moment = require('moment')

class Booking {
  //---------------------------------------------------------------
  // Instance methods
  //---------------------------------------------------------------

  constructor(fields) {
    this.customerId = fields.customerId
    this.durationMinutes = fields.durationMinutes
    this.resourceId = fields.resourceId
    this.start = moment(fields.start).valueOf()
  }

  get end() {
    return moment(this.start)
      .add(this.durationMinutes, 'minutes')
      .valueOf()
  }

  //---------------------------------------------------------------
  // Class methods
  //---------------------------------------------------------------
}

module.exports = Booking
