var cache_manager = require('cache-manager');
var level = require('level-party');
var root = require('app-root-path');
var db = level(root.path + '/db');

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

        this.cache.get(req.prerender.url, function (err, result) {
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
    get: function(key, callback) {
        db.get(key, callback);
    },
    set: function(key, value, callback) {
        db.put(key, value, callback)
    }
};
