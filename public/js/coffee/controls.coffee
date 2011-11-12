define(["cs!coffee/pubsub"], (PubSub)->
  class Controls 
    constructor: ->
      $(document).keydown (event) =>
        key = if event.keyCode then event.keyCode else event.which
        switch key
          when 37 then @sendDirection "left"
          when 38 then @sendDirection "up"
          when 39 then @sendDirection "right"
          when 40 then @sendDirection "down"
        event.stopPropagation();
        event.preventDefault();
    
    sendDirection: (direction) ->
      PubSub('Direction').publish(direction)
)