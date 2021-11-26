/* eslint-disable linebreak-style */
class UncorectDataError extends Error {
  constructor(message) {
    console.log('it work');
    super(message);
    this.statusCode = 400;
  }
}

module.exports = UncorectDataError;
