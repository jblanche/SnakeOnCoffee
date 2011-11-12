var Database, DatabaseConfig, EventEmitter, Goodie, Server, Snake, SnakeEmitter, TwitterListener, checkCollisions, config, createGoodie, database, events, express, goodies, io, server, snakes, sys, tick, topTen, twitterListener, updateState, util, utils;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

exports.STAGE_WIDTH = 49;

exports.STAGE_HEIGHT = 49;

exports.SNAKE_LENGTH = 8;

config = require('./config');

exports.Goodie = Goodie = (function() {

  function Goodie() {
    this.x = Math.floor(Math.random() * config.STAGE_WIDTH);
    this.y = Math.floor(Math.random() * config.STAGE_HEIGHT);
    this.age = 0;
  }

  return Goodie;

})();

Server = require('./server').Server;

EventEmitter = (require('events')).EventEmitter;

Snake = require('./snake').Snake;

SnakeEmitter = require('./snake').SnakeEmitter;

Goodie = require('./goodie').Goodie;

TwitterListener = require('./twitterListener').TwitterListener;

util = require('util');

Database = require('./database').Database;

utils = require('./utils');

config = require('./config');

DatabaseConfig = require('./databaseConfig').DatabaseConfig;

snakes = {};

goodies = [];

topTen = {};

server = new Server(process.env.SNAKES_SERVER_PORT || 5000);

twitterListener = new TwitterListener();

database = new Database(DatabaseConfig);

server.start();

twitterListener.watch();

SnakeEmitter.on('createPlayer', function(opts) {
  return database.createPlayer(opts.name);
});

SnakeEmitter.on('updateScore', function(opts) {
  return database.updateScore(opts.name, opts.score);
});

database.on('topTen', function(data) {
  return topTen = data;
});

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

server.on('Server.name', function(clientId, name) {
  return snakes[clientId].setName(name);
});

twitterListener.on('newTweet', function() {
  return createGoodie();
});

updateState = function() {
  var goodie, index, removable, snake, snakesJSON, _i, _len;
  for (index in snakes) {
    snake = snakes[index];
    snake.doStep();
  }
  removable = (function() {
    var _i, _len, _results;
    _results = [];
    for (_i = 0, _len = goodies.length; _i < _len; _i++) {
      goodie = goodies[_i];
      if (goodie.age++ > 100) _results.push(goodie);
    }
    return _results;
  })();
  for (_i = 0, _len = removable.length; _i < _len; _i++) {
    goodie = removable[_i];
    goodies.remove(goodie);
  }
  checkCollisions();
  snakesJSON = (function() {
    var _results;
    _results = [];
    for (index in snakes) {
      snake = snakes[index];
      _results.push(snake.toJSON());
    }
    return _results;
  })();
  return server.update(snakesJSON, goodies, topTen);
};

checkCollisions = function() {
  var goodie, index, other, resetSnakes, snake, _i, _j, _len, _len2, _results;
  resetSnakes = [];
  for (index in snakes) {
    snake = snakes[index];
    if (snake.blocksSelf()) resetSnakes.push(snake);
    for (_i = 0, _len = goodies.length; _i < _len; _i++) {
      goodie = goodies[_i];
      if (snake.ateGoodie(goodie)) {
        snake.addGoodie();
        goodies.remove(goodie);
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

sys = require('sys');

util = require('util');

events = require('events');

config = require('./config');

Database = require('./database').Database;

/* Snake Class
*/

exports.SnakeEmitter = SnakeEmitter = new events.EventEmitter;

exports.Snake = Snake = (function() {

  __extends(Snake, events.EventEmitter);

  function Snake(id) {
    this.id = id;
    this.kills = 0;
    this.deaths = 0;
    this.goodies = 0;
    this.length = config.SNAKE_LENGTH;
    this.name = "";
    this.reset();
    this.color = Math.floor(Math.random() * 16777215).toString(16);
  }

  Snake.prototype.setName = function(name) {
    this.name = name;
    return SnakeEmitter.emit('createPlayer', {
      name: this.name
    });
  };

  Snake.prototype.toJSON = function() {
    return {
      elements: this.elements,
      goodies: this.goodies,
      kills: this.kills,
      deaths: this.deaths,
      color: this.color,
      name: this.name,
      score: this.score()
    };
  };

  Snake.prototype.score = function() {
    return this.goodies + this.kills;
  };

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
    this.goodies = this.kills = 0;
    this.length = config.SNAKE_LENGTH;
    this.direction = "right";
    this.elements = (function() {
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
    this.emit('reset');
    return SnakeEmitter.emit('updateScore', {
      name: this.name,
      score: this.getScore()
    });
  };

  Snake.prototype.getScore = function() {
    return this.goodies * 2 + this.kills - this.deaths;
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
    if (this.elements[head].x < 0) this.elements[head].x = config.STAGE_WIDTH;
    if (this.elements[head].y < 0) this.elements[head].y = config.STAGE_HEIGHT;
    if (this.elements[head].x > config.STAGE_WIDTH) this.elements[head].x = 0;
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
      if (head.x === element.x && head.y === element.y) collision = true;
    }
    return collision;
  };

  Snake.prototype.ateGoodie = function(goodie) {
    var head;
    if (goodie == null) return false;
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
