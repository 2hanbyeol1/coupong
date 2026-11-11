import { useEffect, useState } from "react";

/**
 * 값이 delay(ms) 동안 바뀌지 않았을 때만 갱신된 값을 반환
 * 입력할 때마다 서버에 요청하지 않도록 검색어에 사용
 */
function useDebouncedValue<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export default useDebouncedValue;
