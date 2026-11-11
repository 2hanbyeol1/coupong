import { useEffect, useState } from "react";

/**
 * 화면에 실제로 보이는 영역(visual viewport)이 페이지 맨 위에서 얼마나 내려와 있는지 반환
 *
 * 모바일에서 입력칸에 포커스되어 키보드가 올라오면 보이는 영역만 아래로 밀려,
 * position: fixed 요소가 화면 밖으로 사라질 수 있음. 이 값만큼 내려서 보정하는 데 사용
 */
function useVisualViewportOffsetTop() {
  const [offsetTop, setOffsetTop] = useState(0);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const update = () => setOffsetTop(viewport.offsetTop);
    update();

    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
    };
  }, []);

  return offsetTop;
}

export default useVisualViewportOffsetTop;
