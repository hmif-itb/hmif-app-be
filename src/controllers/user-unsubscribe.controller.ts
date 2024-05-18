import {
  deleteUserUnsubscribeCategory,
  getListUserUnsubscribeCategory,
  getUserUnsubscribeCategory,
  postListUserUnsubcribeCategory,
  postUserUnsubcribeCategory,
} from '~/repositories/user-unsubscribe.repo';
import { createAuthRouter } from './router-factory';
import { db } from '~/db/drizzle';
import {
  getUserUnsubscribeCategoryRoute,
  getListUserUnsubscribeCategoryRoute,
  postUserUnsubscribeCategoryRoute,
  postListUserUnsubscribeCategoryRoute,
  deleteListUserUnsubscribeRoute,
  deleteUserUnsubscribeCategoryRoute,
} from '~/routes/user-unsubscribe.route';
import { PostUserUnsubscribeCategorySchema } from '~/types/user-unsubscribe.types';
import { z } from 'zod';

export const userUnsubscribeRouter = createAuthRouter();

userUnsubscribeRouter.openapi(getUserUnsubscribeCategoryRoute, async (c) => {
  const { id } = c.var.user;
  const { categoryId } = c.req.valid('param');

  const category = await getUserUnsubscribeCategory(db, {
    userId: id,
    categoryId,
  });

  if (!category) {
    return c.json(
      { error: `User is subscribed to the category with id ${categoryId}!` },
      400,
    );
  }

  const response = {
    ...category,
    unsubscribed: true,
  };
  return c.json(response, 200);
});

userUnsubscribeRouter.openapi(
  getListUserUnsubscribeCategoryRoute,
  async (c) => {
    const { id } = c.var.user;

    try {
      const categories = await getListUserUnsubscribeCategory(db, id);
      const categoriesArray = categories.map((category) => category.categoryId);

      const data = {
        userId: id,
        categoryId: categoriesArray,
      };
      return c.json(data, 200);
    } catch (e) {
      return c.json({ error: 'Something went wrong!' }, 500);
    }
  },
);

userUnsubscribeRouter.openapi(postUserUnsubscribeCategoryRoute, async (c) => {
  const { id } = c.var.user;
  const { categoryId } = c.req.valid('json');
  const data = {
    userId: id,
    categoryId,
  };

  const requiredToSubscribe = false; // TODO: check if category is required
  if (requiredToSubscribe) {
    return c.json({ error: 'Subscription to this category is required!' }, 400);
  }

  try {
    const res = await postUserUnsubcribeCategory(db, data);
    return c.json(res, 201);
  } catch (e) {
    return c.json({ error: 'Something went wrong!' }, 500);
  }
});

userUnsubscribeRouter.openapi(
  postListUserUnsubscribeCategoryRoute,
  async (c) => {
    const { id } = c.var.user;
    const categoryIds = c.req.valid('json').categoryId;

    const subsNotRequired: Array<
      z.infer<typeof PostUserUnsubscribeCategorySchema>
    > = [];
    const subsRequired: Array<
      z.infer<typeof PostUserUnsubscribeCategorySchema>
    > = [];
    categoryIds.forEach((categoryId) => {
      // TODO: CHECK IF CATEGORY IS REQUIRED. IF NOT, ADD data TO subsNotRequired. IF YES, ADD categoryId TO subsRequired
      const data = {
        userId: id,
        categoryId,
      };
    });

    if (subsNotRequired.length === 0) {
      return c.json({ error: 'All categories are required!' }, 400);
    }

    try {
      const res = await postListUserUnsubcribeCategory(db, subsNotRequired);
      const returnObj = {
        ...res,
        requiredSubscriptions: subsRequired,
      };
      return c.json(returnObj, 201);
    } catch (e) {
      return c.json({ error: 'Something went wrong!' }, 500);
    }
  },
);

userUnsubscribeRouter.openapi(deleteUserUnsubscribeCategoryRoute, async (c) => {
  const { id } = c.var.user;
  const { categoryId } = c.req.valid('json');

  try {
    const res = await deleteUserUnsubscribeCategory(
      db,
      {
        userId: id,
        categoryId,
      },
      id,
    );

    if (!res) {
      return c.json(
        { error: 'User is already subscribed to that category!' },
        400,
      );
    }

    return c.json(res, 201);
  } catch (e) {
    return c.json({ error: 'Something went wrong!' }, 500);
  }
});
