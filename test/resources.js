'use strict'
const blocked = require('..')
const http = require('./cases/http')

 blocked((time, stack, {type, resource}) => {
  console.log(type, resource.incoming.url)
}, {maxResourcesSize: 100})

 setImmediate(http)