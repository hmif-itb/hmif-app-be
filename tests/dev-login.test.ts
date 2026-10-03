import { strict as assert } from 'node:assert';
import { scryptSync } from 'node:crypto';
import { test } from 'node:test';
import { isDevLoginEnabled, verifyDevPassword } from '../src/lib/dev-login.ts';

const hash = `test-salt:${scryptSync('test-password', 'test-salt', 32).toString('hex')}`;
const credentials = {
  DEV_LOGIN_EMAIL: 'dev@example.test',
  DEV_LOGIN_PASSWORD_HASH: hash,
};

test('production and unspecified environments never enable test login', () => {
  for (const NODE_ENV of ['production', 'test', '', 'staging']) {
    assert.equal(isDevLoginEnabled({ NODE_ENV, ...credentials }), false);
  }
  assert.equal(isDevLoginEnabled({ NODE_ENV: 'development' }), false);
  assert.equal(
    isDevLoginEnabled({ NODE_ENV: 'development', ...credentials }),
    true,
  );
});

test('password verification rejects wrong passwords and malformed hashes', () => {
  assert.equal(verifyDevPassword('test-password', hash), true);
  assert.equal(verifyDevPassword('wrong-password', hash), false);
  assert.equal(verifyDevPassword('', hash), false);
  for (const malformed of ['', ':', 'salt:invalid', 'salt:00']) {
    assert.equal(verifyDevPassword('test-password', malformed), false);
  }
});
