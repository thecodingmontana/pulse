import { Icon } from "@iconify/react";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "~/lib/utils";

type AuthProvider = "google";

interface OauthButtonProps {
  isAuthenticating: boolean;
}

interface OauthButton {
  provider: AuthProvider;
  text: string;
  icon: string;
}

export default function OauthProviders({ isAuthenticating }: OauthButtonProps) {
  const authProviders = useMemo<OauthButton[]>(
    () => [
      {
        provider: "google",
        text: "Continue with Google",
        icon: "devicon:google",
      },
    ],
    [],
  );

  const [isOauthAuthentication, setIsOauthAuthentication] = useState(false);

  const handleOauthLogin = useCallback(
    (provider: AuthProvider) => {
      if (isAuthenticating || isOauthAuthentication) return;

      setIsOauthAuthentication(true);

      if (provider === "google") {
        window.location.assign("/api/oauth/signin/google");
      }
    },
    [isAuthenticating, isOauthAuthentication],
  );

  useEffect(() => {
    const handleOauthResponse = (event: MessageEvent) => {
      if (event.data === "oauth-success") {
        setIsOauthAuthentication(false);
      } else if (event.data === "oauth-failure") {
        setIsOauthAuthentication(false);
      }
    };

    window.addEventListener("message", handleOauthResponse);

    return () => {
      window.removeEventListener("message", handleOauthResponse);
    };
  });

  return (
    <div className="grid gap-2 overflow-hidden">
      <div className="!overflow-hidden flex h-[42px] items-center">
        {authProviders.map((auth) => {
          const isButtonDisabled = isAuthenticating || isOauthAuthentication;

          return (
            <button
              aria-label={`${auth.text} - OAuth authentication`}
              className={cn(
                "flex h-[42px] w-full items-center justify-center gap-2 rounded-[10px] border px-2 font-medium text-sm transition-colors duration-200 hover:border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:ring-offset-1",
                isButtonDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
              )}
              disabled={isButtonDisabled}
              key={auth.provider}
              onClick={() => handleOauthLogin(auth.provider)}
              type="button"
            >
              {isOauthAuthentication ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Icon className="size-4" icon={auth.icon} />
              )}
              {auth.text}
            </button>
          );
        })}
      </div>
    </div>
  );
}
