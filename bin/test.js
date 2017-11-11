require('dotenv').config()

const Mocha = require('mocha')
const fs = require('fs')
const path = require('path')
const { expect, should } = require('chai')

global.expect = expect
global.should = should

const mocha = new Mocha()

const testDir = path.join(__dirname, '../test/integration')
console.log(testDir)

function walk (dir) {
  let results = []
  const list = fs.readdirSync(dir)
  list.forEach(function (file) {
    file = dir + '/' + file
    const stat = fs.statSync(file)
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file))
    } else results.push(file)
  })
  return results
}

// Add each .js file to the mocha instance
walk(testDir)
  .filter(file => {
    return file.substr(-3) === '.js'
  })
  .forEach(file => {
    mocha.addFile(file)
  })

// Run the tests.
mocha.run(failures => {
  process.on('exit', function () {
    process.exit(failures)
  })
})
