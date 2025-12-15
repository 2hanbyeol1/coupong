"use client";
import useNotification from "@/shared/lib/hook/useNotification";
import { Button } from "@/shared/ui";
import { CenteredView } from "@/shared/ui/CenteredView";

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
    <CenteredView>
      {isSupported ? (
        <div>
          {subscription ? (
            <div>
              <Button
                onClick={() => sendNotification("쿠퐁", "푸시 알림 테스트")}
              >
                알림 보내기
              </Button>
              <button onClick={unsubscribeFromPush}>알림 구독 취소</button>
            </div>
          ) : (
            <Button onClick={subscribeToPush} disabled={isSubscribing}>
              알림 구독
            </Button>
          )}
        </div>
      ) : (
        "알림 기능을 지원하지 않는 브라우저예요"
      )}
    </CenteredView>
  );
}

export default TestPage;
