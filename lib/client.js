'use strict'

const SecretsManager = require('aws-sdk').SecretsManager

class AwsClient {
  constructor() {
    this.sdk = new SecretsManager()
  }

  async get(name) {
    try {
      const data = await this.sdk.getSecretValue({ SecretId: name }).promise()

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
