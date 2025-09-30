import { UAParser } from "ua-parser-js";
import { createOauthAccount } from "~/data-access/accounts";
import { createOauthUser, getUserByEmail } from "~/data-access/users";
import type { GoogleUser, SessionMetadata } from "./types";

export async function createGoogleUserUseCase(googleUser: GoogleUser) {
  let existingUser = await getUserByEmail(googleUser.email);

  if (!existingUser) {
    existingUser = await createOauthUser(
      googleUser.email,
      googleUser.picture,
      googleUser.name,
    );
  }

  await createOauthAccount(existingUser.id, googleUser.sub, "google");

  return existingUser.id;
}

export async function createSessionMetadata(headers: {
  [k: string]: string;
}): Promise<SessionMetadata> {
  // Get IP address from various possible headers
  const localIp =
    headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    headers["x-real-ip"] ||
    headers["cf-connecting-ip"] ||
    headers["x-client-ip"] ||
    "127.0.0.1";

  const userAgent = headers["user-agent"] || "";

  // Parse user agent
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  let location = "Unknown";

  // Handle localhost
  if (
    localIp === "127.0.0.1" ||
    localIp === "::1" ||
    localIp.startsWith("192.168.") ||
    localIp.startsWith("10.")
  ) {
    location = "Localhost";
  } else {
    try {
      // Get location data from IP
      const response = await fetch(`http://ip-api.com/json/${localIp}`);
      if (response.ok) {
        const ipData = await response.json();
        if (ipData.status === "success") {
          location = `${ipData.city || "Unknown"}, ${ipData.country || "Unknown"}`;
        }
      }
    } catch (ipError) {
      console.warn("Failed to fetch IP location data:", ipError);
      // location remains 'Unknown'
    }
  }

  return {
    location,
    browser: result.browser.name || "Unknown Browser",
    device: result.device.vendor || "Unknown Device",
    os: result.os.name || "Unknown OS",
    ipAddress: localIp,
  };
}
