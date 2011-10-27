require(["libs/domReady", "cs!coffee/canvas", "cs!coffee/server", "cs!coffee/controls"], (domReady, Canvas, Server, Controls) ->
  domReady ->
    canvas   = new Canvas("#stage")
    server   = new Server()
    controls = new Controls()
)
