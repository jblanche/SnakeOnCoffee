var TwitterListener, config, events, sys, twitter, util;
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
/* Snake Class */
exports.TwitterListener = TwitterListener = (function() {
  __extends(TwitterListener, events);
  function TwitterListener(options) {
    this.con = new twitter({
      consumer_key: 'LCEb7pNcyK4d4xCjmwg',
      consumer_secret: 'Ibx57jSEGmIeucG2uq8W1yGZHkDjUyJRcYvmyBcKg',
      access_token_key: '6532062-6RnnuANxnSCZdTCVC9uECPJv4bYAb6whJpSP2gdXM8',
      access_token_secret: '8YZHNUooi5Aql4aJep5VWa6rLW4BoVtYdh2Pwe0EeZw'
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