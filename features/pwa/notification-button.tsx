"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NotificationButton() {
  const [state, setState] = useState<"idle" | "saving" | "enabled" | "unsupported" | "denied">("idle");

  async function enableNotifications() {
    if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      setState("unsupported");
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      setState("denied");
      return;
    }

    setState("saving");
    const registration = await navigator.serviceWorker.ready;
    const existing = await registration.pushManager.getSubscription();
    const subscription = existing ?? await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    });

    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(subscription)
    });

    setState("enabled");
  }

  return (
    <div>
      <Button onClick={enableNotifications} disabled={state === "saving"}>
        <Bell className="h-4 w-4" /> Enable approval notifications
      </Button>
      {state !== "idle" ? <p className="mt-2 text-xs text-[var(--muted-foreground)]">{statusText[state]}</p> : null}
    </div>
  );
}

const statusText = {
  idle: "",
  saving: "Saving notification subscription...",
  enabled: "Notifications are enabled for this device.",
  unsupported: "This browser does not support web push notifications.",
  denied: "Notifications were not allowed in the browser."
};
