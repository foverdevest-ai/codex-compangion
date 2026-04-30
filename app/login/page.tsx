import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { LoginButton } from "@/components/auth/login-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authOptions } from "@/server/auth/options";
import { isAllowedUser, preferredLoginEmail } from "@/server/auth/config";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  const session = await getServerSession(authOptions);
  if (session?.user?.email && isAllowedUser(session.user.email)) redirect("/");

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Codex Companion</CardTitle>
          <p className="text-sm text-[var(--muted-foreground)]">
            Log in met je toegestane Google account om projecten, runs en approvals vanaf mobiel te beheren.
          </p>
        </CardHeader>
        <CardContent>
          {params.error ? (
            <div className="mb-4 rounded-[var(--radius-md)] border border-[var(--color-danger-border)] bg-[var(--color-danger-surface)] p-3 text-sm text-[var(--color-danger-foreground)]">
              Login geweigerd. Gebruik het toegestane Google account: <strong>{preferredLoginEmail}</strong>.
            </div>
          ) : null}
          <LoginButton loginHint={preferredLoginEmail} />
          <p className="mt-4 text-xs text-[var(--muted-foreground)]">
            Toegang is beperkt tot {preferredLoginEmail}; Codex credentials blijven op de cloud runner.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
