function isUndefined (value) {
    return value === undefined
  }
  
function isNotValidSting (value) {
    return typeof value !== "string" || value.trim().length === 0 || value === ""
  }
  
function isNotValidInteger (value) {
    return typeof value !== "number" || value < 0 || value % 1 !== 0
  }

function isValidPassword (value) {
    const passwordPattern = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,16}/
    return passwordPattern.test(value);
  }

function isValidName (value) {
    const namePattern = /^[\p{L}\p{N}]{2,10}$/u
    return namePattern.test(value);
  }



  module.exports = {
    isUndefined,
    isNotValidSting,
    isNotValidInteger,
    isValidPassword,
    isValidName,
  }