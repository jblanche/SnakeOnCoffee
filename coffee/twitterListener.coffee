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
      consumer_key: twitterConfig.consumer_key
      consumer_secret: twitterConfig.consumer_secret
      access_token_key: twitterConfig.access_token_key
      access_token_secret: twitterConfig.access_token_secret
    )
  
  watch: ->
    @con.stream('statuses/filter',  {track:'future'},  (stream) =>
      stream.on 'data', (data) =>
        @emit('newTweet', data)
      stream.on 'end', (resp) =>
        @watch()
    )
          