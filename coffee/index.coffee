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