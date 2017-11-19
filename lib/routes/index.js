const keystone = require('keystone')
const middleware = require('./middleware')
const { SignInService, UserService, WalletService, CardService } = require('../services')

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

  /**
   * @swagger
   * definition:
   *   Wallet:
   *     properties:
   *       _id:
   *         type: string
   *       owner:
   *         type: string
   *       amount:
   *         type: number
   *         format: double
   *       currency:
   *         type: string
   *   WalletsResponse:
   *     properties:
   *       success:
   *         type: boolean
   *       wallets:
   *         type: array
   *         items:
   *           $ref: '#/definitions/Wallet'
   * /api/v1/wallets:
   *   get:
   *     tags:
   *       - Users
   *     description: Returns all wallets
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: An array of Wallets
   *         schema: 
   *           $ref: '#/definitions/WalletsResponse'
   *       400:
   *         description: Error getting wallets
   *         schema:
   *           $ref: '#/definitions/ErrorResponse'
   *     parameters:
   *     - name: owner
   *       in: query
   *       description: ownerId of wallet
   *       required: false
   *       schema:
   *         type: string
   *     - name: currency
   *       in: query
   *       description: currency of wallet
   *       required: false
   *       schema:
   *         type: string
   */
  app.get('/api/v1/wallets', async (req, res) => {
    return WalletService.getWallets(req, res, req.query.owner, req.query.currency)
  })

  app.get('/api/v1/cards', async (req, res) => {
    return CardService.getCards(req, res)
  })

  app.post('/api/v1/cards', CardService.issueACard)

  app.put('/api/v1/cards/:cardId/lock', CardService.lockCard)
}
