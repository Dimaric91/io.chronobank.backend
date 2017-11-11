const SignInService = require('./signin/SignInService')
const UserService = require('./users/UserService')

module.exports = {
  SignInService: new SignInService(),
  UserService: new UserService()
}
