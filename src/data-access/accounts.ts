import { eq } from "drizzle-orm";
import { db, tables } from "~/lib/db";
import type { OauthProvider, UserId } from "~/use-cases/types";

export async function createOauthAccount(
  userId: UserId,
  googleId: string,
  provider: OauthProvider,
) {
  await db
    .insert(tables.oauth_account)
    .values({
      user_id: userId,
      provider,
      provider_user_id: googleId,
    })
    .onConflictDoNothing()
    .returning();
}

export async function getAccountByUserId(userId: UserId) {
  const account = await db.query.oauth_account.findFirst({
    where: (table) => eq(table.user_id, userId),
  });

  return account;
}

export async function getAccountByGoogleId(googleId: string) {
  return await db.query.oauth_account.findFirst({
    where: (table) => eq(table.provider_user_id, googleId),
  });
}
