require(["libs/domReady", "cs!coffee/canvas", "cs!coffee/server", "cs!coffee/controls", "cs!coffee/top"], (domReady, Canvas, Server, Controls, Top) ->
  domReady ->
    canvas   = new Canvas("#stage")
    server   = new Server()
    controls = new Controls()
    top = new Top("#top")
)
