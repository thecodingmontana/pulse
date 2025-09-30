import { redirect } from "@tanstack/react-router";
import { createMiddleware } from "@tanstack/react-start";
import { setResponseStatus } from "@tanstack/react-start/server";
import { validateRequest } from "~/utils/auth";

/**
 * Middleware to force authentication on a server function, and add the user to the context.
 */

export const logMiddleware = createMiddleware({ type: "function" }).server(
  async ({ next, functionId }) => {
    const now = Date.now();

    const result = await next();

    const duration = Date.now() - now;
    console.log("Server Req/Res:", { duration: `${duration}ms`, functionId });

    return result;
  },
);

// For routes that require authentication - redirect to signin if not authenticated
export const authenticatedMiddleware = createMiddleware({ type: "function" })
  .middleware([logMiddleware])
  .server(async ({ next }) => {
    const { user, session } = await validateRequest();

    if (!session) {
      throw redirect({ to: "/" });
    }

    return next({
      context: { user, session },
    });
  });

// For routes that should only be accessed by unauthenticated users - redirect to dashboard if authenticated
export const unauthenticatedMiddleware = createMiddleware({ type: "function" })
  .middleware([logMiddleware])
  .server(async ({ next }) => {
    const { user, session } = await validateRequest();

    // if (session) {
    //   throw redirect({
    //     to: "/user/$userId/my-stores",
    //     params: {
    //       userId: user.id,
    //     },
    //   });
    // }

    return next({
      context: { user, session },
    });
  });

export const authMiddleware = createMiddleware({ type: "function" })
  .middleware([logMiddleware])
  .server(async ({ next }) => {
    const { user, session } = await validateRequest();

    if (!session) {
      setResponseStatus(401);
      throw new Error("Unauthorized");
    }

    return next({ context: { user } });
  });
