import { useEffect } from "react";

/**
 * 이 화면이 떠 있는 동안 화면이 꺼지거나 어두워지지 않게 함 (예: 매장에서 바코드 보여주기)
 * 다른 앱으로 갔다 오면 브라우저가 잠금을 풀기 때문에 돌아왔을 때 다시 요청
 * 지원하지 않는 브라우저에서는 아무것도 하지 않음
 */
function useWakeLock(enabled = true) {
  useEffect(() => {
    if (!enabled || !("wakeLock" in navigator)) return;

    let sentinel: WakeLockSentinel | null = null;
    let isActive = true;

    const request = async () => {
      if (document.visibilityState !== "visible") return;
      // 이미 잡고 있으면 다시 요청하지 않음
      if (sentinel && !sentinel.released) return;
      try {
        const next = await navigator.wakeLock.request("screen");
        // 요청하는 사이 화면을 벗어났으면 바로 풀어줌
        if (!isActive) {
          next.release();
          return;
        }
        sentinel = next;
      } catch {
        // 배터리 절약 모드 등으로 거부되면 그냥 평소처럼 동작
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") request();
    };

    request();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isActive = false;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      sentinel?.release();
    };
  }, [enabled]);
}

export default useWakeLock;
