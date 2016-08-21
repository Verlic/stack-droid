var ask = require('./lib/ask');

module.exports = function(context) {
  return {
    ask: function(req, res) {
      try {
        ask(req, res);
      } catch (queryError) {
        return res.text('An error has occurred while trying to get answers from StackOverflow.').send();
      }
    }
  }
};
