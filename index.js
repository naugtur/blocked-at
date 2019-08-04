'use strict'
const asyncHooks = require('async_hooks')

const cache = new Map()// WeakMap maybe?
let resourcesCount = 0

const asyncHooksRegEx = /\((internal\/)?async_hooks\.js:/

function cleanStack (stack) {
  const frames = stack.split('\n')
  // this part is opinionated, but it's here to avoid confusing people with internals
  let i = frames.length - 1
  while (i && !asyncHooksRegEx.test(frames[i])) {
    i--
  }
  return frames.slice(i + 1, stack.length - 1)
}

module.exports = (callback, options) => {
  let continuityId
  options = options || {}
  options.threshold = (options.threshold || 20)
  options.resourcesCap = (options.resourcesCap || 0)
  Error.stackTraceLimit = Infinity
  const asyncHook = asyncHooks.createHook({ init, before, after, destroy })

  const debugLog = (title, message) => (options.debug && process._rawDebug(title, message))

  function init (asyncId, type, triggerAsyncId, resource) {
    const e = {}
    Error.captureStackTrace(e)
    debugLog('init', asyncId)
    const cached = { asyncId, type, stack: e.stack }
    if (options.resourcesCap > resourcesCount) {
      cached.resource = resource
      resourcesCount += 1
    }
    cache.set(asyncId, cached)
  }

  function before (asyncId) {
    debugLog('before', asyncId)
    if (options.trimFalsePositives) {
      continuityId = asyncId
    }
    const cached = cache.get(asyncId)
    if (!cached) { return }
    cached.t0 = hrtime()
  }

  function after (asyncId) {
    debugLog('after', asyncId)
    if (options.trimFalsePositives && continuityId !== asyncId) {
      // drop for interuptions
      return
    }
    const cached = cache.get(asyncId)
    if (!cached) { return }
    const t1 = hrtime()
    const dt = (t1 - cached.t0) / 1000
    // process._rawDebug(dt > options.threshold, options.threshold, dt, cached)
    if (dt > options.threshold) {
      debugLog('stack', cached.stack)
      callback(dt, cleanStack(cached.stack), {
        type: cached.type,
        resource: cached.resource
      })
    }
  }

  function destroy (asyncId) {
    const cached = cache.get(asyncId)
    if (!cached) { return }
    if (cached.resource) {
      resourcesCount -= 1
    }
    cache.delete(asyncId)
  }

  asyncHook.enable()
  return {
    stop: () => {
      asyncHook.disable()
    }
  }
}

function hrtime () {
  const t = process.hrtime()
  return t[0] * 1000000 + t[1] / 1000
}
