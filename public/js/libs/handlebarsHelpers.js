Handlebars.registerHelper('forin', function(context, options) {
  var fn = options.fn, inverse = options.inverse;
  var ret = "";

  if(context) {
    for (var prop in context) {
      ret = ret + fn(context[prop]);
    }
  } else {
    ret = inverse(this);
  }
  return ret;
});