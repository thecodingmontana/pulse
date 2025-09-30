import { createServerFn } from "@tanstack/react-start";
import { checkUniqueCode, deleteUniqueCode, getUserByEmail } from "~/data-access/users";
import { db, tables } from "~/lib/db";
import { resetPasswordActionSchema } from "~/types/forms";
import { hashPassword, isWithinExpirationDate } from "~/utils/auth";
import { ExpiredCodeError, InvalidCredentialsError } from "~/utils/errors";

export const userResetPasswordAction = createServerFn({
  method: "POST",
})
  .inputValidator((person: unknown) => {
    try {
      const result = resetPasswordActionSchema.safeParse(person);
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
      if (!(data.email && data.code && data.new_password)) {
        throw new Error("Email, code, and password are required!");
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

      // hash the new password
      let hashedPassword: string;
      try {
        hashedPassword = await hashPassword(data.new_password);
      } catch (error) {
        console.error("Error hashing password:", error);
        throw new Error("Failed to process new password. Please try again!");
      }

      try {
        // Delete the unique code
        await deleteUniqueCode(uniqueCodeRequest.id);
        // Update the user's password
        await db.update(tables.user).set({
          password: hashedPassword,
        });
      } catch (error) {
        console.error("Error during user reset password", error);

        if (error instanceof Error) {
          throw new Error(error.message);
        }

        throw new Error("Failed to reset password. Please try again!");
      }

      return {
        message:
          "You've successfully reset your password. Please signin to access your acount!",
      };
    } catch (error) {
      // Handle other known error types
      if (error instanceof Error) {
        throw new Error(error.message);
      }

      // Fallback for unknown errors
      throw new Error("Failed to reset password. Please try again!");
    }
  });
