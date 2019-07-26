'use strict'
const blocked = require('../')
const slowfunc = require('./slowfunc')

setTimeout(slowfunc, 10) // will not run init in blocked, but all other hooks get triggered

blocked((time, stack) => {
  console.log(time, stack)
}, { debug: true, trimFalsePositives: true })

setImmediate(slowfunc)
