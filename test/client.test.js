'use strict'

const { test, beforeEach } = require('tap')
const sinon = require('sinon')
const proxyquire = require('proxyquire')

class SecretsManagerClientStub {
  send() {}
}
class GetSecretValueCommandStub {
  constructor(SecretId) {
    this.input = SecretId
  }
}

const getSecretValuePromise = sinon.stub()
const GSVCStub = sinon.stub(GetSecretValueCommandStub)

const SMStub = sinon.stub(SecretsManagerClientStub.prototype, 'send').resolves({ SecretString: 'secret payload' })

const AwsClient = proxyquire('../lib/client', {
  '@aws-sdk/client-secrets-manager': {
    GetSecretValueCommand: GetSecretValueCommandStub,
    SecretsManagerClient: SecretsManagerClientStub
  }
})

beforeEach(async () => {
  getSecretValuePromise.reset()
})

test('get', (t) => {
  t.plan(3)

  t.test('SecretString', async (t) => {
    t.plan(4)

    const client = new AwsClient()

    const secret = await client.get('secret/name')
    t.ok(GSVCStub.call, 'new instance of GetSecretValueCommand')
    t.ok(SMStub.called, 'calls send')
    t.ok(SMStub.calledWith(sinon.match({ input: { SecretId: 'secret/name' } })), 'provides name as SecretId to send')
    t.equal(secret, 'secret payload', 'extracts SecretString')
  })

  t.test('SecretBinary', async (t) => {
    t.plan(3)

    const client = new AwsClient()

    const secret = await client.get('secret/name')

    t.ok(SMStub.called, 'calls getSecretValue')
    t.ok(
      SMStub.calledWith(sinon.match({ input: { SecretId: 'secret/name' } })),
      'provides name as SecretId to getSecretValue'
    )
    t.equal(secret, 'secret payload', 'extracts SecretBinary')
  })

  t.test('sdk error', async (t) => {
    t.plan(1)
    const client = new AwsClient()

    SMStub.rejects(new Error())

    const promise = client.get('secret/name')

    await t.rejects(promise, 'throws error')
  })
})
