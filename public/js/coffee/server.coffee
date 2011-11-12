define(["/socket.io/socket.io.js", "cs!coffee/pubsub"], (SocketIO, PubSub)->
  class Server
    constructor: (name) ->
      @server = @id = null
      if window["WebSocket"]
          name = prompt("What's your name ?")
          @connect(name)
          PubSub('Direction').subscribe(@setDirection)
      else
        alert "Your browser does not support websockets."

    connect: (name)->
      @server = io.connect "http://localhost:5001/snake"
      @server.emit('name', {name : name})
      @server.on "id", (message) ->
        PubSub('SettingID').publish(message.id)
      @server.on "update", (message) ->
        PubSub('Update').publish(message.snakes, message.goodies)
        PubSub('TopTen').publish(message.topTen)
        PubSub('Scores').publish(message.snakes)
            
    setDirection: (direction) => 
      @server.emit('direction', {direction : direction})
)