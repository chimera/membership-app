const moment = require('moment')

let CHECKINS = []

class Checkin {
  //---------------------------------------------------------------
  // Instance methods
  //---------------------------------------------------------------

  constructor(fields) {
    this.card = fields.card
    this.customerId = fields.customerId
    this.date = fields.date
    this.id = fields.id
  }

  get day() {
    return moment(this.date)
      .format('YYYY-MM-DD')
      .toString()
  }

  //---------------------------------------------------------------
  // Class methods
  //---------------------------------------------------------------

  static async create({ card, customerId, date }) {
    const checkin = new Checkin({
      id: CHECKINS.length + 1,
      card,
      customerId,
      date,
    })
    CHECKINS.push(checkin)
    return checkin
  }

  static async where() {
    return CHECKINS
  }

  static async destroyAll() {
    CHECKINS = []
  }

  static async forDay(date, card = null) {
    const start = startOfDay(date)
    const end = endOfDay(date)
    const matches = CHECKINS.filter(c => start <= c.date && c.date <= end)
    if (card) return matches.filter(c => c.card === card)
    return matches
  }

  static async forCardInRange(card, start, end) {
    start = typeof start === 'string' ? startOfDay(start) : start
    end = typeof end === 'string' ? endOfDay(end) : end
    return CHECKINS.filter(
      c => c.card === card && start <= c.date && c.date <= end
    )
  }

  /**
   * Return a total of unique "daily" checkins for the card
   * and date range. This considers any quantity of checkins
   * for a given day as one checkin. This way we can count
   * how many days a member has used within a given subscription
   * period.
   */
  static async dailyChekinCountForRange(card, start, end) {
    const checkins = await Checkin.forCardInRange(card, start, end)
    return checkins.reduce((all, checkin) => {
      if (!all.filter(c => c.day === checkin.day).length) {
        all.push(checkin)
      }
      return all
    }, []).length
  }
}

function startOfDay(date) {
  return moment(date, 'YYYY-MM-DD')
    .startOf('day')
    .valueOf()
}
function endOfDay(date) {
  return moment(date, 'YYYY-MM-DD')
    .endOf('day')
    .valueOf()
}

module.exports = Checkin
