// Simulate config options from your production environment by
// customising the .env file in your project's root folder.
require('dotenv').config()

// Require keystone
var keystone = require('keystone')
var swaggerJSDoc = require('swagger-jsdoc')

// Initialise Keystone with your project's configuration.
// See http://keystonejs.com/guide/config for available options
// and documentation.

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
  apis: ['./routes/index.js'],
}

keystone.init({
  'name': 'backend.chronobank.io',
  'brand': 'backend.chronobank.io',
  'mongo': process.env.MONGO_URI || "mongodb://localhost:27017/backend-chronobank-io",

  'sass': 'public',
  'static': 'public',
  'favicon': 'public/favicon.ico',

  'auto update': true,
  'session': true,
  'auth': true,
  'user model': 'User',
  'secret': 'testSecret',
  'swaggerSpec': swaggerJSDoc(options)
})

// Load your project's Models
keystone.import('models')

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
  general: ['stories', 'features', 'statistics', 'headers', 'iterations'],
  products: ['products', 'product-downloads', 'product-distros', 'product-features'],
  faq: ['faq-topics', 'faq-questions'],
  media: ['posts', 'post-categories', 'articles', 'galleries'],
  references: ['testimonials', 'partners', 'members', 'jobs'],
  // galleries: 'galleries',
  enquiries: ['enquiries', 'applications', 'subscriptions'],
  users: 'users',
})

// Start Keystone to connect to your database and initialise the web server

keystone.start()
