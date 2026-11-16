import { INVITATION_VALID_DAYS } from "./constants";

const DAY_MS = 24 * 60 * 60 * 1000;

/** 초대 만료까지 남은 기간 문구 (예: "3일 후 만료", "오늘 만료") */
export const getInvitationExpiryText = (createdAt: string) => {
  const expireAt =
    new Date(createdAt).getTime() + INVITATION_VALID_DAYS * DAY_MS;
  const remainingDays = Math.floor((expireAt - Date.now()) / DAY_MS);
  return remainingDays < 1 ? "오늘 만료" : `${remainingDays}일 후 만료`;
};
