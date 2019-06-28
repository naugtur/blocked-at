'use strict'
const blocked = require('..')
const http = require('./cases/http')

 blocked((time, stack, {type, resource}) => {
   // Node 10.x
   if (type === 'HTTPPARSER') {
    console.log(type, resource.incoming.url)
    return 
   }
   // Node 12.x
   if (type === 'HTTPINCOMINGMESSAGE') {
    console.log(type, resource.socket.parser.incoming.url)
    return
   }
}, {maxResourcesSize: 100})

 setImmediate(http)