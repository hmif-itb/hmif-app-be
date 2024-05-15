import { PostgresError } from 'postgres';
import { db } from '~/db/drizzle';
import {
  createInfo,
  createReadInfo,
  deleteInfo,
  // getListInfos,
} from '~/repositories/info.repo';
import {
  createInfoRoute,
  deleteInfoRoute,
  postReadInfoRoute,
} from '~/routes/info.route';
import { InfoSchema } from '~/types/info.types';
import { listInfoRoute } from '../routes/info.route';
import { createAuthRouter } from './router-factory';

export const infoRouter = createAuthRouter();

infoRouter.openapi(postReadInfoRoute, async (c) => {
  const { id } = c.var.user;
  const { infoId } = c.req.valid('param');

  try {
    const data = {
      userId: id,
      infoId,
    };

    await createReadInfo(db, data);
    return c.json({}, 201);
  } catch (err) {
    if (err instanceof PostgresError)
      return c.json({ error: 'User have already read this info' }, 400);
    return c.json(err, 400);
  }
});

infoRouter.openapi(createInfoRoute, async (c) => {
  const { mediaUrls, forAngkatan, forCategories, forCourses, ...data } =
    c.req.valid('json');
  const { id } = c.var.user;

  try {
    const info = InfoSchema.parse(
      await createInfo(
        db,
        { ...data, creatorId: id },
        mediaUrls,
        forAngkatan,
        forCategories,
        forCourses,
      ),
    );
    return c.json(info, 201);
  } catch (err) {
    if (err instanceof PostgresError)
      return c.json({ error: err.message }, 400);
    console.log(err);
    return c.json({ error: 'Something went wrong' }, 400);
  }
});

infoRouter.openapi(deleteInfoRoute, async (c) => {
  try {
    const { infoId } = c.req.valid('param');
    const info = await deleteInfo(db, infoId);
    if (!info) {
      return c.json({ error: 'Info not found' }, 404);
    }
    return c.json({}, 200);
  } catch (err) {
    return c.json(err, 500);
  }
});

// infoRouter.openapi(listInfoRoute, async (c) => {
//   const infos = await getListInfos(db, c.req.valid('query'), c.var.user.id);
//   return c.json(
//     {
//       infos,
//     },
//     200,
//   );
// });
