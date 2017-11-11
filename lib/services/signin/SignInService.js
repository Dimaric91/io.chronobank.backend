const jwt = require('jsonwebtoken')
const keystone = require('keystone')

const User = keystone.list('User')

class SignInService {
  checkUserAccess (req, res) {
    User.model.findOne({
      email: req.body.email
    })
      .exec(function (err, user) {
        if (err || !user) {
          return res.status(400).send({
            success: false,
            message: 'User not found.'
          })
        }
        user._.password.compare(req.body.password, function (err, isMatch) {
          if (err || !isMatch) {
            res.status(400).send({
              success: false,
              message: 'Authentication failed. Wrong password.'
            })
          } else {
            var payload = {
              admin: user.isAdmin
            }
            var token = jwt.sign(payload, keystone.get('secret'), {
              expiresIn: 3600
            })

            res.send({
              success: true,
              token: token
            })
          }
        })
      })
  }
}

module.exports = SignInService
