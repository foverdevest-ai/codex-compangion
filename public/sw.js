/* global self */

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  const data = event.data?.json?.() ?? {
    title: "Codex Companion",
    body: "New activity is waiting."
  };

  event.waitUntil(
    self.registration.showNotification(data.title ?? "Codex Companion", {
      body: data.body ?? "New activity is waiting.",
      icon: "/icons/icon.svg",
      badge: "/icons/icon.svg",
      data: data.url ?? "/approvals"
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = event.notification.data || "/approvals";
  event.waitUntil(self.clients.openWindow(target));
});
