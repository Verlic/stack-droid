var htmlentities = require('ent');

module.exports = function toEscapedMarkdown(markdown) {
  return htmlentities.decode(markdown);
};
