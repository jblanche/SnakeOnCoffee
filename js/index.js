var EventEmitter, Goodie, Server, Snake, checkCollisions, config, createGoodie, goodies, server, snakes, tick, updateState, utils;
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