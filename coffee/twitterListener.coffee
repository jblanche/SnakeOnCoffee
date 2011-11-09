sys = require 'sys'
util = require 'util'
config = require './config'
events  = require('events').EventEmitter
twitter = require('twitter')

### Snake Class ###
exports.TwitterListener = class TwitterListener extends events
  constructor: (options) ->
    @con = new twitter(
      consumer_key: 'LCEb7pNcyK4d4xCjmwg'
      consumer_secret: 'Ibx57jSEGmIeucG2uq8W1yGZHkDjUyJRcYvmyBcKg'
      access_token_key: '6532062-6RnnuANxnSCZdTCVC9uECPJv4bYAb6whJpSP2gdXM8'
      access_token_secret: '8YZHNUooi5Aql4aJep5VWa6rLW4BoVtYdh2Pwe0EeZw'
    )
  
  watch: ->
    @con.stream('statuses/filter',  {track:'future'},  (stream) =>
      stream.on 'data', (data) =>
        this.emit('newTweet', data)
    )
          