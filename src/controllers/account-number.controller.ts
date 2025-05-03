import { db } from '~/db/drizzle';
import {
  createAccountNumber,
  deleteAccountNumber,
  getAccountNumbers,
} from '~/repositories/account-number.repo';
import {
  createAccountNumberRoute,
  deleteAccountNumberRoute,
  getAccountNumbersRoute,
} from '~/routes/account-number.route';
import { createAuthRouter } from './router-factory';
import { roleMiddleware } from '~/middlewares/role.middleware';

export const accountNumberRouter = createAuthRouter();

accountNumberRouter.post(
  createAccountNumberRoute.getRoutingPath(),
  roleMiddleware(['capitalcatalyst']),
);

accountNumberRouter.delete(
  deleteAccountNumberRoute.getRoutingPath(),
  roleMiddleware(['capitalcatalyst']),
);

accountNumberRouter.get(
  getAccountNumbersRoute.getRoutingPath(),
  roleMiddleware(['capitalcatalyst']),
);

accountNumberRouter.openapi(createAccountNumberRoute, async (c) => {
  try {
    const data = c.req.valid('json');
    const account = await createAccountNumber(db, data);
    return c.json(account, 201);
  } catch (err) {
    return c.json(
      {
        formErrors: [],
        fieldErrors: {
          accountNumber: [
            err instanceof Error ? err.message : 'Invalid account number',
          ],
        },
      },
      400,
    );
  }
});

accountNumberRouter.openapi(deleteAccountNumberRoute, async (c) => {
  const { accountNumber } = c.req.valid('param');
  try {
    const result = await deleteAccountNumber(db, accountNumber);
    return result
      ? c.body(null, 204)
      : c.json(
          {
            formErrors: ['Account not found'],
            fieldErrors: {},
          },
          404,
        );
  } catch (err) {
    return c.json(
      {
        formErrors: [],
        fieldErrors: {
          accountNumber: [
            err instanceof Error ? err.message : 'Deletion failed',
          ],
        },
      },
      400,
    );
  }
});

accountNumberRouter.openapi(getAccountNumbersRoute, async (c) => {
  const accounts = await getAccountNumbers(db);
  return c.json({ accountNumbers: accounts }, 200);
});
