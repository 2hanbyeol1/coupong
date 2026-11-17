import { CSSProperties } from "react";

import { cn } from "@/shared/lib/util/cn";
import { Chip } from "@/shared/ui";

import {
  IceCreamCone,
  IcedAmericano,
  StrawberryCake,
} from "./CouponIllustrations";

/**
 * 그룹원마다 다른 얼굴색
 * 밝기·채도를 맞춘 파스텔 바탕에 같은 색 계열의 진한 눈코입 (쿠폰 그림 바탕색과 어울리게)
 */
const MEMBER_COLORS = {
  me: { face: "#cfebdd", feature: "#2e7d5b" },
  friend: { face: "#ffdcc9", feature: "#b5562d" },
  mom: { face: "#dbe5ff", feature: "#4064b8" },
} as const;

type Member = keyof typeof MEMBER_COLORS;

interface PreviewItem {
  illustration: typeof IcedAmericano;
  /** 상품마다 어울리는 옅은 바탕색 (다크 모드는 어둡게) */
  tileClassName: string;
  place: string;
  name: string;
  daysLeft: string;
  isUrgent?: boolean;
  /** 이 쿠폰을 넣은 그룹원 */
  member: Member;
  memberLabel: string;
  /** 쌓였을 때 자리 (살짝 어긋나고 기울어 손으로 모은 느낌) */
  tx: string;
  rot: string;
  /** 날아오기 시작하는 쪽 */
  fromX: string;
}

const PREVIEW_ITEMS: PreviewItem[] = [
  {
    illustration: IceCreamCone,
    tileClassName: "bg-[#ffe4ec] dark:bg-[#3d2a31]",
    place: "아이스크림",
    name: "파인트 교환권",
    daysLeft: "D-21",
    member: "friend",
    memberLabel: "친구",
    tx: "8px",
    rot: "-2deg",
    fromX: "-56px",
  },
  // 브랜드색(초록) 얼굴인 '나'의 쿠폰을 가운데에 둬서 위쪽 얼굴 줄도 초록이 가운데
  {
    illustration: IcedAmericano,
    tileClassName: "bg-[#efe2d4] dark:bg-[#3a2f26]",
    place: "카페",
    name: "아이스 아메리카노 T",
    daysLeft: "D-3",
    isUrgent: true,
    member: "me",
    memberLabel: "나",
    tx: "-12px",
    rot: "1deg",
    fromX: "56px",
  },
  {
    illustration: StrawberryCake,
    tileClassName: "bg-[#fff3d1] dark:bg-[#3a3424]",
    place: "베이커리",
    name: "생크림 케이크 1호",
    daysLeft: "D-45",
    member: "mom",
    memberLabel: "엄마",
    tx: "4px",
    rot: "-1deg",
    fromX: "-56px",
  },
];

/** 순서대로 등장: 그룹원 얼굴 → 각자 넣은 쿠폰 → 쿠폰에 붙은 얼굴 */
const AVATAR_DELAY_MS = 0;
const CARD_DELAY_MS = 300;
const BADGE_DELAY_MS = 750;
const STAGGER_MS = 120;

/** 움직임 줄이기 설정이면 애니메이션 없이 최종 모습만 */
const ANIMATION = "motion-reduce:animate-none";

/** 동그란 얼굴 일러스트 */
interface MemberFaceProps {
  member: Member;
  className?: string;
  style?: CSSProperties;
}

function MemberFace({ member, className, style }: MemberFaceProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={cn("ring-surface shrink-0 rounded-full ring-2", className)}
      style={style}
    >
      <circle cx="12" cy="12" r="12" fill={MEMBER_COLORS[member].face} />
      <circle cx="8.8" cy="10.6" r="1.3" fill={MEMBER_COLORS[member].feature} />
      <circle
        cx="15.2"
        cy="10.6"
        r="1.3"
        fill={MEMBER_COLORS[member].feature}
      />
      <path
        d="M8.6 14.3c.9 1.3 2 1.9 3.4 1.9s2.5-.6 3.4-1.9"
        fill="none"
        stroke={MEMBER_COLORS[member].feature}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * 가족·친구가 각자 받은 쿠폰을 한 쿠폰함에 모으는 장면 (실제 데이터 아님)
 * - 그룹원 얼굴이 먼저 나오고, 쿠폰이 양옆에서 날아와 쌓인 뒤, 누가 넣었는지 얼굴이 붙음
 * - 움직임 줄이기 설정이면 처음부터 다 쌓인 모습
 */
function CouponPreview() {
  return (
    <div aria-hidden className="flex w-full flex-col items-center gap-3">
      <div className="flex gap-1.5">
        {PREVIEW_ITEMS.map(({ member }, index) => (
          <MemberFace
            key={member}
            member={member}
            className={cn("animate-pop-in size-9", ANIMATION)}
            style={{
              animationDelay: `${AVATAR_DELAY_MS + index * STAGGER_MS}ms`,
            }}
          />
        ))}
      </div>

      <ul className="flex w-full flex-col gap-2.5">
        {PREVIEW_ITEMS.map((item, index) => {
          const { illustration: Illustration } = item;
          return (
            <li
              key={item.name}
              className={cn(
                "bg-elevated ring-ink/5 animate-card-in flex items-center gap-3 rounded-2xl p-3 shadow-[0_4px_16px_-6px_rgb(0_0_0/0.12)] ring-1 dark:shadow-none",
                ANIMATION,
              )}
              style={
                {
                  "--tx": item.tx,
                  "--rot": item.rot,
                  "--from-x": item.fromX,
                  transform: `translateX(${item.tx}) rotate(${item.rot})`,
                  animationDelay: `${CARD_DELAY_MS + index * STAGGER_MS}ms`,
                } as CSSProperties
              }
            >
              <div className="relative shrink-0">
                <div
                  className={cn(
                    "flex size-11 items-center justify-center rounded-xl",
                    item.tileClassName,
                  )}
                >
                  <Illustration className="size-8" />
                </div>
                <MemberFace
                  member={item.member}
                  className={cn(
                    "ring-elevated animate-pop-in absolute -right-1.5 -bottom-1.5 size-5",
                    ANIMATION,
                  )}
                  style={{
                    animationDelay: `${BADGE_DELAY_MS + index * STAGGER_MS}ms`,
                  }}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="text-dark truncate text-xs font-medium">
                  {item.place} · {item.memberLabel}
                </div>
                <div className="truncate text-sm font-semibold">
                  {item.name}
                </div>
              </div>

              <Chip
                color={item.isUrgent ? "danger" : "muted"}
                className="font-semibold"
              >
                {item.daysLeft}
              </Chip>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default CouponPreview;
