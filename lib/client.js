'use strict'

const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager')

class AwsClient {
  constructor() {
    this.sdk = new SecretsManagerClient()
  }

  async get(name) {
    try {
      const command = new GetSecretValueCommand({ SecretId: name })
      const data = await this.sdk.send(command)
      if ('SecretString' in data) {
        return data.SecretString
      } else {
        return Buffer.from(data.SecretBinary, 'base64').toString('utf8')
      }
    } catch (err) {
      throw new Error(`Secret not found: ${name}`)
    }
  }
}

module.exports = AwsClient
