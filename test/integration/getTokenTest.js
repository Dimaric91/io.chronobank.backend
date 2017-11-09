const createApp = require('../../keystone.js')

const axios = require('axios')
const backend = axios.create({
  baseURL: 'http://localhost:3000/api/v1'
})

const app = createApp()

describe('Security Tests', () => {
  before(app.start.bind(app))
  after(app.stop.bind(app))

  it('First Token Test', async () => {
    const response = await backend.post('signin', {
      email: 'test@test.com',
      password: 'test'
    })

    const { status, data } = response
    expect(status, 'status should be 200').to.equal(200)
    expect(data.token != null, 'token should be specified').to.be.true
  })
})
