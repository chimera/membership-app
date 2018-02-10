# Chimera Membership App

> Membership management for Chimera Arts & Makerspace built onStripe

## Setup

```bash
# Install nvm, then:
nvm install
nvm use

# Install dependencies
npm install

# Run the project in development:
npm start

# Or for production, run:
npm run serve
```

## Deploy

This application is hosted on Heroku and thus can be deployed with a simple `git push` to master which uses our `Procfile` which runs:

```bash
npm run serve
```

## Overview

### Customer Signup

* New Customer or Staff goes to a page to choose the plan they want
    * We only show Plans that are "public memberships"
* They input their basic info, agree to terms/member agreement, set a password and add a credit card
    * If they are not already logged in, we log them in under this new account (eg they are Staff adding a new member)

### Bookings & Resources

To allow members (eg `Customer`) to book equipment in the space we allow them to book a given tool (a `Resource`) for a date and time period.

A booking consists of:

1. The Customer associated with the booking
2. The Resource they are booking
3. The date/time they want to book the resource for
4. The time range they want to book for (15 minutes to 2 hours in 15 minute increments)

When creating a booking it will fail if the given resource is already booked within the given time range, with a helpful message.

We show a booking calendar to members and staff with a list of the booked equipment for any day.

In the initial version we won't set any limits to bookings.

### Checkins

* The Doorlock records Checkins when Customers come into the space
* Staff can see Checkins for a Customer
* Customer can see their own Checkins
* Staff can add/remove a Checkin for a Customer
* Staff can view a Checkin calendar that shows total # of checkins for a day
    * Clicking a day shows all Checkins for that day ordered latest at the top

### Subscriptions

* Staff can add a Customer to a Subscription
* Staff can change a Customer's Plan
* Staff can cancel a Customer's Subscription
* Customer can cancel their Subscriptions

### Customer List

* Staff can search for members by name, email
* Staff can filter by plan, interests, etc

### Customer Profile

* Customer can see all their Payments/Invoices, Subscriptions, Checkins, Bookings, etc
* Customer can change their email, name or interests
* Customer can change their credit card on file
* Staff can manage all customer details

### Emailing Customers

* Staff can send emails to a given member or a list of members
* Future: edit list of emails to send to
* Future: autocomplete of all Customer emails to add more

### Authentication

We use Stripe to store all our login information so the login process for a Customer looks like:

1. Look up the email the submitted in the login form in the Customer `customer.email` field.
    1. If no Customers with that email was found, show an error message
    2. If one Customer was found with that email, check to see if their password matches `customer.metadata.password` (which is encrypted)
        1. If it matches, log them in and set a cookie
        2. If it doesn't, let them know and prompt a password reset
    3. If multiple Customer's were found, use the most recent one. This isn't ideal but should work 95% of the time since most recent Customer is usually the "active" one anyways. We can always remove an old customer if this is an issue.

#### Forgot Password

If a Customer forgets their password, they input their email address in a form and we send a temporary reset link:

1. When creating the reset link, we store a `metadata.resetToken = "somerandomstring"`
2. When they click the link they go to `/reset-password?token=somerandomstring` where they are prompted to put in a new password
3. Once submitted, we:
    1. Set their new password to `metadata.password`
    2. Remove their `metadata.resetToken` field
    3. Log them in by setting a cookie

### Day Passes

We allow members to buy day passes or staff to add day passes to Customers. We do this by creating a Charge with the `metadata.daypass = true`.

It is redeemed by setting `metadata.redeemedAt = timestamp` where the `timestamp` is a Unix Epoch of when the day pass was redeemed.

Staff can optionally choose to not charge the Customer. We do this by setting the charge to `$0.00`. Staff can also unset `redeemedAt` to make the day pass available again.

We redeem a day pass when someone records a new checking for a day during their Subscription where they have already used up all their alloted days (`plan.metadata.days`), pseudo code:

```
if customer.subscription.daysUsed gte plan.days
  daypass.redeemedAt = unix epoch timestamp
```

### Staff Dashboard

* Add a new Customer
* View today's checkins
* View Customrs who are "over using"

### Doorlock

* Scans RFID cards
    * Lets member in if card belongs to an "active" Customer
    * Rejects if they don't exist
    * Show success/error message on a display by the door
    * Records a local checking on every success
* Fetches "active" Customers every 5-10 minutes, updates local list
* Pushes Checkins every 10-30 minutes, clears local Checkins if success

## Implementation Overview

We use Stripe for most of our data storage and payment processing with a few exceptions. Below is an overview of all the main components and how everything fits together.

### Plans

We only allow Customers to signup on Plans that have both `metadata.public = true` and `metadata.membership = true`.

#### Cancellations & Plan Changes

In the initial version, if a member wants to change a plan or cancel their membership, they will need to contact an admin to process it. We will show a link to send in a request that should go to a designated staff person to manage.

### "Active" customers

The concept of an "Active" customer is a bit tricky. The simplest way to describe an active customer is as follows:

1. They are not "delinquent" according to stripe (meaning their invoices are being paid)
2. They have a "membership-type" subscription that has the `status` of `active`. A "membership-type" subscription is identified by a Stripe Plan with the metadata of `membership = true`.

_Or..._

1. They are a "staff" member identified by the Stripe Customer having a metadata property of `staff = true`.

### Customer "Overages"

A customer is consider over their alloted usage when they have more daily checkins then their plan affords them. For example, if they have 8 days a month and they checkin 8 or more days for that billing period and have no available day passes, they are "over using" their membership.

We record checkins by storing them attached to the current Invoice for the Customer's Subscription in Stripe:

We store the checkins for a given day in the Invoice `metadata`:

```js
metadata['2018-01-12'] = '0000012345,1516336777898\n0000012345,1516336798893'
```

The `metadata` key is the day and the value is a list of `card,timestamp` values separated by newlines. The `card` is the full RFID card number and the `timestamp` is the Unix Epoch timestamp of when the card was swiped, which is recorded by the door reader. Some important notes:

* We count checkins but summing up all the `metadata` keys for the give Invoice
* Since Stripe only allows for 20 `metadata` keys, we will only ever be able to record checkins for 20 days a month, but this is an acceptable limitation since it is rare members will checkin more than 20 days a month on average. By doing this we don't need a separate database for checkins which is a big win in maintainability.
* We should do a regex match on the key to see if it matches `YYYY-MM-DD` pattern before considering it a "checkin"

The exceptions to this are:

1. The customer is a "staff" member, or
2. They are on an "unlimited" plan (which is indicated by the plan having the metadata of `unlimited = true`)

### Customer Information

A customer is a Stripe Customer. They may have a `metadata.password` which would allow them to login to our application and do the following:

1. Change or cancel their subscriptions
2. Book equipment
3. Change basic info (email, name) - coming someday...
4. Change their password

We store `metadata` on the customer object in Stripe so we can keep track of extra details we are interested in.

Metadata structure on Stripe:

```js
{
  phone: '7075551234',
  rfids: '123456789,0000123123',
  orientation: '2017-01-09,John Smith',
  signoffs: 'Laser Cutter,Bob Guy,2017-02-11\n3D Printer,Alex Something,2016-12-23',

  // Optional:
  staff: true,

  // Future fields?
  // emergencyContacts: 'John Smith,7075558898\nJane Doe,4152234433',
  // bio: 'Im a dude who likes stuff',
  // interests: '3D Printing,Laser Cutting,Jewelry', // split/trim
  // avatar: 'http://...url.com',
  // password: 'asdf32hgdi2hoidoisfnwoierh23',
}
```

## Credits

Copyright Dana Woodman &copy; 2018

## License

MIT
