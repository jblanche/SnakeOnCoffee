define(["/socket.io/socket.io.js", "cs!coffee/pubsub"], (SocketIO, PubSub)->
  class Server
    constructor: ->
      @server = @id = null
      if window["WebSocket"]
          @connect()
          PubSub('Direction').subscribe(@setDirection)
      else
        alert "Your browser does not support websockets."

    connect: ->
      @server = io.connect "http://localhost:5000/snake"
      @server.on "id", (message) ->
        PubSub('SettingID').publish(message.id)
      @server.on "update", (message) ->
        PubSub('Update').publish(message.snakes, message.goodies)
            
    setDirection: (direction) => 
      @server.emit('direction', {direction : direction})
)