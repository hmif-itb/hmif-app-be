import { db } from '~/db/drizzle';
import { createAuthRouter } from './router-factory';
import { getUserAcademic } from '~/repositories/user-profile.repo';
import {
  getUserAcademicRoute,
  getUserProfileRoute,
} from '~/routes/user-profile.route';

export const userProfileRoute = createAuthRouter();

userProfileRoute.openapi(getUserAcademicRoute, async (c) => {
  const user = c.var.user;
  const { semester, semesterCodeTaken, semesterYearTaken } =
    await getUserAcademic(db, user);
  return c.json(
    {
      semester,
      semesterYear: semesterYearTaken,
      semesterCode: semesterCodeTaken,
    },
    200,
  );
});

userProfileRoute.openapi(getUserProfileRoute, async (c) => {
  const user = c.var.user;
  return c.json(user, 200);
});
