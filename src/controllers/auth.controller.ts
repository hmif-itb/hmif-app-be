import 'dotenv/config';
import { deleteCookie, setCookie } from 'hono/cookie';
import { sign } from 'hono/jwt';
import { env } from '~/configs/env.config';
import { db } from '~/db/drizzle';
import {
  findUserByEmail,
  getUserAndUpdatePicture,
  getUserGroups,
  updateUserLastLogin,
} from '~/repositories/auth.repo';
import { getUserRoles } from '~/repositories/user-role.repo';
import {
  GoogleTokenDataSchema,
  GoogleUserSchema,
  JWTPayloadSchema,
} from '~/types/login.types';
import {
  authCallbackRoute,
  getUserGroupsRoute,
  loginAccessTokenRoute,
  loginBypassRoute,
  loginRoute,
  logoutRoute,
  selfRoute,
} from '../routes/auth.route';
import { createAuthRouter, createRouter } from './router-factory';

export const loginRouter = createRouter();
export const loginProtectedRouter = createAuthRouter();

const generateJWT = async (payload: object) => {
  const now = Date.now();
  return await sign(
    {
      ...payload,
      exp: now.valueOf() / 1000 + parseInt(env.TOKEN_EXPIRATION),
    },
    env.JWT_SECRET,
  );
};

loginRouter.openapi(loginRoute, async (c) => {
  const authorizationUrl = new URL(
    'https://accounts.google.com/o/oauth2/v2/auth',
  );

  // Make sure you define all of the google env in your .env file
  authorizationUrl.searchParams.set('client_id', env.GOOGLE_CLIENT_ID || '');
  authorizationUrl.searchParams.set(
    'redirect_uri',
    env.GOOGLE_CALLBACK_URL || '',
  );
  authorizationUrl.searchParams.set('prompt', 'consent');
  authorizationUrl.searchParams.set('response_type', 'code');
  authorizationUrl.searchParams.set('scope', 'openid email profile');
  authorizationUrl.searchParams.set('access_type', 'offline');

  return c.redirect(authorizationUrl.toString(), 302); // Redirect the user to Google Login
});

loginRouter.openapi(loginAccessTokenRoute, async (c) => {
  try {
    const { accessToken } = c.req.valid('json');
    const userInfoResponse = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    const userInfo = GoogleUserSchema.parse(await userInfoResponse.json());
    // Find user in db, if not found return forbidden
    const { email, picture } = userInfo;
    const user = await getUserAndUpdatePicture(db, email, picture);
    if (!user) {
      return c.json(
        {
          error: 'User not found in database',
        },
        401,
      );
    }

    // Create cookie
    const tokenPayload = JWTPayloadSchema.parse(user);
    const token = await generateJWT(tokenPayload);

    void updateUserLastLogin(db, user.id);

    setCookie(c, 'hmif-app.access-cookie', token, {
      path: '/',
      secure: true,
      httpOnly: true,
      maxAge: parseInt(env.TOKEN_EXPIRATION),
      sameSite: 'None',
    });
    return c.json(tokenPayload, 200);
  } catch (err) {
    return c.json(
      {
        error: err,
      },
      500,
    );
  }
});

loginRouter.openapi(authCallbackRoute, async (c) => {
  const { code } = c.req.valid('query');

  const tokenEndpoint = new URL('https://accounts.google.com/o/oauth2/token');
  tokenEndpoint.searchParams.set('code', code);
  tokenEndpoint.searchParams.set('grant_type', 'authorization_code');

  // Make sure you define all of the google env in your .env file
  tokenEndpoint.searchParams.set('client_id', env.GOOGLE_CLIENT_ID || '');
  tokenEndpoint.searchParams.set(
    'client_secret',
    env.GOOGLE_CLIENT_SECRET || '',
  );
  tokenEndpoint.searchParams.set('redirect_uri', env.GOOGLE_CALLBACK_URL || '');

  // Fetch Token from Google Token endpoint and parse it into GoogleTokenDataSchema
  const tokenResponse = await fetch(
    tokenEndpoint.origin + tokenEndpoint.pathname,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenEndpoint.searchParams.toString(),
    },
  );
  const tokenData = GoogleTokenDataSchema.parse(await tokenResponse.json());

  // Fetch User Info from Google User Info endpoint and parse it into GoogleUserSchema
  const userInfoResponse = await fetch(
    'https://www.googleapis.com/oauth2/v2/userinfo',
    {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    },
  );
  const userInfo = GoogleUserSchema.parse(await userInfoResponse.json());
  // Find user in db, if not found return forbidden
  const { email, picture } = userInfo;
  const user = await findUserByEmail(db, email);
  if (!user) {
    return c.json(
      {
        error: 'User not found in database',
      },
      401,
    );
  }

  void updateUserLastLogin(db, user.id);

  // Create cookie
  const tokenPayload = JWTPayloadSchema.parse({ ...user, picture });
  const token = await generateJWT(tokenPayload);

  setCookie(c, 'hmif-app.access-cookie', token, {
    path: '/',
    secure: true,
    httpOnly: true,
    maxAge: parseInt(env.TOKEN_EXPIRATION),
    sameSite: 'None',
  });
  return c.json(tokenPayload, 200);
});

loginRouter.openapi(loginBypassRoute, async (c) => {
  const { token, nim } = c.req.valid('query');

  if (token !== env.LOGIN_BYPASS_KEY) {
    return c.json(
      {
        error: 'Invalid token',
      },
      401,
    );
  }

  const user = await findUserByEmail(db, `${nim}@std.stei.itb.ac.id`);
  if (!user) {
    return c.json(
      {
        error:
          'User not found in database, please run seeder with the file from Google Drive',
      },
      401,
    );
  }
  const tokenPayload = JWTPayloadSchema.parse(user);
  const jwtToken = await generateJWT(tokenPayload);
  setCookie(c, 'hmif-app.access-cookie', jwtToken, {
    path: '/',
    secure: true,
    httpOnly: true,
    maxAge: parseInt(env.TOKEN_EXPIRATION),
    sameSite: 'None',
  });
  return c.json(tokenPayload, 200);
});

loginProtectedRouter.openapi(logoutRoute, async (c) => {
  deleteCookie(c, 'hmif-app.access-cookie');
  return c.json({}, 200);
});

loginProtectedRouter.openapi(selfRoute, async (c) => {
  const user = c.var.user;
  void updateUserLastLogin(db, user.id);
  const roles = await getUserRoles(db, user.id);
  return c.json({ ...user, roles }, 200);
});

loginProtectedRouter.openapi(getUserGroupsRoute, async (c) => {
  const user = c.var.user;
  const groups = await getUserGroups(db, user.id);
  return c.json(groups, 200);
});
