const SignInService = require('./signin/SignInService')
const UserService = require('./users/UserService')
const WalletService = require('./wallets/WalletService')

module.exports = {
  SignInService: new SignInService(),
  UserService: new UserService(),
  WalletService: new WalletService()
}
