const cacheManager = require('cache-manager')
const oneMonth = 30 * 24 * 3600 * 1000
const store = require('./store')

module.exports = {
  init: function () {
    this.cache = cacheManager.caching({ store })
  },

  requestReceived: function (req, res, next) {
    if (req.method !== 'GET') return next()

    var freshness = req.freshness
    // dont use || to test the freshness as it might disacard 0 values
    if (freshness == null) freshness = oneMonth
    console.log('freshness', freshness)

    this.cache.get(req.prerender.url, freshness, function (err, result) {
      if (err) console.error(err)

      if (!err && result) {
        console.log('cache hit')
        req.prerender.cacheHit = true;
        return res.send(200, result)
      }

      next()
    })
  },

  beforeSend: function (req, res, next) {
    this.cache.set(req.prerender.url, req.prerender.documentHTML, function (err, result) {
      if (err) console.error(err)
    })
    next()
  }
}
