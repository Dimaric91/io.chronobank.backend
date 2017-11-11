const { createApp } = require('../../lib/keystone.js')
const assert = require('assert')
const axios = require('axios')
const app = createApp({ headless: true, logger: null })
const backend = axios.create({
  baseURL: 'http://localhost:'+ app.get('port') + '/api/v1'
})

function checkErrorStatusAndMessage (response, expectStatus, expectMessage) {
  const { status, data } = response
  expect(status, 'status must be ' + expectStatus).to.equal(expectStatus)
  expect(data.success, 'result must be fail').to.be.false
  expect(data.message, 'wrong message').to.equal(expectMessage)
}

async function getToken (email, password) {
  let token
  await backend.post('signin', {
    email: email,
    password: password
  }).then(function (response) {
    token = response.data.token
  }).catch(function (error) {
    // eslint-disable-next-line no-console
    console.log(error.message)
  })

  assert(token, 'token not specified')
  return token
}

describe('Get Users list tests', () => {
  before(app.start.bind(app))
  after(app.stop.bind(app))

  it('Get Users list: success request', async () => {
    const token = await getToken('admin@example.com', 'admin')

    const response = await backend.get('users', {
      headers: {
        'x-access-token': token
      }
    })

    {
      const { status, data } = response
      expect(status, 'status must be 200').to.equal(200)
      expect(data.success, 'result must be success').to.be.true
    }

  })

  it('Get Users list: no token', async () => {
    await backend.get('users')
    .catch(function (error) {
      checkErrorStatusAndMessage(error.response, 403, 'No token provided.')
    })
  })

  it('Get Users list: no privileges', async () => {
    const token = await getToken('test@test.local', '123')

    await backend.get('users', {
      headers: {
        'x-access-token': token
      }
    }).catch(function (error) {
      checkErrorStatusAndMessage(error.response, 403, 'No privileges')
    })
  })

  it('Get Users list: corrupt token', async () => {
    const token = await getToken('test@test.local', '123')

    await backend.get('users', {
      headers: {
        'x-access-token': token + '123'
      }
    }).catch(function (error) {
      checkErrorStatusAndMessage(error.response, 403, 'Failed to verify token.')
    })
  })

})
