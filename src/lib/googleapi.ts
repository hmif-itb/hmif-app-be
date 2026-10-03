import { auth } from 'googleapis/build/src/apis/calendar';
import { env } from '~/configs/env.config';

export const googleAuth = new auth.GoogleAuth({
  keyFile: env.GOOGLE_CALENDAR_SECRET_PATH,
  scopes: [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
  ],
});
