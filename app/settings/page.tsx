import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NotificationButton } from "@/features/pwa/notification-button";

export default function SettingsPage() {
  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-semibold">Settings</h1><p className="mt-1 text-sm text-[var(--muted-foreground)]">Profile, backend integration, approvals, notifications, PWA, and debug controls.</p></div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Mobile notifications</CardTitle></CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-[var(--muted-foreground)]">Enable push scaffolding for pending approvals on this device. Production delivery requires VAPID keys and a notification sender job.</p>
            <NotificationButton />
          </CardContent>
        </Card>
        {[
          ["Profile", "Single-user authenticated shell, ready to expand into multi-user accounts."],
          ["Backend settings", "Codex app-server URL and credentials stay server-side only."],
          ["Approval preferences", "Configure browser banners, pending approval urgency, and high-risk confirmation behavior."],
          ["Notifications", "Browser push scaffolding, inbox notices, failed run alerts, and sync warnings."],
          ["Project defaults", "Default context sections, template tags, and run retention windows."],
          ["Developer/debug", "Provider health, SSE status, raw event replay, and audit export."]
        ].map(([title, body]) => (
          <Card key={title}><CardHeader><CardTitle>{title}</CardTitle></CardHeader><CardContent><p className="text-sm text-[var(--muted-foreground)]">{body}</p><Button className="mt-4" variant="outline">Configure</Button></CardContent></Card>
        ))}
      </div>
    </div>
  );
}
