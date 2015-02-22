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

Configuration
-------------

The plugin uses the [level-party](https://github.com/substack/level-party) module to get over the level multi-process restrictions.
