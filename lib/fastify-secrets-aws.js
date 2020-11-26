'use strict'

const { buildPlugin } = require('fastify-secrets-core')

const AwsClient = require('./client')

module.exports = buildPlugin(AwsClient, {
  name: 'fastify-secrets-aws'
})
