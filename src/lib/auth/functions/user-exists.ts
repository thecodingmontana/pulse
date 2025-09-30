import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "~/lib/db";

const mailSchema = z.object({
  email: z.email(),
});

export const checkIfUserExistsByEmail = createServerFn({
  method: "GET",
})
  .inputValidator((data: unknown) => mailSchema.parse(data))
  .handler(async ({ data }) => {
    const user = await db.query.user.findFirst({
      where: (table) => eq(table.email, data.email),
    });
    return user;
  });
