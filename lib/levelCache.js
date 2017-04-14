const cacheManager = require('cache-manager')
const level = require('level-party')
const root = require('app-root-path')
const db = level(root.path + '/db')
const oneMonth = 30 * 24 * 3600 * 1000

module.exports = {
  init: function () {
    this.cache = cacheManager.caching({ store: levelCache })
  },

  beforePhantomRequest: function (req, res, next) {
    if (req.method !== 'GET') {
      return next()
    }

    var freshness = req.freshness
        // dont use || to test the freshness as it might disacard 0 values
    if (freshness == null) { freshness = oneMonth }
    console.log('freshness', freshness)

    this.cache.get(req.prerender.url, freshness, function (err, result) {
      if (err) console.error(err)

      if (!err && result) {
        console.log('cache hit')
        return res.send(200, result)
      }

      next()
    })
  },

  afterPhantomRequest: function (req, res, next) {
    this.cache.set(req.prerender.url, req.prerender.documentHTML, function (err, result) {
      if (err) console.error(err)
    })
    next()
  }
}

const levelCache = {
  get: function (key, freshness, callback) {
    cb = getWrappedCallback(freshness, callback, key)
    db.get(key, cb)
  },
  set: function (key, value, callback) {
    const val = getValue(value)
    db.put(key, val, callback)
  }
}

const getValue = function (value) {
  val = {
    body: value,
    timestamp: new Date().getTime()
  }
  return JSON.stringify(val)
}

const getWrappedCallback = function (freshness, cb, key) {
  return function (err, res) {
    if (err == null) {
      res = JSON.parse(res)
      if (isFreshEnough(res.timestamp, freshness)) {
        cb(null, res.body)
      } else {
        cb(new Error('expired'))
      }
    } else {
      cb(err)
    }
  }
}

const isFreshEnough = function (timestamp, timespan) {
  const age = Date.now() - timestamp
  return age < timespan
}
