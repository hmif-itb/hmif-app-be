import { eq } from 'drizzle-orm';
import { Database } from '~/db/drizzle';
import { accountNumbers } from '~/db/schema';
import { PostgresError } from 'postgres';
import { AccountNumber } from '~/types/account-number.types';

export const createAccountNumber = async (
  db: Database,
  data: AccountNumber,
) => {
  try {
    const [result] = await db.insert(accountNumbers).values(data).returning();
    return result;
  } catch (err) {
    if (err instanceof PostgresError && err.code === '23505') {
      throw new Error('Account number must be unique');
    }
    throw err;
  }
};

export const getAccountNumbers = async (db: Database) => {
  return await db
    .select()
    .from(accountNumbers)
    .orderBy(accountNumbers.accountNumber);
};

export const deleteAccountNumber = async (
  db: Database,
  accountNumber: string,
) => {
  const [result] = await db
    .delete(accountNumbers)
    .where(eq(accountNumbers.accountNumber, accountNumber))
    .returning();
  return result;
};
