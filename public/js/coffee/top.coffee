define(["cs!coffee/pubsub", "libs/handlebars", "text!templates/topTen.html"], (PubSub, Handlebars, Source)->
  class Top 
    constructor: (@sel)->
      PubSub('TopTen').subscribe(@update)
      @template = Handlebars.compile(Source)

    update: (list) =>
        context = list 
        $(@sel).html(@template(context))
)