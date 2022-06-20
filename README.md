# Fastify Secrets AWS

[![ci](https://github.com/nearform/fastify-secrets-aws/actions/workflows/ci.yml/badge.svg)](https://github.com/nearform/fastify-secrets-aws/actions/workflows/ci.yml)

Fastify secrets plugin for [AWS Secrets Manager](https://docs.aws.amazon.com/secretsmanager).

## Installation

```
npm install --save fastify-secrets-aws
```

## Usage

### Get permissions to access AWS Secrets Manager

In order to be able to read from AWS Secrets Manager you will need some permissions.

You will also probably manage permissions in different ways in local dev and production environment.

#### Local dev environment

In general you may want to use a different secrets manager on your local machine (i.e. `fastify-secrets-env` to read secrets from env variables).

If you want to run `fastify-secrets-aws` in the local environment you will need to follow these steps:

1. Create a AWS user with programmatic access via IAM
2. Grant the new user the policy `SecretsManagerReadWrite`
3. Store the access key id, secret access key and region in your local AWS configuration
4. Ensure that the configuration is loaded by the SDK, which may require setting the `AWS_SDK_LOAD_CONFIG` environment variable to a truthy value or populate the configuration via environment variables altogether
5. You're ready to run your app

#### Production environment

If you already have a AWS user you will need to give it access to Secrets Manager by adding the policy `SecretsManagerReadWrite`.

Otherwise you will need to create a new user with access to Secrets Manager by adding it the same policy `SecretsManagerReadWrite`.

### Add plugin to your fastify instance

```js
const FastifySecrets = require('fastify-secrets-aws')

fastify.register(FastifySecrets, {
  secrets: {
    dbPassword: 'secret-name'
  }
})
```

`secret-name` is the name of the secret as created in AWS Secrets Manager.

### Access you secrets

```js
await fastify.ready()

console.log(fastify.secrets.dbPassword) // content of 'secret-name'
```

### Plugin options

The plugin only expect the `secrets` object in the options.

It is a map of keys and resource ids for the secrets. `fastify-secrets-aws` will decorate the fastify server with a `secrets` object where keys will be the same keys of the options and the value will be the content of the secret as fetched from AWS Secrets Manager

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md)

## License

Copyright NearForm Ltd 2020. Licensed under the [Apache-2.0 license](http://www.apache.org/licenses/LICENSE-2.0).
