import { CronJob } from 'cron';
import dayjs from 'dayjs';
import { db } from '~/db/drizzle';
import { CalendarEvent } from '~/db/schema';
import { sendNotificationToAll } from '~/lib/push-manager';
import { getCalendarEventsByTime } from '~/repositories/calendar.repo';
import { getCourseUsersByIds } from '~/repositories/course.repo';
import {
  getAllPushSubscriptions,
  toPushSubscriptionsHash,
} from '~/repositories/push.repo';

type CourseCalendarEvent = Omit<CalendarEvent, 'courseId'> & {
  courseId: string;
};

export const calendarCron = new CronJob('* * * * *', async () => {
  const date = new Date();

  const tomorrow = new Date(date);
  tomorrow.setDate(date.getDate() + 1);
  console.log(
    'Running calendar cron for ',
    dayjs(date).format('DD MMMM YYYY HH:mm'),
  );

  const events = await getCalendarEventsByTime(db, tomorrow);

  const academicEvents: CourseCalendarEvent[] = [];
  const himpunanEvents: CalendarEvent[] = [];

  const allPushSubscriptions = await getAllPushSubscriptions(db);
  const pushSubscriptionsHash = toPushSubscriptionsHash(allPushSubscriptions);

  events.forEach((event) => {
    if (event.courseId !== null) {
      academicEvents.push({ ...event, courseId: event.courseId });
    } else {
      himpunanEvents.push(event);
    }
  });

  himpunanEvents.forEach((event) => {
    const dateStart = dayjs(event.start);
    const start = dateStart.format('HH:mm');
    void sendNotificationToAll(allPushSubscriptions, {
      title: `The event "${event.title}" will occur at ${start} tomorrow, ${dateStart.format('DD MMMM YYYY')}`,
      options: {
        body: event.description,
      },
    });
  });

  const courses = await getCourseUsersByIds(
    db,
    academicEvents.map((event) => event.courseId),
  );

  const coursesHash: Record<string, (typeof courses)[number]> = {};

  courses.forEach((course) => {
    coursesHash[course.id] = course;
  });

  academicEvents.forEach((event) => {
    const course = coursesHash[event.courseId];
    if (!course.userCourses.length) {
      return;
    }
    const start = dayjs(event.start).format('HH:mm');
    const subscriptions = course.userCourses.flatMap(
      (userCourse) => pushSubscriptionsHash[userCourse.userId],
    );
    void sendNotificationToAll(subscriptions, {
      title: `Tomorrow you will have "${event.title}" at ${start} for ${course.code} ${course.name}`,
      options: {
        body: event.description,
      },
    });
  });
});
