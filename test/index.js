'use strict'
const blocked = require('../')
const slowfunc = require('./slowfunc')
const case1 = require('./cases/http')
const case2 = require('./cases/recursive')
const case3 = require('./cases/example')
const case4 = require('./cases/promise')
const assert = require('assert')

let result = []
blocked((time, stack) => {
  result = result.concat(stack)
  console.log(time, stack)
})

setImmediate(slowfunc)
setImmediate(case1)
setImmediate(case2)
setImmediate(case3)
setImmediate(case4)

setTimeout(_ => {
  assert(!result.includes('Error'), 'Expected Error line not to be included')
  const stacks = result.join()
  assert(!stacks.includes('async_hooks.js'), 'Expected async_hooks.js traces not to be included')
  assert(stacks.includes('test/index.js:16'), 'Expected test/index.js:17 in stack trace')
  assert(stacks.includes('Server.connectionListener'), 'Expected Server.connectionListener in stack trace')
  assert(stacks.includes('cases/recursive.js:6'), 'Expected cases/recursive.js:6 in stack trace')
  assert(stacks.includes('cases/example.js:20'), 'Expected cases/example.js:20 in stack trace')
  assert(stacks.includes('cases/promise.js:9'), 'Expected cases/promise.js:10 in stack trace')
  console.log('OK')
}, 5000) // I know it's naive, but I don't want to add mess to test cases to know when they finish
