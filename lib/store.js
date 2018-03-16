const level = require('level-party')
const root = require('app-root-path')
const db = level(root.path + '/db')

module.exports = {
  get: function (key, freshness, callback) {
    const cb = getWrappedCallback(freshness, callback, key)
    db.get(key, cb)
  },
  set: function (key, value, callback) {
    db.put(key, getValueJson(value), callback)
  }
}

const getValueJson = function (value) {
  return JSON.stringify({
    body: value,
    timestamp: new Date().getTime()
  })
}

const getWrappedCallback = function (freshness, cb, key) {
  return function (err, res) {
    if (err != null) return cb(err)

    res = JSON.parse(res)
    if (isFreshEnough(res.timestamp, freshness)) {
      cb(null, res.body)
    } else {
      cb(new Error('expired'))
    }
  }
}

const isFreshEnough = function (timestamp, timespan) {
  const age = Date.now() - timestamp
  return age < timespan
}
