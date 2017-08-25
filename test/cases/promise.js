'use strict'
const slow = require('../slowfunc')

module.exports = function start () {
  Promise.resolve(1)
    .then(a => a++)
    .then(a => [a])
    .then(a => a.join(',').repeat(50).split(','))
    .then(a => {
      a[0] = 1
      slow()
      return a
    })
    .catch(console.error)
}
