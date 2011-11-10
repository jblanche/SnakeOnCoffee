var Database, DatabaseConfig, EventEmitter, Goodie, Server, Snake, SnakeEmitter, TwitterListener, checkCollisions, config, createGoodie, database, goodies, server, snakes, tick, topTen, twitterListener, updateState, util, utils;
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
DatabaseConfig = require('./DatabaseConfig').DatabaseConfig;
snakes = {};
goodies = [];
topTen = {};
server = new Server(5000);
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
  var goodie, index, removable, snake, _i, _len;
  for (index in snakes) {
    snake = snakes[index];
    snake.doStep();
  }
  removable = (function() {
    var _i, _len, _results;
    _results = [];
    for (_i = 0, _len = goodies.length; _i < _len; _i++) {
      goodie = goodies[_i];
      if (goodie.age++ > 50) {
        _results.push(goodie);
      }
    }
    return _results;
  })();
  for (_i = 0, _len = removable.length; _i < _len; _i++) {
    goodie = removable[_i];
    goodies.remove(goodie);
  }
  checkCollisions();
  return server.update(snakes, goodies, topTen);
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