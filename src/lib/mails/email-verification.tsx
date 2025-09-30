import EmailVerificationMail from "../../../emails/email-verification-mail";
import { resend } from "./resend";

interface Props {
  email: string;
  subject: string;
  code: string;
  expiryTimestamp: Date;
}

export const sendEmailVerificationMail = async ({
  email,
  subject,
  code,
  expiryTimestamp,
}: Props) => {
  try {
    const result = await resend.emails.send({
      from: "Team GoodsnCart <noreply@thecodingmontana.com>",
      to: [email],
      subject,
      react: <EmailVerificationMail code={code} expiryTimestamp={expiryTimestamp} />,
    });
    return result;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
};
