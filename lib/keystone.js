var keystone = require('keystone')
const path = require('path')
const config = require('config')
var swaggerJSDoc = require('swagger-jsdoc')

// Initialise Keystone with your project's configuration.
// See http://keystonejs.com/guide/config for available options
// and documentation.
function createApp (additionalOptions) {
  var swaggerDefinition = {
    info: {
      title: 'Chronobank API',
      version: '1.0.0',
    },
    host: 'localhost:3000',
    basePath: '/',
  }

  var options = {
    swaggerDefinition: swaggerDefinition,
    apis: ['./lib/routes/index.js'],
  }

  var deployConfig = config.get('Keystone')

  keystone.init({
    'name': 'backend.chronobank.io',
    'brand': 'backend.chronobank.io',
    'cookie secret': deployConfig.cookieSecret,
    'cloudinary config': deployConfig.cloudinaryUrl,
    'mongo': deployConfig.mongoUrl || process.env.MONGO_URI,
    'port': deployConfig.port,

    'sass': 'public',
    'static': 'public',
    'favicon': 'public/favicon.ico',

    'module root': path.join(__dirname, '../'),
    'auto update': true,
    'session': true,
    'auth': true,
    'user model': 'User',
    'secret': 'testSecret',
    'swaggerSpec': swaggerJSDoc(options),
    ...additionalOptions
  })

  // Load your project's Models
  keystone.import('lib/models')

  // Setup common locals for your templates. The following are required for the
  // bundled templates and layouts. Any runtime locals (that should be set uniquely
  // for each request) should be added to ./routes/middleware.js
  keystone.set('locals', {
    _: require('lodash'),
    env: keystone.get('env'),
    utils: keystone.utils,
    editable: keystone.content.editable,
  })

  keystone.set('cors allow origin', true)

  // Load your project's Routes
  keystone.set('routes', require('./routes'))


  // Configure the navigation bar in Keystone's Admin UI
  keystone.set('nav', {
    users: 'users',
  })

  keystone.stop = function () {
    keystone.httpServer.close()
    keystone.mongoose.connection.close()
  }

  return keystone
}

exports = module.exports = {
  createApp
}
