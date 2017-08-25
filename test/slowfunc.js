module.exports = function meSoSlow (time) {
  time = time || 100
  const t0 = Date.now()
  console.time('slow')
  while (Date.now() < (t0 + time)) {
    'How many CPU cycles does it take to heat the room by 1 degree?'.split('').join(':)')
  }
  console.timeEnd('slow')
}
