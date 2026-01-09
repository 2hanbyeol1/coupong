export function getIsNotificationSupported() {
  return "serviceWorker" in navigator && "PushManager" in window;
}
