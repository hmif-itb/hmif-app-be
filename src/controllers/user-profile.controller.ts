import { db } from '~/db/drizzle';
import { createAuthRouter } from './router-factory';
import { getUserAcademic } from '~/repositories/user-profile.repo';
import { getUserAcademicRoute } from '~/routes/user-profile.route';

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
