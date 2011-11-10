sys = require 'sys'
util = require 'util'
config = require './config'
events  = require('events').EventEmitter
twitter = require('twitter')
twitterConfig = require('./twitterConfig').TwitterConfig

### Snake Class ###
exports.TwitterListener = class TwitterListener extends events
  constructor: (options) ->

    @con = new twitter(
      consumer_key: twitterConfig.consumer_key || process.env.TWITTER_CONSUMER_KEY
      consumer_secret: twitterConfig.consumer_secret || process.env.TWITTER_CONSUMER_KEY
      access_token_key: twitterConfig.access_token_key || process.env.TWITTER_CONSUMER_KEY
      access_token_secret: twitterConfig.access_token_secret || process.env.TWITTER_CONSUMER_KEY
    )
  
  watch: ->
    @con.stream('statuses/filter',  {track:'future'},  (stream) =>
      stream.on 'data', (data) =>
        this.emit('newTweet', data)
    )
          