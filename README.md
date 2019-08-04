# blocked-at [![Build Status](https://travis-ci.org/naugtur/blocked-at.svg?branch=master)](https://travis-ci.org/naugtur/blocked-at) [![Greenkeeper badge](https://badges.greenkeeper.io/naugtur/blocked-at.svg)](https://greenkeeper.io/)

Detects slow synchronous execution and reports where it started.


## Installation

**Requires Node 8+**

```
$ npm install blocked-at
```

## Usage

```js
blocked((time, stack) => {
  console.log(`Blocked for ${time}ms, operation started here:`, stack)
})
```

## Description

  The `blocked()` function reports every value over the configured threshold (defaults to 20ms). Usage is similar to [`blocked`](https://www.npmjs.com/package/blocked) but the detection mechanism is different, to allow pointing to the slow function.

  It uses [Async Hooks](https://nodejs.org/api/async_hooks.html) to measure the time and generate the stack trace.
  Stack trace will point to the beginning of an asynchronously called function that contained the long operation.

  Run tests (`npm test`) to see examples.

> There's a performance cost to enabling Async Hooks. It's recommended to detect blocking exists with something without the performance overhead and use blocked-at in testing environment to pinpoint where the slowdown happens.
> Rule of thumb is you should not be running this in production unless desperate.

## Params and return value

```
const blocked = require('blocked-at')
const { stop } = blocked(fn, options)
```

- fn: The callback function to execute when a function called asynchronously ran more than threshold. Two arguments are passed: time it measured and an array of stack frames (callstack)
- options: _Optional._

|option|default|description|
|---|---|---|
|`trimFalsePositives`|*falsy*| eliminate a class of false positives (experimental) |
|`threshold`| *20* | minimum miliseconds of blockage to report. supported for parity with [`blocked`](https://www.npmjs.com/package/blocked)|
|`resourcesCap`| *undefined* | maximum amount of stack traces with resource details kept in memory. Resources are not saved by default. see the next section for details |
|`debug`| *falsy* | print debug data to console |

Returns: An object with `stop` method. `stop()` will disable the async hooks set up by this library and callback will no longer be called.

## Using the stack trace

The stack trace is pointing to a start of a function called asynchronously, so in most cases the first stack frame pointing to your code is where you need to start analyzing all synchronous operations to find the slow one.

In some cases your code is not directly called and tracking it down will still be difficult. See how the http test case produces a stack pointing to `Server.connectionListener` as the slow function, because everything inside of it is synchronously called. You can always wrap your handlers' code in `setImmediate` if you become desperate. Or use resources.

## Using the resource details

If you can't narrow down a blocking call to a particular function, you can try to use `resourcesCap` option and inspect an associated [resource](https://nodejs.org/api/async_hooks.html#async_hooks_resource):

 ```js
blocked((time, stack, {type, resource}) => {
  console.log(`Blocked for ${time}ms, operation started here:`, stack)
  if (type === 'HTTPPARSER' && resource) {
    // resource structure in this example assumes Node 10.x
    console.log(`URL related to blocking operation: ${resource.resource.incoming.url}`)
  }
}, {resourcesCap: 100})
```

Note that resource structure is a subject to change and may vary between Node versions.

 **Warning**: Exposing resource details has a significant memory overhead, to the point of crashing the entire application due to exceeding heap limit. This is why `resourcesCap` is a number -
 it specifies the maximum amount of resources with details kept in memory. If this number is exceeded at runtime, you'll still get the information about blocked event loop, but resource will be `undefined`.
 Adjust it according to your needs. You can start arbitrarily with a `100` and decrease it if it's consuming too much memory or increase it if you don't see the details when you need them.


# License

MIT
