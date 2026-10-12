import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { listenAddress } from '../src/lib/listen';

test('without LISTEN_HOST the server listens on every interface, as containers need', () => {
  assert.deepEqual(listenAddress({ PORT: 5000 }), {
    port: 5000,
    hostname: undefined,
  });
});

test('LISTEN_HOST pins the server to one interface, as the shared staging host does', () => {
  assert.deepEqual(listenAddress({ PORT: 5000, LISTEN_HOST: '127.0.0.1' }), {
    port: 5000,
    hostname: '127.0.0.1',
  });
});
