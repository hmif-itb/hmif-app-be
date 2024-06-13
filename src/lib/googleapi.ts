import { google } from 'googleapis';
import { env } from '~/configs/env.config';

export const googleAuth = new google.auth.GoogleAuth({
  keyFile: env.GOOGLE_CALENDAR_SECRET_PATH,
  scopes: [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
  ],
});
