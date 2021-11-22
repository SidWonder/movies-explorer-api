/* eslint-disable linebreak-style */
const validator = require('validator');

function isURL(url) {
  const result = validator.isURL(url, { require_protocol: true });
  if (result) {
    return url;
  }
  throw new Error('Неправильный URL');
}

module.exports = isURL;
