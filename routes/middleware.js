var _ = require('lodash')

const keystone = require('keystone')
const jwt = require('jsonwebtoken')

/**
	Initialises the standard view locals
*/
exports.initLocals = function (req, res, next) {
  res.locals.user = req.user
  next()
}


/**
	Fetches and clears the flashMessages before a view is rendered
*/
exports.flashMessages = function (req, res, next) {
  var flashMessages = {
    info: req.flash('info'),
    success: req.flash('success'),
    warning: req.flash('warning'),
    error: req.flash('error'),
  }
  res.locals.messages = _.some(flashMessages, function (msgs) { return msgs.length }) ? flashMessages : false
  next()
}


/**
	Prevents people from accessing protected pages when they're not signed in
 */
exports.requireUser = function (req, res, next) {
  if (!req.user) {
    req.flash('error', 'Please sign in to access this page.')
    res.redirect('/keystone/signin')
  } else {
    next()
  }
}

exports.checkToken = function (req, res, next) {
  var token = req.body.token || req.query.token || req.headers['x-access-token']
  
  if (token) {
    jwt.verify(token, keystone.get('secret'), function (err, decoded) {      
      if (err) {
        return res.send({ 
          success: false, 
          message: 'Failed to authenticate token.' })    
      } else if (!decoded.admin) {
        res.status(403).send({
          success: false,
          message: 'No privileges'
        })
      } else {
        req.decoded = decoded
        next()
      }
    })

  } else {
    return res.status(403).send({ 
      success: false, 
      message: 'No token provided.' 
    })

  }
}
