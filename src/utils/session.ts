/** biome-ignore-all lint/suspicious/useAwait: ignore all */

import { getCookie, setCookie } from "@tanstack/react-start/server";
import { env } from "~/env/server";
import type { SessionMetadata, UserId } from "~/use-cases/types";
import { createSession, generateSessionToken, validateRequest } from "./auth";
import { AuthenticationError } from "./errors";

const SESSION_COOKIE_NAME = "session";

export async function setSessionTokenCookie(
  token: string,
  expiresAt: Date,
): Promise<void> {
  setCookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
}

export async function deleteSessionTokenCookie(): Promise<void> {
  setCookie(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });
}

export async function getSessionToken(): Promise<string | undefined> {
  const sessionCookie = getCookie(SESSION_COOKIE_NAME);
  return sessionCookie;
}

export const getCurrentUser = async () => {
  const { user } = await validateRequest();
  return user ?? undefined;
};

export const assertAuthenticated = async () => {
  const user = await getCurrentUser();
  if (!user) {
    throw new AuthenticationError();
  }
  return user;
};

export async function setSession(userId: UserId, metadata: SessionMetadata) {
  const token = generateSessionToken();
  const session = await createSession(token, userId, metadata);
  await setSessionTokenCookie(token, session.expires_at);
}
