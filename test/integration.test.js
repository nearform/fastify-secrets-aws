'use strict'

const { test, after } = require('node:test')
const uuid = require('uuid')
const Fastify = require('fastify')
const { SecretsManager, DeleteSecretCommand, CreateSecretCommand } = require('@aws-sdk/client-secrets-manager')

const FastifySecrets = require('../')

const SECRET_NAME = uuid.v4()
const SECRET_CONTENT = uuid.v4()

const client = new SecretsManager()

function createSecret() {
  return client.send(
    new CreateSecretCommand({
      Name: SECRET_NAME,
      SecretString: SECRET_CONTENT
    })
  )
}

after(function deleteSecret() {
  return client.send(
    new DeleteSecretCommand({
      SecretId: SECRET_NAME,
      ForceDeleteWithoutRecovery: true
    })
  )
})

test('integration', async (t) => {
  t.plan(1)

  await createSecret()

  const fastify = Fastify({
    logger: process.env.TEST_LOGGER || false
  })

  fastify.register(FastifySecrets, {
    secrets: {
      test: SECRET_NAME
    }
  })

  await fastify.ready()

  t.assert.deepStrictEqual(fastify.secrets.test, SECRET_CONTENT, 'decorates fastify with secret content')
})
