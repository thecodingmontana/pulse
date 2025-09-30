import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { checkUniqueCode, deleteUniqueCode, getUserByEmail } from "~/data-access/users";
import { verifyCodeFormSchema } from "~/types/forms";
import { createSessionMetadata } from "~/use-cases/users";
import { isWithinExpirationDate, verifyHashedPassword } from "~/utils/auth";
import {
  EmailNotInUseError,
  ExpiredCodeError,
  InvalidCredentialsError,
  SessionError,
} from "~/utils/errors";
import { setSession } from "~/utils/session";

export const signinUserAction = createServerFn({
  method: "POST",
})
  .inputValidator((person: unknown) => {
    const result = verifyCodeFormSchema.safeParse(person);
    if (!result.success) {
      const firstError = result.error.issues[0];
      throw new Error(`Validation failed: ${firstError.message}`);
    }
    return result.data;
  })
  .handler(async ({ data }) => {
    try {
      const request = getRequest();

      if (!(data.email?.trim() && data.code?.trim() && data.password?.trim())) {
        throw new InvalidCredentialsError(
          "Email, code, and password are required and cannot be empty",
        );
      }

      const email = data.email.toLowerCase().trim();

      const [userResult, codeResult] = await Promise.allSettled([
        getUserByEmail(email),
        checkUniqueCode(email, data.code.trim()),
      ]);

      if (userResult.status === "rejected") {
        console.error("Database error - user lookup failed:", {
          email,
          error: userResult.reason,
        });
        throw new Error("User lookup failed. Please try again later!");
      }

      const existingUser = userResult.value;
      if (!existingUser) {
        throw new InvalidCredentialsError("Invalid email provided!");
      }

      // Handle code lookup result
      if (codeResult.status === "rejected") {
        console.error("Database error - code lookup failed:", {
          email,
          error: codeResult.reason,
        });
        throw new Error("Code lookup failed. Please try again later!");
      }

      const uniqueCodeRequest = codeResult.value;
      if (!uniqueCodeRequest) {
        throw new InvalidCredentialsError("Invalid code provided!");
      }

      // Validate code expiration
      if (!isWithinExpirationDate(uniqueCodeRequest.expires_at)) {
        deleteUniqueCode(uniqueCodeRequest.id).catch((error) => {
          console.error("Failed to cleanup expired code:", {
            codeId: uniqueCodeRequest.id,
            email,
            error,
          });
        });
        throw new ExpiredCodeError();
      }

      // Verify password
      if (!existingUser.password) {
        console.error("User account has no password set:", { userId: existingUser.id });
        throw new InvalidCredentialsError("User account has no password set!");
      }

      const isPasswordValid = await verifyHashedPassword(
        existingUser.password,
        data.password,
      );
      if (!isPasswordValid) {
        throw new InvalidCredentialsError("Invalid email or password provided");
      }

      try {
        await deleteUniqueCode(uniqueCodeRequest.id);
        const headers = Object.fromEntries(request.headers.entries());

        const metadata = await createSessionMetadata(headers);

        await setSession(existingUser.id, metadata);
      } catch (error) {
        console.error("Critical error during signin completion:", {
          userId: existingUser.id,
          codeId: uniqueCodeRequest.id,
          error,
        });

        if (error instanceof Error && error.message.includes("session")) {
          throw new SessionError(
            "Authentication completed but session creation failed. Please try signing in again!",
          );
        }

        throw new Error("Failed to complete signin process. Please try again!");
      }

      return {
        message: "Successfully signed in! Welcome back.",
        user_id: existingUser.id,
      };
    } catch (error) {
      console.error("Signin process failed:", {
        email: data?.email,
        timestamp: new Date().toISOString(),
        error:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
              }
            : error,
      });

      if (
        error instanceof EmailNotInUseError ||
        error instanceof InvalidCredentialsError ||
        error instanceof ExpiredCodeError ||
        error instanceof SessionError
      ) {
        throw error;
      }

      if (error instanceof Error && error.message.includes("Validation failed")) {
        throw error;
      }

      throw new Error("Failed to complete signin process. Please try again!");
    }
  });
