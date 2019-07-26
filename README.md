# blocked-at [![Build Status](https://travis-ci.org/naugtur/blocked-at.svg?branch=master)](https://travis-ci.org/naugtur/blocked-at) [![Greenkeeper badge](https://badges.greenkeeper.io/naugtur/blocked-at.svg)](https://greenkeeper.io/)

Detects slow synchronous execution and reports where it started.

> `blocked-at` uses Async Hooks. There's a performance cost to enabling them. It's recommended to detect blocking exists with something without the performance overhead and use blocked-at in testing environment to pinpoint where the slowdown happens.
> Rule of thumb is you should not be running this in production unless desperate.

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
|`debug`| *falsy* | print debug data to console |

Returns: An object with `stop` method. `stop()` will disable the async hooks set up by this library and callback will no longer be called.

## Using the stack trace

The stack trace is pointing to a start of a function called asynchronously, so in most cases the first stack frame pointing to your code is where you need to start analyzing all synchronous operations to find the slow one.

In some cases your code is not directly called and tracking it down will still be difficult. See how the http test case produces a stack pointing to `Server.connectionListener` as the slow function, because everything inside of it is synchronously called. You can always wrap your handlers' code in `setImmediate` if you become desperate.

# License

MIT
