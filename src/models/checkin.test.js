const Checkin = require('./checkin')
const moment = require('moment')

describe('Checkin model', () => {
  describe('instance methods', () => {
    describe('construction', () => {
      test('should provide expected properties', () => {
        const fields = {
          id: '1',
          card: '01234',
          customerId: '999',
          date: 151633514061,
        }
        const checkin = new Checkin(fields)
        expect(checkin).toEqual(fields)
      })
    })

    describe('.day', () => {
      test('should return string representation of day', () => {
        const date = '2018-01-01'
        const checkin = new Checkin({
          date: moment(date, 'YYYY-MM-DD').valueOf(),
        })
        expect(checkin.day).toBe(date)
      })
    })
  })

  describe('class methods', () => {
    beforeEach(async () => {
      await Checkin.destroyAll()
    })

    describe('.where', () => {
      test('should return all checkins if no params passed in', async () => {
        const checkin = await Checkin.create({
          id: 1,
          card: '123',
          customerId: '9',
          date: 1516336777898,
        })
        expect(await Checkin.where()).toEqual([
          {
            id: 1,
            card: '123',
            customerId: '9',
            date: 1516336777898,
          },
        ])
      })
    })

    describe('.destroyAll', () => {
      test('should remove all checkins', async () => {
        const checkin = await Checkin.create({
          id: 1,
          card: '123',
          customerId: '9',
          date: 1516336777898,
        })
        expect(await Checkin.where()).toEqual([
          {
            id: 1,
            card: '123',
            customerId: '9',
            date: 1516336777898,
          },
        ])
        await Checkin.destroyAll()
        expect(await Checkin.where()).toEqual([])
      })
    })

    describe('.create', () => {
      test('should return a checkin instance', async () => {
        const checkin = await Checkin.create({
          id: 1,
          card: '123',
          customerId: '9',
          date: 1516336777898,
        })
        expect(checkin).toBeInstanceOf(Checkin)
      })
    })

    describe('.forDay', () => {
      test('should return an empty array if no checkins found', async () => {
        await Checkin.create({ card: '123', date: 1481529600000 })
        expect(await Checkin.forDay('2018-01-05')).toEqual([])
      })

      test('should return all checkins for day', async () => {
        const checkin = await Checkin.create({
          card: '234',
          date: 1516336777898,
        })
        expect(await Checkin.forDay('2018-01-18')).toEqual([checkin])
      })

      test('should return all checkins for a given card if one is passed in', async () => {
        await Checkin.create({
          card: 'shouldnt match',
          date: 1516336777898,
        })
        const checkin = await Checkin.create({
          card: '444',
          date: 1516336777898,
        })
        expect(await Checkin.forDay('2018-01-18', '444')).toEqual([checkin])
      })
    })

    describe('.forCardInRange', () => {
      test('should return a list of checkins for a given time range', async () => {
        const card = '1234'
        const start = '2018-01-03'
        const end = '2018-01-10'
        const checkinA = await Checkin.create({
          card,
          date: moment('2018-01-02').valueOf(),
        })
        const checkinB = await Checkin.create({
          card,
          date: moment('2018-01-03').valueOf(),
        })
        const checkinC = await Checkin.create({
          card,
          date: moment('2018-01-06').valueOf(),
        })
        const checkinD = await Checkin.create({
          card,
          date: moment('2018-01-10').valueOf(),
        })
        const checkinE = await Checkin.create({
          card,
          date: moment('2018-01-11').valueOf(),
        })
        expect(await Checkin.forCardInRange(card, start, end)).toEqual([
          checkinB,
          checkinC,
          checkinD,
        ])
      })
    })

    describe('.dailyChekinCountForRange', () => {
      test('should return a count of days checked in for a given range', async () => {
        const card = '1234'
        const start = '2018-01-03'
        const end = '2018-01-10'
        await Checkin.create({ card, date: moment('2018-01-02').valueOf() })
        await Checkin.create({
          card,
          date: moment('2018-01-03 08:00').valueOf(),
        })
        await Checkin.create({
          card,
          date: moment('2018-01-03 12:00').valueOf(),
        })
        await Checkin.create({
          card,
          date: moment('2018-01-10 14:00').valueOf(),
        })
        await Checkin.create({
          card,
          date: moment('2018-01-10 22:00').valueOf(),
        })
        await Checkin.create({ card, date: moment('2018-01-11').valueOf() })
        expect(
          await Checkin.dailyChekinCountForRange(card, start, end)
        ).toEqual(2)
      })
    })
  })
})
