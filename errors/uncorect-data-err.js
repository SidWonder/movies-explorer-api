/* eslint-disable linebreak-style */
class UncorectDataError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 400;
  }
}

module.exports = UncorectDataError;
