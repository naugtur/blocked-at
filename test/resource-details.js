'use strict'
const blocked = require('../')
const http = require('./cases/http')

blocked((time, stack, {type, resource}) => {
  console.log(time, stack, type, resource.incoming.url)
}, {exposeResourceDetails: true})

setImmediate(http)
