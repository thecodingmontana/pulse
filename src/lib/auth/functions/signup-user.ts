/** biome-ignore-all lint/suspicious/noEvolvingTypes: ignore all */
/** biome-ignore-all lint/suspicious/noImplicitAnyLet: ignore all */

import { faker } from "@faker-js/faker";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import {
  checkUniqueCode,
  createUser,
  deleteUniqueCode,
  getUserByEmail,
} from "~/data-access/users";
import { capitalize } from "~/lib/utils";
import { verifyCodeFormSchema } from "~/types/forms";
import { createSessionMetadata } from "~/use-cases/users";
import { hashPassword, isWithinExpirationDate } from "~/utils/auth";
import { EmailInUseError } from "~/utils/errors";
import { setSession } from "~/utils/session";

export const signupUserAction = createServerFn({
  method: "POST",
})
  .inputValidator((person: unknown) => {
    try {
      const result = verifyCodeFormSchema.safeParse(person);
      if (!result.success) {
        const firstError = result.error.issues[0];
        throw new Error(`Validation failed: ${firstError.message}`);
      }
      return result.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Invalid input data provided");
    }
  })
  .handler(async ({ data }) => {
    try {
      const request = getRequest();
      // Input validation
      if (!(data.email && data.code && data.password)) {
        throw new Error("Email, code, and password are required!");
      }

      const [existingUser, uniqueCodeRequest] = await Promise.allSettled([
        getUserByEmail(data.email),
        checkUniqueCode(data.email, data.code),
      ]);

      // Handle existing user check
      if (existingUser.status === "rejected") {
        console.error("Error checking existing user:", existingUser.reason);
        throw new Error("Failed to check existing user. Please try again!");
      }

      if (existingUser.value) {
        throw new EmailInUseError();
      }

      // Handle unique code check
      if (uniqueCodeRequest.status === "rejected") {
        console.error("Error checking unique code:", uniqueCodeRequest.reason);
        throw new Error("Failed to check unique code. Please try again!");
      }

      if (!uniqueCodeRequest.value) {
        throw new Error("Invalid unique code provided!");
      }

      // Validate code expiration
      try {
        if (!isWithinExpirationDate(uniqueCodeRequest.value.expires_at)) {
          // Clean up expired code
          try {
            await deleteUniqueCode(uniqueCodeRequest.value.id);
          } catch (cleanupError) {
            console.error("Failed to cleanup expired code:", cleanupError);
            // Don't throw here, continue with main error
          }
          throw new Error("The unique code has expired. Please request a new one.");
        }
      } catch (error) {
        if (error instanceof Error && error.message.includes("expired")) {
          throw error;
        }
        console.error("Error validating expiration date:", error);
        throw new Error("Failed to validate code expiration. Please try again!");
      }

      // Generate user details
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const fullName = `${capitalize(firstName)} ${capitalize(lastName)}`;
      const imageText = `https://avatar.vercel.sh/vercel.svg?text=${capitalize(firstName.charAt(0))}${capitalize(lastName.charAt(0))}`;

      // Hash password
      let hashedPassword: string;
      try {
        hashedPassword = await hashPassword(data.password);
      } catch (error) {
        console.error("Error hashing password:", error);
        throw new Error("Failed to process password. Please try again!");
      }

      let newUser;
      try {
        // Start transaction-like operations
        // First, delete the unique code
        await deleteUniqueCode(uniqueCodeRequest.value.id);

        // Then create the user
        newUser = await createUser(data.email, fullName, hashedPassword, imageText);
      } catch (error) {
        console.error("Error during user creation:", error);

        // If user creation failed but code was deleted, this is a critical error
        if (
          error instanceof Error &&
          (error.message.includes("duplicate") || error.message.includes("unique"))
        ) {
          throw new EmailInUseError();
        }

        throw new Error("Failed to create user account. Please try again!");
      }

      // Set session
      try {
        const headers = Object.fromEntries(request.headers.entries());
        const metadata = await createSessionMetadata(headers);
        await setSession(newUser.id, metadata);
      } catch (error) {
        console.error("Error setting session:", error);
        throw new Error("Failed to create session");
      }

      return {
        message: "You've successfully signed up and verified your account!",
        user_id: newUser.id,
      };
    } catch (error) {
      console.error("Signup error:", error);

      // Re-throw known errors
      if (error instanceof EmailInUseError) {
        throw error;
      }

      // Handle other known error types
      if (error instanceof Error) {
        throw error;
      }

      // Fallback for unknown errors
      throw new Error("An unexpected error occurred during signup. Please try again!");
    }
  });
