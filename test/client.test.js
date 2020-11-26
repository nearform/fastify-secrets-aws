'use strict'

const { test, beforeEach } = require('tap')
const sinon = require('sinon')
const proxyquire = require('proxyquire')

class Stub {
  getSecretValue() {}
}

const getSecretValuePromise = sinon.stub()

const getSecretValue = sinon.stub(Stub.prototype, 'getSecretValue').returns({
  promise: getSecretValuePromise
})

const AwsClient = proxyquire('../lib/client', {
  'aws-sdk': {
    SecretsManager: Stub
  }
})

beforeEach(async () => {
  getSecretValuePromise.reset()
})

test('get', (t) => {
  t.plan(3)

  t.test('SecretString', async (t) => {
    t.plan(3)

    const client = new AwsClient()
    getSecretValuePromise.resolves({
      SecretString: 'secret payload'
    })

    const secret = await client.get('secret/name')

    t.ok(getSecretValue.called, 'calls getSecretValue')
    t.ok(
      getSecretValue.calledWith({
        SecretId: 'secret/name'
      }),
      'provides name as SecretId to getSecretValue'
    )
    t.equal(secret, 'secret payload', 'extracts SecretString')
  })

  t.test('SecretBinary', async (t) => {
    t.plan(3)

    const client = new AwsClient()
    getSecretValuePromise.resolves({
      SecretBinary: Buffer.from('secret payload').toString('base64')
    })

    const secret = await client.get('secret/name')

    t.ok(getSecretValue.called, 'calls getSecretValue')
    t.ok(
      getSecretValue.calledWith({
        SecretId: 'secret/name'
      }),
      'provides name as SecretId to getSecretValue'
    )
    t.equal(secret, 'secret payload', 'extracts SecretBinary')
  })

  t.test('sdk error', async (t) => {
    t.plan(1)
    const client = new AwsClient()

    getSecretValuePromise.rejects(new Error())

    const promise = client.get('secret/name')

    await t.rejects(promise, 'throws error')
  })
})
