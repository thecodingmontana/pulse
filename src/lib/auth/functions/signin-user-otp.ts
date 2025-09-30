import { createServerFn } from "@tanstack/react-start";
import {
  createEmailVerificationCode,
  getEmailVerificationCode,
  getUserByEmail,
  updateEmailVerificationCode,
} from "~/data-access/users";
import { sendEmailVerificationMail } from "~/lib/mails/email-verification";
import { formSchema } from "~/types/forms";
import {
  createDate,
  generateUniqueCode,
  TimeSpan,
  verifyHashedPassword,
} from "~/utils/auth";
import { EmailInUseError, InvalidCredentialsError } from "~/utils/errors";

export const signinUserOTPAction = createServerFn({
  method: "POST",
})
  .inputValidator((person: unknown) => {
    const result = formSchema.safeParse(person);
    if (!result.success) {
      throw new Error(result.error.issues[0].message);
    }
    return result.data;
  })
  .handler(async ({ data }) => {
    try {
      if (!(data.email?.trim() && data.password?.trim())) {
        throw new InvalidCredentialsError(
          "Email and password are required and cannot be empty",
        );
      }

      const email = data.email.toLowerCase().trim();

      const [user, existingCode] = await Promise.all([
        getUserByEmail(data.email),
        getEmailVerificationCode(data.email),
      ]);

      if (!user) {
        throw new InvalidCredentialsError("Invalid email provided!");
      }

      // Verify password
      if (!user.password) {
        console.error("User account has no password set:", { userId: user.id });
        throw new InvalidCredentialsError("User account has no password set!");
      }

      const isPasswordValid = await verifyHashedPassword(user.password, data.password);

      if (!isPasswordValid) {
        throw new InvalidCredentialsError("Invalid password provided!");
      }

      // Generate code and expiry once
      const code = generateUniqueCode(6);
      const expiresAt = createDate(new TimeSpan(10, "m"));

      const emailData = {
        email,
        subject: `Your unique GoodsnCart verification code is ${code}`,
        code,
        expiryTimestamp: expiresAt,
      };

      try {
        if (existingCode) {
          await Promise.all([
            updateEmailVerificationCode(data.email, code, expiresAt),
            sendEmailVerificationMail(emailData),
          ]);
        } else {
          await Promise.all([
            createEmailVerificationCode(data.email, code, expiresAt),
            sendEmailVerificationMail(emailData),
          ]);
        }
      } catch (error) {
        if (error instanceof Error) {
          console.log("Database or email operation failed:", error.message);
        }
        throw new Error(
          "Failed to process verification request. Please try again later.",
        );
      }
      return {
        message: "Check your email for the verification code!",
      };
    } catch (error) {
      if (error instanceof EmailInUseError) {
        throw error;
      }

      if (error instanceof Error) {
        throw new Error(error.message);
      }
    }
  });
