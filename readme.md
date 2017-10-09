# Chimera Membership App

> Membership management for Chimera Arts & Makerspace using Stripe

This application is a simple Node.js application that wraps the Stripe API to allow managing Stripe customers and adding extra `metadata` to their account to store information like interests, signoffs, checkoffs, etc.

- **List all members**
  - [x] Show list of customers with basic, subscriptions
  - [ ] Searching by `name`, `email`
  - [ ] Bulk email result from search/filter
  - [ ] Fetch all customers (pagination? progressive load?)
  - [ ] Filter by `plan`, `signoff`, `interest`, etc...
  - [ ] Sorting columns (later...)
- **Member detail**
  - [x] Contact info
  - [x] Subscriptions
  - [x] RFIDs
  - [x] Interests
  - [x] Signoffs
  - [ ] Address
  - [ ] Emergency contacts
  - [ ] Active Credit Card (type, last 4, exp date)
  - [ ] Transactions (later...)
  - [ ] Invoices (later...)
- **Emailing members** (individual or bulk)
  - [x] Email button on detail page
  - [x] Email all button on list page
  - [ ] Hook up email functionality to provider
  - [ ] Allow email a subset of users
  - [ ] Shows form with list of customers with ability to add/remove more if needed
  - [ ] Search all customers with autocomplete of emails (later...)
- **Checkins**
  - [ ] API to add checkins (from Particle cloud...)
  - [ ] List checkins on customer page
  - [ ] Store checkins in `metadata` for current "invoice" for billing period (via `period_end`?)
  - [ ] Allow manually adding/removing checkins (later...)


## Setup

```bash
# Install nvm, then:
nvm install
nvm use

# Install yarn
npm i -g yarn

# Install dependencies
yarn install

# Run the project:
yarn start # or "yarn watch" to watch for changes
```


## Stripe Integration Details

We store `metadata` on the customer object in Stripe so we can keep track of extra details we are interested in.
  
Metadata structure on Stripe:
```js
{
  phone: '7075551234',
  rfid: '123456789,0000123123',
  orientation: '2017-01-09,John Smith',
  signoffs: 'Laser Cutter,Bob Guy,2017-02-11\n3D Printer,Alex Something,2016-12-23',

  // Future fields?
  // emergencyContacts: 'John Smith,7075558898\nJane Doe,4152234433',
  // bio: 'Im a dude who likes stuff',
  // interests: '3D Printing,Laser Cutting,Jewelry', // split/trim
  // avatar: 'http://...url.com',
  // password: 'asdf32hgdi2hoidoisfnwoierh23',
}
```