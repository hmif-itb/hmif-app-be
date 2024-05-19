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
import {
  GetUserUnsubscribeCategorySchema,
  PostUserUnsubscribeCategorySchema,
} from '~/types/user-unsubscribe.types';
import { z } from 'zod';
import { checkRequired, isCategoryExists } from '~/repositories/category.repo';
import { CategoryNotFoundSchema, CategorySchema } from '~/types/category.types';

export const userUnsubscribeRouter = createAuthRouter();

userUnsubscribeRouter.openapi(getUserUnsubscribeCategoryRoute, async (c) => {
  const { id } = c.var.user;
  const { categoryId } = c.req.valid('param');

  try {
    const categoryExist = await isCategoryExists(db, categoryId);
    if (!categoryExist) {
      return c.json(
        { error: `Category with id ${categoryId} does not exist!` },
        400,
      );
    }

    const category = await getUserUnsubscribeCategory(db, {
      userId: id,
      categoryId,
    });

    let response = {};

    if (!category) {
      response = {
        userId: id,
        categoryId,
        unsubscribed: false,
      };
    } else {
      response = {
        ...category,
        unsubscribed: true,
      };
    }

    return c.json(response, 200);
  } catch (e) {
    return c.json({ error: 'Something went wrong!' }, 500);
  }
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

  try {
    const { requiredPush } = await checkRequired(db, categoryId);
    if (requiredPush === null) {
      return c.json(
        { error: `Category with id ${categoryId} does not exist!` },
        400,
      );
    }

    if (requiredPush) {
      return c.json(
        { error: 'Subscription to this category is required!' },
        400,
      );
    }

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

    const subsNotRequired: string[] = [];
    const subsRequired: string[] = [];
    const categoriesNotFound: string[] = [];

    const checkRequiredPromises: Array<
      Promise<z.infer<typeof CategoryNotFoundSchema | typeof CategorySchema>>
    > = [];

    categoryIds.forEach((categoryId) => {
      // TODO: CHECK IF CATEGORY IS REQUIRED. IF NOT, ADD data TO subsNotRequired. IF YES, ADD categoryId TO subsRequired
      checkRequiredPromises.push(checkRequired(db, categoryId));
    });

    const res = await Promise.allSettled(checkRequiredPromises);
    res.forEach((result) => {
      if (result.status === 'fulfilled') {
        // Category was not found
        if (result.value.id === null) {
          categoriesNotFound.push(result.value.id);
        } else if (result.value.requiredPush) {
          subsRequired.push(result.value.id);
        } else {
          subsNotRequired.push(result.value.id);
        }
      }
    });

    if (subsNotRequired.length === 0) {
      return c.json({ error: 'All categories are required!' }, 400);
    }

    const categoriesToUnsubscribe: Array<
      z.infer<typeof PostUserUnsubscribeCategorySchema>
    > = [];

    subsNotRequired.forEach((categoryId) => {
      categoriesToUnsubscribe.push({
        userId: id,
        categoryId,
      });
    });

    try {
      const res = await postListUserUnsubcribeCategory(
        db,
        categoriesToUnsubscribe,
      );
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
