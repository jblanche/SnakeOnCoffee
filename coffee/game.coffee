exports.STAGE_WIDTH = 49
exports.STAGE_HEIGHT = 49
exports.SNAKE_LENGTH = 8


config = require './config'

exports.Goodie = class Goodie
  constructor: ->
    @x = Math.floor(Math.random() * config.STAGE_WIDTH)
    @y = Math.floor(Math.random() * config.STAGE_HEIGHT)
  

Server = require('./server').Server
EventEmitter = (require 'events').EventEmitter
Snake = require('./snake').Snake
Goodie = require('./goodie').Goodie
utils = require './utils'
config = require './config'

snakes = {}
goodies = []

server = new Server(5000)
server.start()

server.on('Server.connection', (clientId) -> 
  snake = new Snake clientId
  snakes[clientId] = snake
)

server.on('Server.disconnect', (clientId) -> 
  delete snakes[clientId]
)

server.on('Server.direction', (clientId, direction) -> 
  snakes[clientId].direction = direction
)


updateState = ->
  snake.doStep() for index, snake of snakes
  checkCollisions()
  server.update(snakes, goodies)

checkCollisions = ->
  resetSnakes = []
  
  for index, snake of snakes
    resetSnakes.push snake if snake.blocksSelf()
    
    for goodie in goodies
      if snake.ateGoodie(goodie)
        snake.addGoodie()
        goodies.remove(goodie)
        createGoodie()

    for index, other of snakes
      if other isnt snake
        if other.blocks snake
          resetSnakes.push snake 
          other.addKill()
    
  for snake in resetSnakes
    snake.reset()
    
createGoodie = ->
  goodie = new Goodie
  goodies.push goodie

tick = setInterval updateState, 100
createGoodie()

io = require 'socket.io'
express = require 'express'
sys = require 'sys'
util = require 'util'
EventEmitter = (require 'events').EventEmitter

exports.Server =  class Server extends EventEmitter 
  
  constructor: (port = 5000) -> 
    @autoClient = 1
    @port = parseInt(process.env.PORT || port, 10)

  start: -> 
    @server = express.createServer()
    @server.use(express.static(__dirname + '/../public'))
    @server.listen(@port)
    @listen()

  listen: -> 
    @socket = io.listen(@server)
    
    @socket.configure( =>
      @socket.set('log level', 1)
    )
    
    @socket.of('/snake').on "connection", (client) =>
      client.snakeId = @autoClient
      @autoClient += 1
      sys.puts "Client #{client.snakeId} connected"
      @emit('Server.connection', client.snakeId)
      client.emit('id', {id: client.snakeId})
      
      client.on "direction",  (message) =>
        @emit('Server.direction', client.snakeId, message.direction)
        
      client.on "disconnect", =>
        sys.puts "Client #{client.snakeId} disconnected"
        @emit('Server.disconnect', client.snakeId)
        
  update: (snakes, goodies) ->
    @socket.of('/snake').emit('update', {snakes: snakes, goodies: goodies})


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




Array::remove = (e) -> @[t..t] = [] if (t = @.indexOf(e)) > -1