define(["cs!coffee/pubsub", "libs/handlebars", "text!templates/scores.html"], (PubSub, Handlebars, Source)->
  class Top 
    constructor: (@sel)->
      PubSub('Scores').subscribe(@update)
      @template = Handlebars.compile(Source)

    update: (list) =>
        context = snakes: list
        $(@sel).html(@template(context))
)