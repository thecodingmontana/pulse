import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { invalidateSession, validateRequest } from "~/utils/auth";
import { deleteSessionTokenCookie } from "~/utils/session";

export const signoutUserAction = createServerFn({
  method: "POST",
}).handler(async () => {
  const { session } = await validateRequest();

  if (!session) {
    throw redirect({ to: "/" });
  }

  try {
    await invalidateSession(session.id);
  } catch {
    throw new Error("Failed to invalidate session!");
  }

  try {
    await deleteSessionTokenCookie();
  } catch {
    throw new Error("Failed to delete session token cookie!");
  }
});
