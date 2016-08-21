var request = require('request');
var zlib = require('zlib');
var escape = require('./escape');
var askUrl = 'https://api.stackexchange.com/2.2/search/advanced?order=desc&sort=activity&site=stackoverflow&filter=withbody';
var answerUrl = 'https://api.stackexchange.com/2.2/answers/@@ID?order=desc&sort=activity&site=stackoverflow&filter=!GeEyUcJFJeRCA';

module.exports = function ask(req, res) {
  var question = req.params.question;
  var options = {
    encoding: null,
    url : `${askUrl}&q=${question}`
  };

  // Find questions
  request(options, function(err, response) {
    if (err) {
      console.error(err);
      return res.text('An error has occurred while trying to get answers from StackOverflow.').send();
    }

    zlib.gunzip(response.body, function(error, data) {
        if(!error) {
          response.body = data.toString();
        } else {
          console.error(error);
          return res.text('An error has occurred while trying to get answers from StackOverflow.').send();
        }

        var body = JSON.parse(response.body);
        body.items = body.items.filter(function(item) {
          return item.accepted_answer_id;
        });

        if (body.items.length === 0 || !body.items[0].accepted_answer_id) {
          // EMPTY
          return res.text('We could not found any suitable answers.').send();
        }

        // Find the answer
        var questionTitle = escape(body.items[0].title);
        var answer = body.items[0].accepted_answer_id;
        options.url = answerUrl.replace('@@ID', answer);
        request(options, function(err, response) {
          if (err) {
            console.error(err);
            return res.text('An error has occurred while trying to get answers from StackOverflow.').send();
          }

          zlib.gunzip(response.body, function(error, data) {
              if(!error) {
                response.body = data.toString();
              } else {
                console.error(error);
                return res.text('An error has occurred while trying to get answers from StackOverflow.').send();
              }

              var body = JSON.parse(response.body);
              var text = escape(body.items[0].body_markdown);
              text = `# ${questionTitle}\n\n${text}`;
              res.upload('answer.md', text).send();
          });
        });
    });
  });
};
