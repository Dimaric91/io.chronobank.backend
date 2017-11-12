const keystone = require('keystone')

const Wallet = keystone.list('Wallet')

class WalletService {
  getWallets (req, res, owner, currency) {
    Wallet.model
      .find()
      .where('owner', owner)
      // ????
      .where('currency', currency)
      .exec(function (err, wallets) {
        if (err) {
          console.log(err)
          res.status(404).send({
            success: false,
            message: "Error getting wallets"
          })
        } else {
          res.send({
            success: true,
            wallets: wallets
          })
        }
      })
  }
}

module.exports = WalletService
