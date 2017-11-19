const SignInService = require('./signin/SignInService')
const UserService = require('./users/UserService')
const WalletService = require('./wallets/WalletService')
const CardService = require('./card/CardService')

module.exports = {
  SignInService: new SignInService(),
  UserService: new UserService(),
  WalletService: new WalletService(),
  CardService: new CardService()
}
