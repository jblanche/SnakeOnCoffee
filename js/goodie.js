var Goodie, config;

config = require('./config');

exports.Goodie = Goodie = (function() {

  function Goodie() {
    this.x = Math.floor(Math.random() * config.STAGE_WIDTH);
    this.y = Math.floor(Math.random() * config.STAGE_HEIGHT);
    this.age = 0;
  }

  return Goodie;

})();
