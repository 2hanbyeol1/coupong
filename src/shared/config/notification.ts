/** 쿠폰 마감 알림을 받을 수 있는 날 (마감 며칠 전) */
export const EXPIRY_REMINDER_DAYS = [7, 3, 1] as const;

export type ExpiryReminderDay = (typeof EXPIRY_REMINDER_DAYS)[number];

/** 설정하지 않았을 때 (마감 하루 전만) */
export const DEFAULT_EXPIRY_REMINDER_DAYS: ExpiryReminderDay[] = [1];

export const isExpiryReminderDay = (day: number): day is ExpiryReminderDay =>
  (EXPIRY_REMINDER_DAYS as readonly number[]).includes(day);
