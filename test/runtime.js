'use strict'
const blocked = require('../')
const slowfunc = require('./slowfunc')

const assert = require('assert')

blocked((time, stack) => {
  console.log(time, stack)
},{debug:true})

setImmediate(slowfunc)
