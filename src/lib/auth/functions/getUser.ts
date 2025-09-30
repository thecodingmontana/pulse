import { createServerFn } from "@tanstack/react-start";
import { validateRequest } from "~/utils/auth";
import { logMiddleware } from "../middleware/auth-guard";

export const getUser = createServerFn({ method: "GET" })
  .middleware([logMiddleware])
  .handler(async () => {
    const { user, session } = await validateRequest();
    return session ? user : null;
  });
