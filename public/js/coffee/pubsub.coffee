define( ->
  topics = {}
  
  ( id )->
    callbacks = null
    method = null 
    topic = id && topics[ id ]
    if !topic 
      callbacks = jQuery.Callbacks()
      topic = 
        publish: callbacks.fire
        subscribe: callbacks.add
        unsubscribe: callbacks.remove
      if id 
        topics[ id ] = topic
    topic
)