import { db } from '~/db/drizzle';
import { createAuthRouter } from './router-factory';
import {
  getUserAcademic,
  getUserProfile,
} from '~/repositories/user-profile.repo';
import {
  getUserAcademicRoute,
  getUserProfileRoute,
} from '~/routes/user-profile.route';

export const userProfileRoute = createAuthRouter();

userProfileRoute.openapi(getUserAcademicRoute, async (c) => {
  const { semester, semesterCodeTaken, semesterYearTaken } =
    await getUserAcademic(db, c.var.user.id);
  const resp = {
    semester: semester,
    semesterYear: semesterYearTaken,
    semesterCode: semesterCodeTaken,
  };
  return c.json(resp, 200);
});

userProfileRoute.openapi(getUserProfileRoute, async (c) => {
  const profile = await getUserProfile(db, c.var.user.id);
  if (!profile) {
    throw new Error('User not found');
  }
  return c.json(profile, 200);
});
