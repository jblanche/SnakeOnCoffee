sys = require 'sys'
util = require 'util'
config = require './config'
events  = require('events').EventEmitter
mysql = require('mysql')

exports.Database = class Database extends events
  constructor: (options) ->
    @options = options
    @client = mysql.createClient(
      database: options.database|| process.env.MYSQL_DATABASE,
      table: options.user|| process.env.MYSQL_TABLE,
      user: options.user|| process.env.MYSQL_USER,
      password: options.password || process.env.MYSQL_PASSWORD
    )
  
  createPlayer: (user, score = 0)  ->
    query = 'INSERT INTO '+ @options.table + ' (score, name) VALUES (?, ?)'
    @client.query(query, [score, user], (err) ->
      if err
        sys.puts(util.inspect(err)) 
      else
        sys.puts('inserted')
    )

  # There is a unique ID on the name column so that there can't be multiple players with the same name
  updateScore: (user, score)  ->
    #The score is updated only if it beats the previous one
    query = 'UPDATE '+ @options.table + ' SET score=? WHERE name=? AND score < ?'
    @client.query(query, [score, user, score], (err) =>
      if err
        sys.puts(util.inspect(err)) 
      else
        sys.puts('updated')
        @topTen()
    )
    
  topTen: ->
    query = 'SELECT * FROM '+ @options.table + ' ORDER BY score desc LIMIT 10'
    @client.query(query, (err, data) =>
      if err
        sys.puts(util.inspect(err)) 
      else
        @emit 'topTen', data
    )    
