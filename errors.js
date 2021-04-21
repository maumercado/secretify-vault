'use strict'

const errors = {
  notValidUrl: (url) => `Invalid url ${url}`,
  missingRequiredParameter: (msg) => msg
}

module.exports = errors
