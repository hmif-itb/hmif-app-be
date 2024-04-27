import { loginRoute, authCallbackRoute } from '../routes/login.route';
import { createRouter } from './router-factory';
import 'dotenv/config';
import { env } from '~/configs/env.config';
import { findUserByEmail } from '~/repositories/login.repo';
import { db } from '~/db/drizzle';
import jwt from 'jsonwebtoken';
import {
  JWTPayloadSchema,
  GoogleTokenDataSchema,
  GoogleUserSchema,
} from '~/types/login.types';

export const loginRouter = createRouter();

// All of this function will be moved, right now its just to ensure it works (or not)
function generateJWT(payload: object, secret: string, expiresIn: string) {
  return jwt.sign(payload, secret, { expiresIn });
}

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

loginRouter.openapi(authCallbackRoute, async (c) => {
  const { code } = c.req.valid('query');

  try {
    const tokenEndpoint = new URL('https://accounts.google.com/o/oauth2/token');
    tokenEndpoint.searchParams.set('code', code);
    tokenEndpoint.searchParams.set('grant_type', 'authorization_code');

    // Make sure you define all of the google env in your .env file
    tokenEndpoint.searchParams.set('client_id', env.GOOGLE_CLIENT_ID || '');
    tokenEndpoint.searchParams.set(
      'client_secret',
      env.GOOGLE_CLIENT_SECRET || '',
    );
    tokenEndpoint.searchParams.set(
      'redirect_uri',
      env.GOOGLE_CALLBACK_URL || '',
    );

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
    // console.log(await userInfoResponse.json());
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

    // Create cookie
    const tokenPayload = JWTPayloadSchema.parse({ ...user, picture });
    const cookie = generateJWT(tokenPayload, env.JWT_SECRET, '30 days');
    return c.json(tokenPayload, 200, {
      Location: 'http://localhost:5173', // Todo change url continuation after logging in,
      'Set-Cookie': `hmif-app.access-cookie=${cookie}; Path=/; HttpOnly`,
    });
  } catch (error) {
    return c.json(
      {
        error,
      },
      500,
    );
  }
});
