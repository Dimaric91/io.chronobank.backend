const keystone = require('keystone')

const Wallet = keystone.list('Wallet')

class WalletService {
  async getWallets (req, res, owner, currency) {
    // ???
    let findObj = {}
    if (owner) {
      let user = await keystone.list('User').model.findById(owner).exec()
      findObj.owner = user
    }
    if (currency) {
      findObj.currency = currency
    }
    Wallet.model
      .find(findObj)
      .select('_id owner amount currency')
      .sort('currency')
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
