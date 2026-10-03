import { scryptSync, timingSafeEqual } from 'node:crypto';

export function isDevLoginEnabled(config: {
  NODE_ENV: string;
  DEV_LOGIN_EMAIL?: string;
  DEV_LOGIN_PASSWORD_HASH?: string;
}) {
  return (
    config.NODE_ENV === 'development' &&
    Boolean(config.DEV_LOGIN_EMAIL && config.DEV_LOGIN_PASSWORD_HASH)
  );
}

export function verifyDevPassword(password: string, hash: string) {
  const [salt, digest] = hash.split(':');
  if (!salt || !digest || !/^[a-f0-9]{64}$/.test(digest)) return false;
  const expected = Buffer.from(digest, 'hex');
  const actual = scryptSync(password, salt, expected.length);
  return timingSafeEqual(actual, expected);
}
