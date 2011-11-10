var Database, config, events, mysql, util;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

util = require('util');

config = require('./config');

events = require('events').EventEmitter;

mysql = require('mysql');

exports.Database = Database = (function() {

  __extends(Database, events);

  function Database(options) {
    this.options = options;
    this.client = mysql.createClient({
      database: options.database || process.env.MYSQL_DATABASE,
      table: options.user || process.env.MYSQL_TABLE,
      user: options.user || process.env.MYSQL_USER,
      password: options.password || process.env.MYSQL_PASSWORD
    });
  }

  Database.prototype.createPlayer = function(user, score) {
    var query;
    if (score == null) score = 0;
    query = 'INSERT INTO ' + this.options.table + ' (score, name) VALUES (?, ?)';
    return this.client.query(query, [score, user], function(err) {
      if (err) {
        return util.puts(util.inspect(err));
      } else {
        return util.puts('inserted');
      }
    });
  };

  Database.prototype.updateScore = function(user, score) {
    var query;
    var _this = this;
    query = 'UPDATE ' + this.options.table + ' SET score=? WHERE name=? AND score < ?';
    return this.client.query(query, [score, user, score], function(err) {
      if (err) {
        return util.puts(util.inspect(err));
      } else {
        util.puts('updated');
        return _this.topTen();
      }
    });
  };

  Database.prototype.topTen = function() {
    var query;
    var _this = this;
    query = 'SELECT * FROM ' + this.options.table + ' ORDER BY score desc LIMIT 10';
    return this.client.query(query, function(err, data) {
      if (err) {
        return util.puts(util.inspect(err));
      } else {
        return _this.emit('topTen', data);
      }
    });
  };

  return Database;

})();
