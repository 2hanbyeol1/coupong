import { useState } from "react";

/**
 * index가 바뀐 방향을 반환 (커지면 1, 작아지면 -1)
 * 슬라이드 애니메이션에서 들어오고 나가는 방향을 정할 때 사용
 */
function useSlideDirection(index: number) {
  const [state, setState] = useState({ index, direction: 1 });

  if (state.index !== index) {
    const direction = index > state.index ? 1 : -1;
    setState({ index, direction });
    return direction;
  }
  return state.direction;
}

export default useSlideDirection;
