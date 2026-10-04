import { scryptSync, timingSafeEqual } from 'node:crypto';

export function isDevLoginEnabled(config: {
  APP_ENV?: string;
  ENABLE_TEST_LOGIN?: boolean;
  DEV_LOGIN_EMAIL?: string;
  DEV_LOGIN_PASSWORD_HASH?: string;
}) {
  return (
    (config.APP_ENV === 'development' || config.APP_ENV === 'staging') &&
    config.ENABLE_TEST_LOGIN === true &&
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
