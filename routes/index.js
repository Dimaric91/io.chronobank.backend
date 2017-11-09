const keystone = require('keystone')
const middleware = require('./middleware')
const restful = require('restful-keystone')(keystone, {
  root: '/api/v1',
})
const SignInService = require('./signin/SignInService')
const UserService = require('./users/UserService')

const Product = keystone.list('Product')
const Enquiry = keystone.list('Enquiry')
const Application = keystone.list('Application')
const Subscription = keystone.list('Subscription')
const Header = keystone.list('Header')
const Story = keystone.list('Story')
const FaqTopic = keystone.list('FaqTopic')
const FaqQuestion = keystone.list('FaqQuestion')

const FaqQuestionIndex = require('../index/FaqQuestionIndex')

// Common Middleware
keystone.pre('routes', middleware.initLocals)
keystone.pre('render', middleware.flashMessages)

// Setup Route Bindings
exports = module.exports = function (app) {

  // eslint-disable-next-line
  function errorHandler(err, req, res, next) { // Forced to have 4 arguments due to express convension about error handlers
    // eslint-disable-next-line
    console.log(err)
    res.status(500).send('error', { error: err })
  }

  app.use(errorHandler)

  app.all('/api/v1/*', keystone.middleware.cors)

  app.options('/api/v1/*', (req, res) => {
    res.send(200)
  })

  app.get('/', (req, res) => {
    res.redirect('/keystone/')
  })

  app.get('/api/v1/swagger.json', function (req, res) {
    res.setHeader('Content-Type', 'application/json')
    res.send(keystone.get('swaggerSpec'))
  })

  app.get('/api/v1/products/s/:slug', async (req, res) => {
    const product = await Product.model
      .findOne({
        'slug': req.params.slug
      })
      .populate('downloads')
      .populate('distros')
      .populate('features')
      .exec()
    res.send(product)
  })

  app.get('/api/v1/headers/s/:slug', async (req, res) => {
    const product = await Header.model
      .findOne({
        'slug': req.params.slug
      })
      .exec()
    res.send(product)
  })

  app.get('/api/v1/stories/s/:slug', async (req, res) => {
    const product = await Story.model
      .findOne({
        'slug': req.params.slug
      })
      .exec()
    res.send(product)
  })

  // eslint-disable-next-line
  app.get('/api/v1/faq-questions/search', async (req, res) => {
    const page = await FaqQuestion.model.search(req.query)
    res.send(page)
  })

  app.get('/api/v1/faq-questions/reindex', async (req, res) => {
    await FaqQuestionIndex.clearIndex()
    await FaqQuestionIndex.saveIndex(await FaqQuestion.model.find().exec())
    res.send('OK')
  })

  app.post('/api/v1/enquiries', async (req, res) => {
    const body = req.body
    const persisted = await Enquiry.model.create({
      name: body.name,
      email: body.email,
      phone: body.phone,
      enquiryType: 'message',
      message: body.message
    })
    res.send(persisted)
  })

  app.post('/api/v1/subscriptions', async (req, res) => {
    const body = req.body
    const persisted = await Subscription.model.create({
      email: body.email
    })
    res.send(persisted)
  })

  app.post('/api/v1/applications', async (req, res) => {
    const body = req.body
    const persisted = await Application.model.create({
      name: body.name,
      email: body.email,
      phone: body.phone,
      job: body.job,
      message: body.message
    })
    res.send(persisted)
  })

  app.get('/api/v1/faq-topics', async (req, res) => {
    const topics = await FaqTopic.model
      .find()
      .populate('questions')
      .exec()
    res.send(topics.map(topic => ({
      ...topic.toJSON(),
      questions: [...topic.questions]
    })))
  })

  /**
   * @swagger
   * definition:
   *   ErrorResponse:
   *     properties:
   *       success:
   *         type: boolean
   *       message:
   *         type: string
   *   Name:
   *     properties:
   *       first:
   *         type: string
   *       last:
   *         type: string
   *   User:
   *     properties:
   *       _id:
   *         type: string
   *       name:
   *         $ref: '#/definitions/Name'
   *       email:
   *         type: string
   *       isAdmin:
   *         type: boolean
   *   UsersResponse:
   *     properties:
   *       success:
   *         type: boolean
   *       users:
   *         type: array
   *         items:
   *           $ref: '#/definitions/User'
   * /api/v1/users:
   *   get:
   *     tags:
   *       - Users
   *     description: Returns all users
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: An array of Users
   *         schema: 
   *           $ref: '#/definitions/UsersResponse'
   *       403:
   *         description: Token error
   *         schema:
   *           $ref: '#/definitions/ErrorResponse'
   *       404:
   *         description: No users
   *         schema:
   *           $ref: '#/definitions/ErrorResponse'
   *     parameters:
   *     - name: x-access-token
   *       in: header
   *       description: authorization token
   *       required: false
   *       schema:
   *         type: string
   */
  app.get('/api/v1/users', middleware.checkToken, async (req, res) => {
    await UserService.getAllUsers(req, res)
  })

  /**
   * @swagger
   * /api/v1/signin:
   *   post:
   *     tags:
   *       - SignIn
   *     description: sign in for api
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Success response
   *         schema: 
   *           properties:
   *             success:
   *               type: string
   *             token:
   *               type: string
   *       400:
   *         description: Token error
   *         schema:
   *           $ref: '#/definitions/ErrorResponse'
   *     consumes: 
   *       - application/json
   *     parameters:
   *     - name: Auth object
   *       in: body
   *       description: Auth object
   *       required: true
   *       schema:
   *         type: object
   *         properties:
   *           email:
   *             type: string
   *           password:
   *             type: string
   */
  app.post('/api/v1/signin', async (req, res) => {
    return SignInService.checkUserAccess(req, res)
  })

  restful.expose({
    Article: {
      methods: ['list', 'retrieve']
    },
    Feature: {
      methods: ['list', 'retrieve']
    },
    Job: {
      methods: ['list', 'retrieve']
    },
    Header: {
      methods: ['list', 'retrieve'],
    },
    Iteration: {
      methods: ['list', 'retrieve'],
    },
    Member: {
      methods: ['list', 'retrieve']
    },
    Partner: {
      methods: ['list', 'retrieve']
    },
    Post: {
      methods: ['list', 'retrieve'],
      populate: ['categories', 'author'],
    },
    Product: {
      methods: ['list', 'retrieve'],
      populate: ['downloads', 'distros', 'features'],
    },
    Statistic: {
      methods: ['list', 'retrieve']
    },
    Story: {
      methods: ['list', 'retrieve'],
    },
    Testimonial: {
      methods: ['list', 'retrieve'],
    }
  })
    .start()
}
