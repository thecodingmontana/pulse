import { generateRandomString, type RandomReader } from "@oslojs/crypto/random";
import { sha256 } from "@oslojs/crypto/sha2";
import {
  encodeBase32LowerCaseNoPadding,
  encodeBase32UpperCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";
import { Google } from "arctic";
import argon2 from "argon2";
import { eq } from "drizzle-orm";
import { env } from "~/env/server";
import { db, tables } from "~/lib/db";
import type { Session, SessionMetadata, User, UserId } from "~/use-cases/types";
import { getSessionToken } from "./session";

const SESSION_REFRESH_INTERVAL_MS = 1000 * 60 * 60 * 24 * 15;
const SESSION_MAX_DURATION_MS = SESSION_REFRESH_INTERVAL_MS * 2;

export type TimeSpanUnit = "ms" | "s" | "m" | "h" | "d" | "w";

export class TimeSpan {
  value: number;
  unit: TimeSpanUnit;

  constructor(value: number, unit: TimeSpanUnit) {
    this.value = value;
    this.unit = unit;
  }

  milliseconds(): number {
    const unitMultipliers: Record<TimeSpanUnit, number> = {
      ms: 1,
      s: 1000,
      m: 60_000,
      h: 3_600_000,
      d: 86_400_000,
      w: 604_800_000,
    };
    return this.value * unitMultipliers[this.unit];
  }

  seconds(): number {
    return this.milliseconds() / 1000;
  }

  transform(x: number): TimeSpan {
    return new TimeSpan(this.value * x, this.unit);
  }
}

export function isWithinExpirationDate(date: Date): boolean {
  return date.getTime() > Date.now();
}

export function createDate(timeSpan: TimeSpan): Date {
  return new Date(Date.now() + timeSpan.milliseconds());
}

export function generateRandomOTP(): string {
  const bytes = new Uint8Array(5);
  crypto.getRandomValues(bytes);
  const code = encodeBase32UpperCaseNoPadding(bytes);
  return code;
}

export function generateUniqueCode(length: number): string {
  const random: RandomReader = {
    read(bytes) {
      crypto.getRandomValues(bytes);
    },
  };

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-";

  return generateRandomString(random, alphabet, length);
}

export const googleAuth = new Google(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  `${env.VITE_BASE_URL}/api/oauth/signin/google/callback`,
);

export function generateSessionToken(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);
  return token;
}

export async function createSession(
  token: string,
  userId: UserId,
  metadata: SessionMetadata,
): Promise<Session> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session: Session = {
    id: sessionId,
    user_id: userId,
    expires_at: new Date(Date.now() + SESSION_MAX_DURATION_MS),
  };
  await db.insert(tables.session).values({
    id: sessionId,
    user_id: userId,
    expires_at: new Date(Date.now() + SESSION_MAX_DURATION_MS),
    location: metadata.location,
    browser: metadata.browser,
    device: metadata.device,
    os: metadata.os,
  });
  return session;
}

export async function validateRequest(): Promise<SessionValidationResult> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) {
    return { session: null, user: null };
  }
  return validateSessionToken(sessionToken);
}

export async function getAuthenticatedUser(): Promise<User | null> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) {
    return null;
  }
  const { user } = await validateSessionToken(sessionToken);
  return user;
}

export async function isAuthenticated(): Promise<boolean> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) {
    return false;
  }
  const { user } = await validateSessionToken(sessionToken);
  return !!user;
}

export async function validateSessionToken(
  token: string,
): Promise<SessionValidationResult> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const sessionInDb = await db.query.session.findFirst({
    where: (table) => eq(table.id, sessionId),
  });
  if (!sessionInDb) {
    return { session: null, user: null };
  }
  if (Date.now() >= sessionInDb.expires_at.getTime()) {
    await db.delete(tables.session).where(eq(tables.session.id, sessionInDb.id));
    return { session: null, user: null };
  }

  const user = await db.query.user.findFirst({
    where: (table) => eq(table.id, sessionInDb.user_id),
    columns: {
      password: false,
    },
  });

  if (!user) {
    await db.delete(tables.session).where(eq(tables.session.id, sessionInDb.id));
    return { session: null, user: null };
  }

  if (Date.now() >= sessionInDb.expires_at.getTime() - SESSION_REFRESH_INTERVAL_MS) {
    sessionInDb.expires_at = new Date(Date.now() + SESSION_MAX_DURATION_MS);
    await db
      .update(tables.session)
      .set({
        expires_at: sessionInDb.expires_at,
      })
      .where(eq(tables.session.id, sessionInDb.id));
  }

  return { session: sessionInDb, user };
}

export async function invalidateSession(sessionId: string): Promise<void> {
  await db.delete(tables.session).where(eq(tables.session.id, sessionId));
}

export async function invalidateUserSessions(userId: UserId): Promise<void> {
  await db.delete(tables.session).where(eq(tables.user.id, userId));
}

export async function hashPassword(password: string) {
  const hash = await argon2.hash(password);
  return hash;
}

export async function verifyHashedPassword(hashedPassword: string, password: string) {
  const isCorrectPassword = await argon2.verify(hashedPassword, password);
  return isCorrectPassword;
}

export type SessionValidationResult =
  | { session: Session; user: User }
  | { session: null; user: null };
