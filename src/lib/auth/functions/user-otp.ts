import { createServerFn } from "@tanstack/react-start";
import {
  createEmailVerificationCode,
  getEmailVerificationCode,
  getUserByEmail,
  updateEmailVerificationCode,
} from "~/data-access/users";
import { sendEmailVerificationMail } from "~/lib/mails/email-verification";
import { formSchema } from "~/types/forms";
import { createDate, generateUniqueCode, TimeSpan } from "~/utils/auth";
import { EmailInUseError } from "~/utils/errors";

export const userOTPAction = createServerFn({
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
      const [user, existingCode] = await Promise.all([
        getUserByEmail(data.email),
        getEmailVerificationCode(data.email),
      ]);

      if (user) {
        throw new EmailInUseError();
      }

      // Generate code and expiry once
      const code = generateUniqueCode(6);
      const expiresAt = createDate(new TimeSpan(10, "m"));

      const emailData = {
        email: data.email,
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
      console.log(error);
      if (error instanceof EmailInUseError) {
        throw error;
      }

      if (error instanceof Error) {
        throw new Error(error.message);
      }
    }
  });
