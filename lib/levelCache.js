var cache_manager = require('cache-manager');
var level = require('level-party');
var root = require('app-root-path');
var db = level(root.path + '/db');
var oneMonth = 30*24*3600*1000;

module.exports = {
    init: function() {
        this.cache = cache_manager.caching({
            store: level_cache
        });
    },

    beforePhantomRequest: function(req, res, next) {
        if(req.method !== 'GET') {
            return next();
        }

        var freshness = req.freshness
        // dont use || to test the freshness as it might disacard 0 values
        if (freshness == null) { freshness = oneMonth }
        console.log('freshness', freshness)

        this.cache.get(req.prerender.url, freshness, function (err, result) {
            if(err) console.error(err);

            if (!err && result) {
                console.log('cache hit');
                return res.send(200, result);
            }

            next();
        });
    },

    afterPhantomRequest: function(req, res, next) {
        this.cache.set(req.prerender.url, req.prerender.documentHTML, function(err, result) {
            if (err) console.error(err);
        });
        next();
    }
};

var level_cache = {
    get: function(key, freshness, callback) {
        cb = getWrappedCallback(freshness, callback, key)
        db.get(key, cb);
    },
    set: function(key, value, callback) {
        var val = getValue(value)
        db.put(key, val, callback);
    }
};

var getValue = function(value) {
    val = {
      body: value,
      timestamp: new Date().getTime()
    }
    return JSON.stringify(val)
};


var getWrappedCallback = function(freshness, cb, key){
    return function(err, res) {
        if (err == null){
            res = JSON.parse(res)
            if (isFreshEnough(res.timestamp, freshness)){
                cb(null, res.body)
            }
            else {
                cb(new Error('expired'))
            }
        }
        else {
            cb(err)
        }
    }
}

var isFreshEnough = function(timestamp, timespan) {
    var age = Date.now() - timestamp;
    return age < timespan;
};
