const httpStatus = require("./httpStatus");
// custom error handling
class EmailExisted extends Error {
  constructor(message) {
    super(message)
    this.name = this.constructor.name
    this.status = httpStatus.BAD_REQUEST
  }
  statusCode() {
    return this.status
  }
}

class EmailOrPasswordIncorrect extends Error {
  constructor(message) {
    super(message)
    this.name = this.constructor.name
    this.status = httpStatus.UNAUTHORIZED
  }
  statusCode() {
    return this.status
  }
}

module.exports = {
  EmailExisted,
  EmailOrPasswordIncorrect
}