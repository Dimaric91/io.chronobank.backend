const keystone = require('keystone')

const User = keystone.list('User')

class UserService {
  getAllUsers (req, res) {
    User.model
      .find()
      .select('_id name email isAdmin')
      .exec(function (err, users) {
        if (err || !users) {
          res.status(404).send({
            success: false,
            message: "No users"
          })
        } else {
          res.send({
            success: true,
            users: users
          })
        }
      })
  }
}

module.exports = UserService
