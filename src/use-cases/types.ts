export type UserId = string;

export interface Session {
  id: string;
  expires_at: Date;
  user_id: string;
}

export interface SessionMetadata {
  location: string;
  browser: string;
  device: string;
  os: string;
  ipAddress: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  avatar: string;
  email_verified: boolean;
  registered_2fa: boolean;
  subscription_id: string | null;
  created_at: Date;
  updated_at: Date | null;
}

export type OauthProvider = "google" | "github";

export interface GoogleUser {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
  locale: string;
}
