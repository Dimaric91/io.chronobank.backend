var keystone = require('keystone')
var Types = keystone.Field.Types

var Wallet = new keystone.List('Wallet')

Wallet.add({
  owner: { 
    type: Types.Relationship, 
    ref: 'User', 
    initial: true, 
    required: true, 
    index: true 
  },
  currency: { 
    type: Types.Select, 
    options: 'RUB, USD, EUR, BTC', 
    default: 'RUB',
    initial: true, 
    require: true, 
    index: true 
  },
  amount: { 
    type: Types.Number, 
    initial: true, 
    required: true 
  },
})

Wallet.relationship({ ref: 'Card', path: 'card', refPath: 'wallet' })

/**
 * Registration
 */
Wallet.defaultColumns = 'owner, amount, currency'
Wallet.register()
