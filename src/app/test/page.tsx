"use client";
import useNotification from "@/shared/lib/hook/useNotification";

function TestPage() {
  const {
    isSupported,
    isSubscribing,
    subscription,
    subscribeToPush,
    unsubscribeFromPush,
    sendNotification,
  } = useNotification();

  if (isSupported === null) return <div>Loading...</div>;

  return (
    <div>
      {isSupported ? (
        <div>
          {subscription ? (
            <div>
              <button onClick={unsubscribeFromPush}>알림 구독 취소</button>
              <button
                onClick={() => sendNotification("쿠퐁", "푸시 알림 테스트")}
              >
                send notification
              </button>
            </div>
          ) : (
            <button onClick={subscribeToPush} disabled={isSubscribing}>
              알림 구독
            </button>
          )}
        </div>
      ) : (
        "알림 기능을 지원하지 않는 브라우저예요"
      )}
    </div>
  );
}

export default TestPage;
