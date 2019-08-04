'use strict'
const assert = require('assert')
const blocked = require('..')
const http = require('./cases/http')

blocked((time, stack, details) => {
  assert(details && typeof details === 'object', 'Resource details object should be present')
  const { type, resource } = details
  assert(typeof type === 'string', 'Resource details should contain type string')
  assert(resource && typeof resource === 'object', 'Resource details should contain resource object')
  // Node 10.x
  if (type === 'HTTPPARSER') {
    console.log(type, resource.incoming.url)
    return
  }
  // Node 12.x
  if (type === 'HTTPINCOMINGMESSAGE') {
    console.log(type, resource.socket.parser.incoming.url)
  }
}, { resourcesCap: 100 })

setImmediate(http)
