module.exports = {
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
