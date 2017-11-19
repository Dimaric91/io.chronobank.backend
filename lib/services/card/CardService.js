const keystone = require('keystone')

const Card = keystone.list('Card')

/**
 * @todo return unique value!!!!
 */
function getRandomNumber (len) {
  var text = ""
  for (var i = 0; i < len; i++) {
    text += (Math.floor(Math.random() * 1000)) % 10
  }
  return text 
}

async function getWallet (walletId) {
  return await keystone.list('Wallet').model.findById(walletId).exec()
}

function processError (res, err, message) {
  console.log(err)
  res.status(400).send({
    success: false,
    message: message
  })
}

class CardService {
  async getCards (req, res) {
    Card.model
      .find()
      .select('wallet currency number state')
      .sort('currency')
      .exec(function (err, cards) {
        if (err) {
          processError(res, err, "Error getting cards")
        } else {
          res.send({
            success: true,
            cards: cards
          })
        }
      })
  }
  async issueACard (req, res) {
    let wallet = await getWallet(req.body.walletId)
    let newCard = await Card.model.create({
      number: getRandomNumber(16),
      wallet: wallet._id,
      currency: wallet.currency
    })
    res.send(newCard)
  }
  async lockCard (req, res) {
    Card.model.findById(req.params.cardId).exec(function (err, card) {
      if (err) {
        processError(res, err, "Error locking card")
      } else {
        card.state = 'locked'
        card.save(function (err) {
          if (err) {
            processError(res, err, "Error locking card")
          } else {
            res.send({
              success: true,
              message: "Card " + card._id + " was locked"
            })
          }
        })
      }
    })
  }
}

module.exports = CardService
