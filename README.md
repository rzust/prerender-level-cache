prerender-level-cache
=======================

Prerender plugin for level caching, to be used with the prerender node application from https://github.com/prerender/prerender.

How it works
------------

This plugin will store all prerendered pages into a [level database](https://github.com/rvagg/node-levelup). There is currently no expiration functionality, which means that once a page is stored, future requests for prerendering a page will always be served from the cache if it's available and the page caches are never updated.

To get a fresh cache, you will have to delete the cache in the database manually or from another process, or just delete the whole database.

How to use
----------

In your local prerender project run:

    $ npm install prerender-level-cache --save

Then in the server.js that initializes the prerender:

    server.use(require('prerender-level-cache'));

Custom features
-------------
#### Level-party
The plugin uses the [level-party](https://github.com/substack/level-party) module to get over the level multi-process restrictions.

#### Freshness
You can pass a per-request max age parameter to req.freshness, through other prerender plugins, to customize the cache freshness (set to one month by default):

Exemple:
```javascript
// in another plugin placed before prerender-level-cache
module.exports = {
  beforePhantomRequest: function(req, res, next){
    // setting the freshness to one day
    req.freshness = 24*60*60*1000;
    next()
  }
}
```
