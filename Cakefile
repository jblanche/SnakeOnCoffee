fs     = require 'fs'
{exec} = require 'child_process'
util   = require 'util'
uglify = require './node_modules/uglify-js'

#Server
serverSrcCoffeeDir     = './coffee'
serverTargetJsDir      = './js'

serverTargetFileName   = 'game'
serverLibsFileName     = 'game'

serverTargetCoffeeFile = "#{serverSrcCoffeeDir}/#{serverTargetFileName}.coffee"
serverTargetJsFile     = "#{serverTargetJsDir}/#{serverTargetFileName}.js"

serverTargetJsMinFile  = "#{serverTargetJsDir}/#{serverTargetFileName}.min.js"
serverWithLibsTargetFileName = "#{serverTargetJsDir}/#{serverLibsFileName}.min.js"

serverCoffeeOpts = "--bare --output #{serverTargetJsDir} --compile #{serverTargetCoffeeFile}"

serverCoffeeFiles = [
  'config',
  'goodie',
  'index',
  'server',
  'snake',
  'utils'
]

libs = ["game"]


task 'watch:all', 'Watch public CoffeeScript', ->
    invoke 'watch'              
                                
task 'build:all', 'Build public CoffeeScript', ->
    invoke 'build'    

task 'watch', 'Watch server source files and build changes', ->
    invoke 'build'
    util.log "Watching for changes in #{serverSrcCoffeeDir}"

    for file in serverCoffeeFiles then do (file) ->
        fs.watchFile "#{serverSrcCoffeeDir}/#{file}.coffee", (curr, prev) ->
            if +curr.mtime isnt +prev.mtime
                util.log "Saw change in #{serverSrcCoffeeDir}/#{file}.coffee"
                invoke 'build'

task 'build', 'Build a single JavaScript file from server files', ->
    util.log "Building #{serverTargetJsFile}"
    appContents = new Array remaining = serverCoffeeFiles.length
    util.log "Appending #{serverCoffeeFiles.length} files to #{serverTargetCoffeeFile}"
    
    for file, index in serverCoffeeFiles then do (file, index) ->
        fs.readFile "#{serverSrcCoffeeDir}/#{file}.coffee"
                  , 'utf8'
                  , (err, fileContents) ->
            handleError(err) if err
            appContents[index] = fileContents
            process() if --remaining is 0

    process = ->
        fs.writeFile serverTargetCoffeeFile
                   , appContents.join('\n\n')
                   , 'utf8'
                   , (err) ->
            handleError(err) if err
            
            exec "coffee #{serverCoffeeOpts}", (err, stdout, stderr) ->
                handleError(err) if err
                message = "Compiled #{serverTargetJsFile}"
                util.log message
                displayNotification message
                #fs.unlink serverTargetCoffeeFile, (err) -> handleError(err) if err
                invoke 'uglify'

task 'uglify', 'Minify and obfuscate', ->
    jsp = uglify.parser
    pro = uglify.uglify

    fs.readFile serverTargetJsFile, 'utf8', (err, fileContents) ->
        ast = jsp.parse fileContents  # parse code and get the initial AST
        ast = pro.ast_mangle ast # get a new AST with mangled names
        ast = pro.ast_squeeze ast # get an AST with compression optimizations
        final_code = pro.gen_code ast # compressed code here
    
        fs.writeFile serverTargetJsMinFile, final_code
        #fs.unlink serverTargetJsFile, (err) -> handleError(err) if err
        
        message = "Uglified #{serverTargetJsMinFile}"
        util.log message
        displayNotification message
        invoke "libs:pack"
    
task 'libs:pack', -> 
  libContents = new Array 
  libRemaining = libs.length - 1 
  for lib, index in libs then do (lib, index) ->
    fs.readFile "#{serverTargetJsDir}/#{lib}.min.js"
              , 'utf8'
              , (err, fileContents) ->
        handleError(err) if err
        libContents[index] = fileContents
        util.log "packing [#{index + 1}] #{lib}.min.js"
        util.log("remaining : #{libRemaining}")  
        if libRemaining-- is 0
          process() 

      process = ->
        fs.writeFile serverWithLibsTargetFileName
          , libContents.join('\n\n')
          , 'utf8'
          , (err) ->
            handleError(err) if err
            util.log("writting in #{serverWithLibsTargetFileName}")
        

coffee = (options = "", file) ->
    util.log "Compiling #{file}"
    exec "coffee #{options} --compile #{file}", (err, stdout, stderr) -> 
        handleError(err) if err
        displayNotification "Compiled #{file}"

handleError = (error) -> 
    util.log error
    displayNotification error
        
displayNotification = (message = '') -> 
    options = {
        title: 'CoffeeScript'
        image: 'lib/CoffeeScript.png'
    }
    try require('./node_modules/growl').notify message, options
