"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function LoginButton({ loginHint }: { loginHint?: string }) {
  const authorizationParams = {
    prompt: "select_account",
    hd: "personeel.com",
    ...(loginHint ? { login_hint: loginHint } : {})
  } as Record<string, string>;

  return (
    <Button
      className="w-full"
      onClick={() => {
        void signIn("google", { callbackUrl: "/" }, authorizationParams as never);
      }}
    >
      Continue with Google
    </Button>
  );
}
