import { createFileRoute } from "@tanstack/react-router";
import { deleteCookie, getCookie } from "@tanstack/react-start/server";
import { OAuth2RequestError } from "arctic";
import { getAccountByGoogleIdUseCase } from "~/use-cases/accounts";
import type { GoogleUser } from "~/use-cases/types";
import { createGoogleUserUseCase, createSessionMetadata } from "~/use-cases/users";
import { googleAuth } from "~/utils/auth";
import { setSession } from "~/utils/session";

export const Route = createFileRoute("/api/oauth/signin/google/callback/")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const storedState = getCookie("google_oauth_state") ?? null;
        const codeVerifier = getCookie("google_code_verifier") ?? null;
        const headers = Object.fromEntries(request.headers.entries());

        if (!(code && state && storedState) || state !== storedState || !codeVerifier) {
          return new Response(null, { status: 400 });
        }

        deleteCookie("google_oauth_state");
        deleteCookie("google_code_verifier");
        deleteCookie("google_redirect_uri");

        try {
          const tokens = await googleAuth.validateAuthorizationCode(code, codeVerifier);

          const response = await fetch(
            "https://openidconnect.googleapis.com/v1/userinfo",
            {
              headers: { Authorization: `Bearer ${tokens.accessToken()}` },
            },
          );

          const googleUser: GoogleUser = await response.json();

          const existingAccount = await getAccountByGoogleIdUseCase(googleUser.sub);

          const metadata = await createSessionMetadata(headers);

          if (existingAccount) {
            await setSession(existingAccount.user_id, metadata);
            return new Response(null, {
              status: 302,
              headers: { Location: `/user/${existingAccount.user_id}/my-stores` },
            });
          }

          const userId = await createGoogleUserUseCase(googleUser);

          await setSession(userId, metadata);

          return new Response(null, {
            status: 302,
            headers: { Location: `/user/${userId}/my-stores` },
          });
        } catch (e) {
          console.error("google auth error: ", e);
          // the specific error message depends on the provider
          if (e instanceof OAuth2RequestError) {
            console.log(e.message);
            // invalid code
            return new Response(null, { status: 400 });
          }
          return new Response(null, { status: 500 });
        }
      },
    },
  },
});
