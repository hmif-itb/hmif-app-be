import { calendarCron } from './calendar-cron';

export function setupCron() {
  if (process.env.NODE_ENV === 'production') {
    calendarCron.start();
  }
}
