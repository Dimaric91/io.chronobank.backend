var keystone = require('keystone')
var Types = keystone.Field.Types

var Card = new keystone.List('Card')

Card.add({
  currency: { 
    type: Types.Select, 
    options: 'RUB, USD, EUR', 
    default: 'RUB',
    initial: true, 
    require: true, 
    index: true 
  },
  wallet: { 
    type: Types.Relationship, 
    ref: 'Wallet', 
    filters: { 
      currency: ':currency'
    }, 
    initial: true, 
    required: true, 
    index: true 
  },
  number: {
    type: Types.Number,
    initial: true, 
    required: true 
  },
  state: {
    type: Types.Select, 
    options: 'sent, activated, locked',
    default: 'sent'
  },
  address: {
    type: Types.Location,
    enableMapsAPI: true
  }
})

/**
 * Registration
 */
Card.defaultColumns = 'wallet, currency, number, state'

Card.register()
