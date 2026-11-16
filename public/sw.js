// 새 버전이 설치되면 기다리지 않고 바로 적용 (캐시를 쓰지 않아 바로 바꿔도 안전)
self.addEventListener("install", () => {
  self.skipWaiting();
});

// 이미 열려 있는 창도 바로 이 서비스 워커가 관리하게 함
// (관리 중인 창이어야 알림을 눌렀을 때 그 창을 다른 주소로 이동시킬 수 있음)
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/logo/192.png",
      vibrate: [100, 50, 100],
      // 알림을 눌렀을 때 열 주소 (예: 쿠폰 상세)
      data: { url: data.url ?? "/" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = new URL(
    event.notification.data?.url ?? "/",
    self.location.origin,
  ).href;
  event.waitUntil(openOrFocusWindow(url));
});

/** 앱 창이 이미 열려 있으면 그 창을 앞으로 가져와 이동하고, 없으면 새 창으로 열기 */
async function openOrFocusWindow(url) {
  const windows = await self.clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });
  const appWindow = windows.find(
    (client) => new URL(client.url).origin === self.location.origin,
  );

  if (!appWindow) return self.clients.openWindow(url);

  try {
    const focused = await appWindow.focus();
    if (focused.url !== url) await focused.navigate(url);
  } catch {
    // 서비스 워커가 관리하지 않는 창이라 이동할 수 없으면 새 창으로 열기
    await self.clients.openWindow(url);
  }
}
