import { z } from 'zod';
import { db } from '~/db/drizzle';
import { checkRequired, isCategoryExists } from '~/repositories/category.repo';
import {
  deleteUserUnsubscribeCategory,
  getListUserUnsubscribeCategory,
  getUserUnsubscribeCategory,
  postListUserUnsubcribeCategory,
  postUserUnsubcribeCategory,
} from '~/repositories/user-unsubscribe.repo';
import {
  deleteListUserUnsubscribeRoute,
  deleteUserUnsubscribeCategoryRoute,
  getListUserUnsubscribeCategoryRoute,
  getUserUnsubscribeCategoryRoute,
  postListUserUnsubscribeCategoryRoute,
  postUserUnsubscribeCategoryRoute,
} from '~/routes/user-unsubscribe.route';
import { CategoryNotFoundSchema, CategorySchema } from '~/types/category.types';
import {
  DeleteListUserUnsubscribeCategoryResponseSchema,
  DeleteUserUnsubscribeCategorySchema,
  GetUserUnsubscribeCategoryResponseSchema,
  PostUserUnsubscribeCategorySchema,
} from '~/types/user-unsubscribe.types';
import { createAuthRouter } from './router-factory';

export const userUnsubscribeRouter = createAuthRouter();

userUnsubscribeRouter.openapi(getUserUnsubscribeCategoryRoute, async (c) => {
  const { id } = c.var.user;
  const { categoryId } = c.req.valid('param');

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

  let response: z.infer<typeof GetUserUnsubscribeCategoryResponseSchema> = {
    userId: id,
    categoryId,
    unsubscribed: false,
  };

  if (category) {
    response = {
      ...category,
      unsubscribed: true,
    };
  }

  return c.json(response, 200);
});

userUnsubscribeRouter.openapi(
  getListUserUnsubscribeCategoryRoute,
  async (c) => {
    const { id } = c.var.user;

    const categories = await getListUserUnsubscribeCategory(db, id);
    const categoriesArray = categories.map((category) => category.categoryId);

    const data = {
      userId: id,
      categoryId: categoriesArray,
    };
    return c.json(data, 200);
  },
);

userUnsubscribeRouter.openapi(postUserUnsubscribeCategoryRoute, async (c) => {
  const { id } = c.var.user;
  const { categoryId } = c.req.valid('json');
  const data = {
    userId: id,
    categoryId,
  };

  const { requiredPush } = await checkRequired(db, categoryId);
  if (requiredPush === null) {
    return c.json(
      { error: `Category with id ${categoryId} does not exist!` },
      400,
    );
  }

  if (requiredPush) {
    return c.json(
      {
        error: `Subscription to category with id '${categoryId}' is required!`,
      },
      400,
    );
  }

  let res = await postUserUnsubcribeCategory(db, data);
  if (!res) {
    // If unsubscription is already in DB
    res = {
      userId: id,
      categoryId,
    };
  }
  return c.json(res, 201);
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
      checkRequiredPromises.push(checkRequired(db, categoryId));
    });

    const res = await Promise.allSettled(checkRequiredPromises);
    res.forEach((result) => {
      if (result.status === 'fulfilled') {
        // Category was not found
        if (result.value.requiredPush === null) {
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

    const categoriesUnsubs = await postListUserUnsubcribeCategory(
      db,
      categoriesToUnsubscribe,
    );

    const categoriesAlreadyUnsubscribed: string[] = [];
    const insertedCategoriesSet = new Set(
      categoriesUnsubs.map((data) => data.categoryId),
    );

    categoriesToUnsubscribe.forEach((data) => {
      if (!insertedCategoriesSet.has(data.categoryId)) {
        categoriesAlreadyUnsubscribed.push(data.categoryId);
      }
    });

    const returnObj = {
      userId: id,
      categoryId: categoriesUnsubs.map((data) => data.categoryId),
      requiredSubscriptions: subsRequired,
      categoriesNotFound,
      categoriesAlreadyUnsubscribed,
    };
    return c.json(returnObj, 201);
  },
);

userUnsubscribeRouter.openapi(deleteUserUnsubscribeCategoryRoute, async (c) => {
  const { id } = c.var.user;
  const { categoryId } = c.req.valid('json');

  const categoryExist = await isCategoryExists(db, categoryId);
  if (!categoryExist) {
    return c.json(
      { error: `Category with id ${categoryId} does not exist!` },
      400,
    );
  }

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
});

userUnsubscribeRouter.openapi(deleteListUserUnsubscribeRoute, async (c) => {
  const { id } = c.var.user;
  const categoryIds = c.req.valid('json').categoryId;

  const existingCategories: string[] = [];
  const checkExistingCategoryPromises: Array<
    Promise<false | z.infer<typeof CategorySchema>>
  > = [];

  categoryIds.forEach((categoryId) => {
    checkExistingCategoryPromises.push(isCategoryExists(db, categoryId));
  });

  const res = await Promise.allSettled(checkExistingCategoryPromises);
  res.forEach((result) => {
    if (result.status === 'fulfilled') {
      if (result.value) {
        existingCategories.push(result.value.id);
      }
    }
  });

  if (existingCategories.length === 0) {
    return c.json({ error: 'All categories does not exist!' }, 400);
  }

  const notFoundCategories = categoryIds.filter(
    (categoryId) => !existingCategories.includes(categoryId),
  );

  const deletePromises: Array<
    Promise<z.infer<typeof DeleteUserUnsubscribeCategorySchema>>
  > = [];

  existingCategories.forEach((categoryId) => {
    deletePromises.push(
      deleteUserUnsubscribeCategory(
        db,
        {
          userId: id,
          categoryId,
        },
        id,
      ),
    );
  });

  const resDelete = await Promise.allSettled(deletePromises);
  const deletedCategories: string[] = [];
  const alreadySubscribedCategories: string[] = [];

  resDelete.forEach((result) => {
    if (result.status === 'fulfilled') {
      if (result.value) {
        deletedCategories.push(result.value.categoryId);
      }
    }
  });

  existingCategories.forEach((categoryId) => {
    if (!deletedCategories.includes(categoryId)) {
      alreadySubscribedCategories.push(categoryId);
    }
  });

  const returnObj: z.infer<
    typeof DeleteListUserUnsubscribeCategoryResponseSchema
  > = {
    userId: id,
    categoryId: deletedCategories,
    categoriesNotFound: notFoundCategories,
    categoriesAlreadySubscribed: alreadySubscribedCategories,
  };

  return c.json(returnObj, 201);
});
