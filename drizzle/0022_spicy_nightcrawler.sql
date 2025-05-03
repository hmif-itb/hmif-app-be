CREATE TABLE IF NOT EXISTS "account_numbers" (
	"accountNumber" text PRIMARY KEY NOT NULL,
	CONSTRAINT "account_numbers_accountNumber_unique" UNIQUE("accountNumber")
);
