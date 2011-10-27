var EventEmitter, Goodie, Server, Snake, checkCollisions, config, createGoodie, express, goodies, io, server, snakes, sys, tick, updateState, util, utils;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
}, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
exports.STAGE_WIDTH = 49;
exports.STAGE_HEIGHT = 49;
exports.SNAKE_LENGTH = 8;
config = require('./config');
exports.Goodie = Goodie = (function() {
  function Goodie() {
    this.x = Math.floor(Math.random() * config.STAGE_WIDTH);
    this.y = Math.floor(Math.random() * config.STAGE_HEIGHT);
  }
  return Goodie;
})();
Server = require('./server').Server;
EventEmitter = (require('events')).EventEmitter;
Snake = require('./snake').Snake;
Goodie = require('./goodie').Goodie;
utils = require('./utils');
config = require('./config');
snakes = {};
goodies = [];
server = new Server(5000);
server.start();
server.on('Server.connection', function(clientId) {
  var snake;
  snake = new Snake(clientId);
  return snakes[clientId] = snake;
});
server.on('Server.disconnect', function(clientId) {
  return delete snakes[clientId];
});
server.on('Server.direction', function(clientId, direction) {
  return snakes[clientId].direction = direction;
});
updateState = function() {
  var index, snake;
  for (index in snakes) {
    snake = snakes[index];
    snake.doStep();
  }
  checkCollisions();
  return server.update(snakes, goodies);
};
checkCollisions = function() {
  var goodie, index, other, resetSnakes, snake, _i, _j, _len, _len2, _results;
  resetSnakes = [];
  for (index in snakes) {
    snake = snakes[index];
    if (snake.blocksSelf()) {
      resetSnakes.push(snake);
    }
    for (_i = 0, _len = goodies.length; _i < _len; _i++) {
      goodie = goodies[_i];
      if (snake.ateGoodie(goodie)) {
        snake.addGoodie();
        goodies.remove(goodie);
        createGoodie();
      }
    }
    for (index in snakes) {
      other = snakes[index];
      if (other !== snake) {
        if (other.blocks(snake)) {
          resetSnakes.push(snake);
          other.addKill();
        }
      }
    }
  }
  _results = [];
  for (_j = 0, _len2 = resetSnakes.length; _j < _len2; _j++) {
    snake = resetSnakes[_j];
    _results.push(snake.reset());
  }
  return _results;
};
createGoodie = function() {
  var goodie;
  goodie = new Goodie;
  return goodies.push(goodie);
};
tick = setInterval(updateState, 100);
createGoodie();
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
      return client.on("disconnect", __bind(function() {
        sys.puts("Client " + client.snakeId + " disconnected");
        return this.emit('Server.disconnect', client.snakeId);
      }, this));
    }, this));
  };
  Server.prototype.update = function(snakes, goodies) {
    return this.socket.of('/snake').emit('update', {
      snakes: snakes,
      goodies: goodies
    });
  };
  return Server;
})();
sys = require('sys');
util = require('util');
config = require('./config');
/* Snake Class */
exports.Snake = Snake = (function() {
  function Snake(id) {
    this.id = id;
    this.reset();
    this.kills = 0;
    this.deaths = 0;
    this.goodies = 0;
    this.length = config.SNAKE_LENGTH;
  }
  Snake.prototype.addKill = function() {
    this.kills++;
    this.length = this.elements.unshift({
      x: -1,
      y: -1
    });
    return this.length;
  };
  Snake.prototype.reset = function() {
    var i, rH;
    rH = Math.floor(Math.random() * 49);
    this.deaths++;
    this.length = config.SNAKE_LENGTH;
    this.direction = "right";
    return this.elements = (function() {
      var _ref, _results;
      _results = [];
      for (i = _ref = this.length; _ref <= 1 ? i <= 1 : i >= 1; _ref <= 1 ? i++ : i--) {
        _results.push({
          x: -i,
          y: rH
        });
      }
      return _results;
    }).call(this);
  };
  Snake.prototype.doStep = function() {
    var i, _ref;
    for (i = 0, _ref = this.length - 1; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
      this.moveTail(i);
    }
    this.moveHead();
    return this;
  };
  Snake.prototype.addGoodie = function() {
    this.length = this.elements.unshift({
      x: -1,
      y: -1
    });
    this.goodies++;
    return this.length;
  };
  Snake.prototype.moveTail = function(i) {
    this.elements[i].x = this.elements[i + 1].x;
    return this.elements[i].y = this.elements[i + 1].y;
  };
  Snake.prototype.moveHead = function() {
    var head;
    head = this.length - 1;
    switch (this.direction) {
      case "left":
        this.elements[head].x -= 1;
        break;
      case "right":
        this.elements[head].x += 1;
        break;
      case "up":
        this.elements[head].y -= 1;
        break;
      case "down":
        this.elements[head].y += 1;
    }
    if (this.elements[head].x < 0) {
      this.elements[head].x = config.STAGE_WIDTH;
    }
    if (this.elements[head].y < 0) {
      this.elements[head].y = config.STAGE_HEIGHT;
    }
    if (this.elements[head].x > config.STAGE_WIDTH) {
      this.elements[head].x = 0;
    }
    if (this.elements[head].y > config.STAGE_HEIGHT) {
      return this.elements[head].y = 0;
    }
  };
  Snake.prototype.head = function() {
    return this.elements[this.length - 1];
  };
  Snake.prototype.blocks = function(other) {
    var collision, element, head, _i, _len, _ref;
    head = other.head();
    collision = false;
    _ref = this.elements;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      element = _ref[_i];
      if (head.x === element.x && head.y === element.y) {
        collision = true;
      }
    }
    return collision;
  };
  Snake.prototype.ateGoodie = function(goodie) {
    var head;
    head = this.head();
    return head.x === goodie.x && head.y === goodie.y;
  };
  Snake.prototype.blocksSelf = function() {
    var collision, head, i, _ref;
    head = this.head();
    collision = false;
    for (i = 0, _ref = this.length - 1; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
      if (head.x === this.elements[i].x && head.y === this.elements[i].y) {
        collision = true;
      }
    }
    return collision;
  };
  return Snake;
})();
Array.prototype.remove = function(e) {
  var t, _ref;
  if ((t = this.indexOf(e)) > -1) {
    return ([].splice.apply(this, [t, t - t + 1].concat(_ref = [])), _ref);
  }
};