import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { EnvSchema } from '../src/configs/env.schema';
import { isDevLoginEnabled } from '../src/lib/dev-login';

// The variables production must already have; everything else has a default.
const required = {
  DATABASE_URL: 'postgres://user:pass@db.example.test:5432/hmif',
  SMTP_HOST: 'smtp.example.test',
  SMTP_PORT: '465',
  SMTP_PASS: 'x',
  GOOGLE_CLIENT_ID: 'x',
  GOOGLE_CLIENT_SECRET: 'x',
  GOOGLE_CALLBACK_URL: 'https://app.example.test/callback',
  JWT_SECRET: 'x',
  TOKEN_EXPIRATION: '3600',
  // Their defaults ('not-specified') aren't URLs, so these must be set too.
  R2_ENDPOINT: 'https://r2.example.test',
  R2_PUBLIC_URL: 'https://files.example.test',
};

test('production defaults: test login off, every interface', () => {
  const env = EnvSchema.parse(required);
  assert.equal(env.APP_ENV, 'production');
  assert.equal(env.ENABLE_TEST_LOGIN, false);
  assert.equal(env.LISTEN_HOST, undefined);
  assert.equal(isDevLoginEnabled(env), false);
});

test('unexpected values never stop the API from starting and never enable test login', () => {
  const env = EnvSchema.parse({
    ...required,
    NODE_ENV: 'staging',
    APP_ENV: 'prod',
    ENABLE_TEST_LOGIN: '1',
    DEV_LOGIN_EMAIL: 'dev@example.test',
    DEV_LOGIN_PASSWORD_HASH: 'salt:hash',
  });
  assert.equal(env.ENABLE_TEST_LOGIN, false);
  assert.equal(isDevLoginEnabled(env), false);
});

test('the shared staging host can turn test login on explicitly', () => {
  const env = EnvSchema.parse({
    ...required,
    APP_ENV: 'staging',
    ENABLE_TEST_LOGIN: 'true',
    DEV_LOGIN_EMAIL: 'dev@example.test',
    DEV_LOGIN_PASSWORD_HASH: 'salt:hash',
    LISTEN_HOST: '127.0.0.1',
  });
  assert.equal(isDevLoginEnabled(env), true);
  assert.equal(env.LISTEN_HOST, '127.0.0.1');
});
