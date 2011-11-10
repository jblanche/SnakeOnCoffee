var TwitterListener, config, events, sys, twitter, twitterConfig, util;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
}, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
sys = require('sys');
util = require('util');
config = require('./config');
events = require('events').EventEmitter;
twitter = require('twitter');
twitterConfig = require('./twitterConfig').TwitterConfig;
/* Snake Class */
exports.TwitterListener = TwitterListener = (function() {
  __extends(TwitterListener, events);
  function TwitterListener(options) {
    this.con = new twitter({
      consumer_key: twitterConfig.consumer_key,
      consumer_secret: twitterConfig.consumer_secret,
      access_token_key: twitterConfig.access_token_key,
      access_token_secret: twitterConfig.access_token_secret
    });
  }
  TwitterListener.prototype.watch = function() {
    return this.con.stream('statuses/filter', {
      track: 'future'
    }, __bind(function(stream) {
      return stream.on('data', __bind(function(data) {
        return this.emit('newTweet', data);
      }, this));
    }, this));
  };
  return TwitterListener;
})();