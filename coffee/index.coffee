Server = require('./server').Server
EventEmitter = (require 'events').EventEmitter
Snake = require('./snake').Snake
SnakeEmitter = require('./snake').SnakeEmitter
Goodie = require('./goodie').Goodie
TwitterListener = require('./twitterListener').TwitterListener
util = require 'util'
Database = require('./database').Database
utils = require './utils'
config = require './config'
DatabaseConfig = require('./databaseConfig').DatabaseConfig

snakes = {}
goodies = []
topTen = {}

server = new Server(process.env.SNAKES_SERVER_PORT || 5000)
twitterListener = new TwitterListener()

database = new Database(DatabaseConfig)

server.start()
twitterListener.watch()

SnakeEmitter.on('createPlayer', (opts)->
  database.createPlayer(opts.name)
)

SnakeEmitter.on('updateScore', (opts)->
  database.updateScore(opts.name, opts.score)
)

database.on('topTen', (data)->
  topTen = data
)

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

server.on('Server.name', (clientId, name) -> 
  snakes[clientId].setName name
)

twitterListener.on('newTweet', ->
  createGoodie()  
)

updateState = ->
  snake.doStep() for index, snake of snakes
  
  removable = (goodie for goodie in goodies when goodie.age++ > 50)
  goodies.remove(goodie) for goodie in removable  
  checkCollisions()
  server.update(snakes, goodies, topTen)

checkCollisions = ->
  resetSnakes = []
  
  for index, snake of snakes
    resetSnakes.push snake if snake.blocksSelf()
    
    for goodie in goodies
      if snake.ateGoodie(goodie)
        snake.addGoodie()
        goodies.remove(goodie)

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
