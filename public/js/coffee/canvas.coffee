define(["cs!coffee/pubsub"], (PubSub)->
  class Canvas
    constructor: (sel)-> 
      @id = null
      @context = $(sel).get(0).getContext("2d")
      PubSub('SettingID').subscribe(@setId)
      PubSub('Update').subscribe(@animate)
      
    setId: (id) =>
      @id = id
      
    animate: (snakes, goodies) =>
      @context.fillStyle = 'rgb(230,230,230)'
      for x in [0..49]
        for y in [0..49]
          @context.fillRect(x*10,y*10,9,9)
      
      # Draw goodies
      for goodie in goodies
        @context.fillStyle = 'rgb(0,170,0)'
        x = goodie.x * 10
        y = goodie.y * 10
        @context.fillRect(x, y, 9, 9)
  
      # Draw snakes
      for index, snake of snakes
        @context.fillStyle = if snake.id == @id then 'rgb(170,0,0)' else 'rgb(0,0,0)'
        if snake.id == @id
          $("#kills").html("Kills: #{snake.kills}")
          $("#goodies").html("Goodies: #{snake.goodies}")
          $("#deaths").html("Deaths: #{snake.deaths}")
          score = snake.kills + snake.goodies * 2 - snake.deaths
          $("#score").html("Score: #{score}")
        for element in snake.elements
          x = element.x * 10
          y = element.y * 10
          @context.fillRect(x, y, 9, 9)
)