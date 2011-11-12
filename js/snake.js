var Database, Snake, SnakeEmitter, config, events, sys, util;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

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
