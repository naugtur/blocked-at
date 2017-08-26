'use strict'
const notSoSlow = (cb) => {
  `let's take some time but not too much`.repeat(100).split('').join(':)')
  cb && cb()
}

module.exports = function start () {
  Promise.resolve(1)
    .then(_ => new Promise((resolve) => {
      setTimeout(notSoSlow, 3)
      notSoSlow(notSoSlow)

      setTimeout(resolve, 100)
    }))
}
