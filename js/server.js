var EventEmitter, Server, express, io, util;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

io = require('socket.io');

express = require('express');

util = require('util');

EventEmitter = (require('events')).EventEmitter;

exports.Server = Server = (function() {

  __extends(Server, EventEmitter);

  function Server(port) {
    if (port == null) port = 5001;
    this.autoClient = 1;
    this.port = parseInt(process.env.PORT || port, 10);
  }

  Server.prototype.start = function() {
    this.server = express.createServer();
    this.server.use(express.static(__dirname + '/../public'));
    this.server.listen(this.port);
    return this.listen();
  };

  Server.prototype.listen = function() {
    var _this = this;
    this.socket = io.listen(this.server);
    this.socket.configure(function() {
      return _this.socket.set('log level', 1);
    });
    return this.socket.of('/snake').on("connection", function(client) {
      client.snakeId = _this.autoClient;
      _this.autoClient += 1;
      util.puts("Client " + client.snakeId + " connected");
      _this.emit('Server.connection', client.snakeId);
      client.emit('id', {
        id: client.snakeId
      });
      client.on("direction", function(message) {
        return _this.emit('Server.direction', client.snakeId, message.direction);
      });
      client.on("name", function(message) {
        return _this.emit('Server.name', client.snakeId, message.name);
      });
      return client.on("disconnect", function() {
        util.puts("Client " + client.snakeId + " disconnected");
        return _this.emit('Server.disconnect', client.snakeId);
      });
    });
  };

  Server.prototype.update = function(snakes, goodies, topTen) {
    return this.socket.of('/snake').emit('update', {
      snakes: snakes,
      goodies: goodies,
      topTen: {
        scores: topTen
      }
    });
  };

  return Server;

})();
