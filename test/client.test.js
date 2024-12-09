'use strict'

const { test, beforeEach } = require('node:test')

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

const GSVCStub = sinon.stub(GetSecretValueCommandStub)

const SMStub = sinon.stub(SecretsManagerClientStub.prototype, 'send')

const AwsClient = proxyquire('../lib/client', {
  '@aws-sdk/client-secrets-manager': {
    GetSecretValueCommand: GetSecretValueCommandStub,
    SecretsManagerClient: SecretsManagerClientStub
  }
})

beforeEach(async () => {
  SMStub.reset()
})

test('get', async (t) => {
  await t.test('SecretString', async (t) => {
    const client = new AwsClient()
    SMStub.resolves({ SecretString: 'secret payload' })

    const secret = await client.get('secret/name')
    t.assert.ok(GSVCStub.call, 'new instance of GetSecretValueCommand')
    t.assert.ok(SMStub.called, 'calls send')
    t.assert.ok(
      SMStub.calledWith(sinon.match({ input: { SecretId: 'secret/name' } })),
      'provides name as SecretId to send'
    )
    t.assert.equal(secret, 'secret payload', 'extracts SecretString')
  })

  await t.test('SecretBinary', async (t) => {
    const client = new AwsClient()
    SMStub.resolves({
      SecretBinary: Buffer.from('secret payload').toString('base64')
    })
    const secret = await client.get('secret/name')
    t.assert.ok(SMStub.called, 'calls send')
    t.assert.ok(
      SMStub.calledWith(sinon.match({ input: { SecretId: 'secret/name' } })),
      'provides name as SecretId to send'
    )
    t.assert.equal(secret, 'secret payload', 'extracts SecretBinary')
  })

  await t.test('sdk error', async (t) => {
    const client = new AwsClient()

    SMStub.rejects(new Error())

    const promise = client.get('secret/name')

    await t.assert.rejects(promise, 'throws error')
  })
})
