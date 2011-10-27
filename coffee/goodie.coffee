config = require './config'

exports.Goodie = class Goodie
  constructor: ->
    @x = Math.floor(Math.random() * config.STAGE_WIDTH)
    @y = Math.floor(Math.random() * config.STAGE_HEIGHT)
  