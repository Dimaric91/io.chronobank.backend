const { createApp } = require('../../lib/keystone.js')
const mongoose = require('mongoose')
const async = require('async')
const assert = require('assert')
const axios = require('axios')
const app = createApp({ headless: true, logger: null, 'auto update': false })
const backend = axios.create({
  baseURL: 'http://localhost:' + app.get('port') + '/api/v1'
})

const users = [{
  email: 'test@test.local',
  password: '123',
  name: {
    first: 'Test',
    last: 'Testovich'
  },
  isAdmin: false
}, {
  email: 'admin@example.com',
  password: 'admin', 
  name: {
    first: 'Admin',
    last: 'User'
  },
  isAdmin: true
}]

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
    assert.fail(error.response.data.message)
  })

  assert(token, 'token not specified')
  return token
}

function createUser (model, done) {
  var User = app.list('User')
  var newUser = new User.model(model)
  newUser.save(function (err) {
    if (err) {  
      assert.fail(err)
    }
    done()
  })
}

function startServerAndCreateUsers (done) {
  app.start.bind(app)(function () {
    async.forEach(users, createUser, done)
  })
}

describe('Get Users list tests', () => {
  before(function (done) {
    var conn = mongoose.createConnection(app.get('mongo'), function (err) {
      conn.db.dropDatabase(function (err) {
        conn.close(function (err) {
          if (err) {
            done(err)
          } else {
            startServerAndCreateUsers(done)
          }
        })
      })
    })
  })
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
