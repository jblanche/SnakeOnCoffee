io = require 'socket.io'
express = require 'express'
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
      util.puts "Client #{client.snakeId} connected"
      @emit('Server.connection', client.snakeId)
      client.emit('id', {id: client.snakeId})
      
      client.on "direction",  (message) =>
        @emit('Server.direction', client.snakeId, message.direction)

      client.on "name",  (message) =>
        @emit('Server.name', client.snakeId, message.name)

        
      client.on "disconnect", =>
        util.puts "Client #{client.snakeId} disconnected"
        @emit('Server.disconnect', client.snakeId)
        
  update: (snakes, goodies, topTen) ->
    @socket.of('/snake').emit('update', {snakes: snakes, goodies: goodies, topTen: {scores: topTen}})
    
