var EventEmitter, Server, express, io, sys, util;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
}, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
io = require('socket.io');
express = require('express');
sys = require('sys');
util = require('util');
EventEmitter = (require('events')).EventEmitter;
exports.Server = Server = (function() {
  __extends(Server, EventEmitter);
  function Server(port) {
    if (port == null) {
      port = 5000;
    }
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
    this.socket = io.listen(this.server);
    this.socket.configure(__bind(function() {
      return this.socket.set('log level', 1);
    }, this));
    return this.socket.of('/snake').on("connection", __bind(function(client) {
      client.snakeId = this.autoClient;
      this.autoClient += 1;
      sys.puts("Client " + client.snakeId + " connected");
      this.emit('Server.connection', client.snakeId);
      client.emit('id', {
        id: client.snakeId
      });
      client.on("direction", __bind(function(message) {
        return this.emit('Server.direction', client.snakeId, message.direction);
      }, this));
      client.on("name", __bind(function(message) {
        return this.emit('Server.name', client.snakeId, message.name);
      }, this));
      return client.on("disconnect", __bind(function() {
        sys.puts("Client " + client.snakeId + " disconnected");
        return this.emit('Server.disconnect', client.snakeId);
      }, this));
    }, this));
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