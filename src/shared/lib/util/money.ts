/** 12500 → "12,500원" */
export const formatWon = (amount: number) =>
  `${amount.toLocaleString("ko-KR")}원`;

/** 금액 입력칸 값(숫자만) → 화면에 보일 글자 ("12500" → "12,500") */
export const formatAmountDigits = (digits: string) =>
  digits ? Number(digits).toLocaleString("ko-KR") : "";

/**
 * 입력한 글자에서 숫자만 남김 (쉼표·글자 제거, 앞의 0 제거)
 * maxDigits보다 길면 앞에서부터 그 자리 수까지만
 */
export const toAmountDigits = (value: string, maxDigits: number) =>
  value.replace(/\D/g, "").replace(/^0+/, "").slice(0, maxDigits);

/** 더하기 버튼 글자: 10000 → "+1만", 5000 → "+5천", 500 → "+500" */
export const formatQuickAddLabel = (amount: number) => {
  if (amount >= 10_000 && amount % 10_000 === 0) return `+${amount / 10_000}만`;
  if (amount >= 1_000 && amount % 1_000 === 0) return `+${amount / 1_000}천`;
  return `+${amount.toLocaleString("ko-KR")}`;
};
