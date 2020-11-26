'use strict'

const { test, teardown } = require('tap')
const uuid = require('uuid')
const Fastify = require('fastify')
const SecretsManager = require('aws-sdk').SecretsManager

const FastifySecrets = require('../')

const SECRET_NAME = uuid.v4()
const SECRET_CONTENT = uuid.v4()

const client = new SecretsManager()

function createSecret() {
  return client
    .createSecret({
      Name: SECRET_NAME,
      SecretString: SECRET_CONTENT
    })
    .promise()
}

teardown(function deleteSecret() {
  return client
    .deleteSecret({
      SecretId: SECRET_NAME,
      ForceDeleteWithoutRecovery: true
    })
    .promise()
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

  t.same(
    fastify.secrets,
    {
      test: SECRET_CONTENT
    },
    'decorates fastify with secret content'
  )
})
