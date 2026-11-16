import { useEffect, useState } from "react";

/** 보이는 높이가 이만큼(px) 넘게 줄면 화상 키보드가 열린 것으로 봄 */
const KEYBOARD_MIN_HEIGHT = 120;

/**
 * 모바일 화상 키보드가 열려 있는지
 * 키보드가 레이아웃을 줄이는 브라우저와 화면 위에 덮는 브라우저 모두에서 visualViewport 높이가 줄어드므로,
 * 지금까지 본 가장 큰 높이와 비교해 판단 (화면을 돌리면 기준을 다시 잡음)
 */
function useIsKeyboardOpen() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    let maxHeight = viewport.height;
    const update = () => {
      maxHeight = Math.max(maxHeight, viewport.height);
      setIsOpen(maxHeight - viewport.height > KEYBOARD_MIN_HEIGHT);
    };
    const resetBaseline = () => {
      maxHeight = 0;
      update();
    };

    update();
    viewport.addEventListener("resize", update);
    window.addEventListener("orientationchange", resetBaseline);
    return () => {
      viewport.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", resetBaseline);
    };
  }, []);

  return isOpen;
}

export default useIsKeyboardOpen;
