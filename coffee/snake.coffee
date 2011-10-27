sys = require 'sys'
util = require 'util'
config = require './config'

### Snake Class ###
exports.Snake = class Snake
  constructor: (@id) ->
    @reset()
    @kills = 0
    @deaths = 0
    @goodies = 0
    @length = config.SNAKE_LENGTH
    
  addKill: ->
    @kills++
    @length = @elements.unshift({x: -1, y: -1})
    @length
  
  reset: ->
    rH = Math.floor(Math.random()*49)
    @deaths++
    @length = config.SNAKE_LENGTH
    @direction = "right"  
    @elements = ( {x: -i, y: rH} for i in [@length..1])
    
  doStep: ->
    @moveTail i for i in [0...(@length-1)] #every element except the head
    @moveHead() 
    @
    
  addGoodie: ->
    @length = @elements.unshift({x: -1, y: -1})
    @goodies++
    @length
  
  moveTail: (i) ->
    @elements[i].x = @elements[i+1].x
    @elements[i].y = @elements[i+1].y
      
  moveHead: ->
    head = @length - 1
    
    switch @direction
      when "left" then @elements[head].x -= 1
      when "right" then @elements[head].x += 1
      when "up" then @elements[head].y -= 1
      when "down" then @elements[head].y += 1

    @elements[head].x = config.STAGE_WIDTH if @elements[head].x < 0
    @elements[head].y = config.STAGE_HEIGHT if @elements[head].y < 0
    @elements[head].x = 0 if @elements[head].x > config.STAGE_WIDTH
    @elements[head].y = 0 if @elements[head].y > config.STAGE_HEIGHT
    
  head: ->
    @elements[@length-1]
    
  blocks: (other) ->
    head = other.head()
    collision = false
    for element in @elements
      collision = true if head.x == element.x and head.y == element.y

    return collision
    
  ateGoodie: (goodie) ->
    head = @head()
    head.x == goodie.x and head.y == goodie.y


  blocksSelf: ->
    head = @head()
    collision = false
    for i in [0...(@length-1)]
      collision = true if head.x == @elements[i].x and head.y == @elements[i].y
    
    return collision


