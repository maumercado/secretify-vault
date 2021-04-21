'use strict'

const { test } = require('tap')
const initVault = require('.')
const nock = require('nock')

test('initVault does not throw when initialized correctly', ({ plan, doesNotThrow }) => {
  plan(1)
  doesNotThrow(() => initVault('http://example.com', 'testing/secrets/', 'example'))
})

test('initVault returns a function when initialized correctly', ({ plan, ok }) => {
  plan(1)
  ok(typeof initVault('http://example.com', 'testing/secrets/', 'example') === 'function')
})

test('initVault throws an assertion when host argument is missing', ({ plan, throws }) => {
  plan(1)
  throws(() => initVault(undefined, 'testing/secrets/', 'example'))
})

test('initVault throws an assertion when path argument is missing', ({ plan, throws }) => {
  plan(1)
  throws(() => initVault('http://example.com', undefined, 'example'))
})

test('initVault throws an assertion when token argument is missing', ({ plan, throws }) => {
  plan(1)
  throws(() => initVault('http://example.com', 'testing/secrets/'))
})

test('initVault throws an exception when path argument does not end with /', ({ plan, throws }) => {
  plan(1)
  throws(() => initVault('http://example.com', 'testing/secrets', 'example'), 'path argument must end with /')
})

test('initVault throws an exception when host is not a valid url', ({ plan, throws }) => {
  plan(1)
  throws(() => initVault('htp./example.com', 'testing/secrets/', 'example'))
})

test('initVault throws an exception when path is not a valid url', ({ plan, throws }) => {
  plan(1)
  throws(() => initVault('http://example.com', '///~itesting%d34/secrets/', 'example'))
})

test('initVault returning function successfully makes a request to a vault host', ({ throws, plan }) => {
  plan(1)
  const host = 'http://example.com'
  const path = 'testing/secrets/'
  const token = 'example'
  const fetchSecret = initVault(host, path, token)
  throws(() => fetchSecret())
})

test('initVault returning function successfully makes a request to a vault host', async ({ ok, same }) => {
  const host = 'http://example.com'
  const path = 'testing/secrets/'
  const token = 'example'
  const secret = 'foo'

  nock(host, { encodedQueryParams: true })
    .get(`/${path}${secret}`)
    .reply(200, {
      request_id: '6dfa49cc-2079-f6de-fb38-f90c9d3ff488',
      lease_id: '',
      renewable: false,
      lease_duration: 0,
      data: {
        data: { bar: 'precious' },
        metadata: { created_time: '2021-04-21T15:38:54.1817299Z', deletion_time: '', destroyed: false, version: 1 }
      },
      wrap_info: null,
      warnings: null,
      auth: null
    })

  const expectedResponse = {
    data: { bar: 'precious' },
    metadata: { created_time: '2021-04-21T15:38:54.1817299Z', deletion_time: '', destroyed: false, version: 1 }
  }

  const fetchSecret = initVault(host, path, token)
  const secretResponse = await fetchSecret(secret)
  ok(nock.isDone())
  same(expectedResponse, secretResponse)
})

test('initVault returning function successfully makes a request to a vault host with version', async ({ ok, same }) => {
  const host = 'http://example.com'
  const path = 'testing/secrets/'
  const token = 'example'
  const secret = 'foo'
  const version = 'v3'
  const v = '3'
  nock(host, { encodedQueryParams: true })
    .get(`/${path}${secret}`)
    .query({ version: v })
    .reply(200, {
      request_id: '6dfa49cc-2079-f6de-fb38-f90c9d3ff488',
      lease_id: '',
      renewable: false,
      lease_duration: 0,
      data: {
        data: { bar: 'precious' },
        metadata: { created_time: '2021-04-21T15:38:54.1817299Z', deletion_time: '', destroyed: false, version: 3 }
      },
      wrap_info: null,
      warnings: null,
      auth: null
    })

  const expectedResponse = {
    data: { bar: 'precious' },
    metadata: { created_time: '2021-04-21T15:38:54.1817299Z', deletion_time: '', destroyed: false, version: 3 }
  }

  const fetchSecret = initVault(host, path, token)
  const secretResponse = await fetchSecret(secret, version)
  ok(nock.isDone())
  same(expectedResponse, secretResponse)
})

test('initVault returning function successfully parses version and makes a request', async ({ ok, same }) => {
  const host = 'http://example.com'
  const path = 'testing/secrets/'
  const token = 'example'
  const secret = 'foo'
  const version = '3'
  nock(host, { encodedQueryParams: true })
    .get(`/${path}${secret}`)
    .query({ version })
    .reply(200, {
      request_id: '6dfa49cc-2079-f6de-fb38-f90c9d3ff488',
      lease_id: '',
      renewable: false,
      lease_duration: 0,
      data: {
        data: { bar: 'precious' },
        metadata: { created_time: '2021-04-21T15:38:54.1817299Z', deletion_time: '', destroyed: false, version: 3 }
      },
      wrap_info: null,
      warnings: null,
      auth: null
    })

  const expectedResponse = {
    data: { bar: 'precious' },
    metadata: { created_time: '2021-04-21T15:38:54.1817299Z', deletion_time: '', destroyed: false, version: 3 }
  }

  const fetchSecret = initVault(host, path, token)
  const secretResponse = await fetchSecret(secret, version)
  ok(nock.isDone())
  same(expectedResponse, secretResponse)
})
