require(["libs/domReady", "cs!coffee/canvas", "cs!coffee/server", "cs!coffee/controls", "cs!coffee/top", "cs!coffee/scores"], (domReady, Canvas, Server, Controls, Top, Scores) ->
  domReady ->
    canvas   = new Canvas("#stage")
    server   = new Server()
    controls = new Controls()
    top = new Top("#top")
    scores = new Scores("#scores")
)
