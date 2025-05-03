import { z } from '@hono/zod-openapi';
import { createSelectSchema } from 'drizzle-zod';
import { accountNumbers } from '~/db/schema';

export const AccountNumberSchema =
  createSelectSchema(accountNumbers).openapi('AccountNumber');

export const ListAccountNumberSchema = z.object({
  accountNumbers: z.array(AccountNumberSchema),
});

export const AccountNumberParamSchema = z.object({
  accountNumber: z.string().min(10),
});

export type AccountNumber = z.infer<typeof AccountNumberSchema>;
