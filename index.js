'use strict'

const assert = require('assert')
const got = require('got')
const debug = require('debug')('secretify:secretify-vault')
const errors = require('./errors')

function initVault (host, path, token) {
  try {
    assert(token, 'token is a required argument')
    assert(host, 'host is a required argument')
    assert(path, 'path is a required argument')
    assert(path.endsWith('/'), 'path argument must end with /')
    const hostUrl = new URL(host)
    const pathUrl = new URL(path, hostUrl)

    return function fetchSecret (secret, version) {
      try {
        let v
        if (version) {
          v = (version[0] + '').toLowerCase() === 'v' ? version.slice(1) : version
        }
        assert(secret, 'secret is a required argument')
        const vaultUrl = new URL(secret, pathUrl)
        debug('Fetching secret: %s', 'vaultUrl')
        return got(vaultUrl.href, {
          searchParams: v ? { version: v } : {},
          headers: { 'X-VAULT-TOKEN': token },
          parseJson: (text) => {
            const { data } = JSON.parse(text)
            return data
          }
        }).json()
      } catch (err) {
        debug(err)
        throw Error(errors.missingRequiredParameter(err.message))
      }
    }
  } catch (err) {
    debug(err)
    if (err instanceof assert.AssertionError) throw Error(errors.missingRequiredParameter(err.message))
    throw Error(errors.notValidUrl(`${host}${path}`))
  }
}

module.exports = initVault
