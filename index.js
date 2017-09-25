'use strict'
const asyncHooks = require('async_hooks')

const cache = new Map()// WeakMap maybe?

function cleanStack (stack) {
  const frames = stack.split('\n')
  let i = 0
  while (i < 5 && frames[0] && (i < 2 || frames[0].includes('(async_hooks.js'))) {
    frames.shift()
    i++
  }
  return frames
}

module.exports = (callback, options) => {
  options = options || {}
  options.threshold = (options.threshold || 20)
  Error.stackTraceLimit = Infinity
  const asyncHook = asyncHooks.createHook({ init, before, after })
  const dispatchCallback = (dt, stack) => setImmediate(callback, dt, stack)

  const debugLog = (title, message) => (options.debug && process._rawDebug(title, message))

  function init (asyncId, type, triggerAsyncId, resource) {
    const e = {}
    Error.captureStackTrace(e)
    debugLog('init', asyncId)
    cache.set(asyncId, {asyncId, type, stack: e.stack})
  }

  function before (asyncId) {
    debugLog('before', asyncId)
    const cached = cache.get(asyncId)
    if (!cached) { return }
    cached.t0 = hrtime()
  }

  function after (asyncId) {
    debugLog('after', asyncId)
    const cached = cache.get(asyncId)
    if (!cached) { return }
    const t1 = hrtime()
    const dt = (t1 - cached.t0) / 1000
      // process._rawDebug(dt > options.threshold, options.threshold, dt, cached)
    if (dt > options.threshold) {
      debugLog('stack', cached.stack)
      dispatchCallback(dt, cleanStack(cached.stack))
    }
  }

  asyncHook.enable()
  return {
    stop: asyncHook.disable
  }
}

function hrtime () {
  const t = process.hrtime()
  return t[0] * 1000000 + t[1] / 1000
}
