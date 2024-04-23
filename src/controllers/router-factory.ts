import { Hook, OpenAPIHono } from '@hono/zod-openapi';
import { User } from '~/db/schema';

const defaultHook: Hook<any, any, any, any> = (result, c) => {
  if (!result.success) {
    return c.json({ errors: result.error.flatten() }, 400);
  }
};

/**
 *
 * @returns basic router with no middleware
 */
export function createRouter() {
  return new OpenAPIHono({ defaultHook });
}

/**
 * For router that use this function, it will have user object in `c.var.user`.
 * @returns router with auth middleware.
 */
export function createAuthRouter() {
  const authRouter = new OpenAPIHono<{
    Variables: {
      user: User;
    };
  }>({ defaultHook });

  // TODO: add jwt middleware

  // TODO: set proper user
  authRouter.use(async (c, next) => {
    c.set('user', {
      id: 'djsah8dashko2hdksa',
      nim: '18221000',
      email: 'test@example.com',
      full_name: 'Test User',
      jurusan: 'STI',
      asal_kampus: 'Ganesha',
      angkatan: 2021,
      jenis_kelamin: 'Laki-laki',
      status_keanggotaan: 'aktif',
      createdAt: new Date(),
    });
    await next();
  });

  return authRouter;
}
