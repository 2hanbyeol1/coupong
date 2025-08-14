import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * clsx와 tailwind-merge를 결합하여 클래스 이름을 병합합니다.
 * 중복되거나 충돌하는 Tailwind 클래스는 자동으로 정리됩니다.
 * @param {...ClassValue[]} inputs 클래스 입력 값들
 * @returns 병합된 클래스
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
