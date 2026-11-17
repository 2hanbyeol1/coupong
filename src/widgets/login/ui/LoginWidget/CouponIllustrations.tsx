/**
 * 로그인 화면 쿠폰 미리보기에 쓰는 상품 일러스트 (32×32)
 * 실제 쿠폰 사진 자리를 대신하므로 선 아이콘보다 색이 있는 그림으로 그림
 */

interface IllustrationProps {
  className?: string;
}

export function IcedAmericano({ className }: IllustrationProps) {
  return (
    <svg aria-hidden viewBox="0 0 32 32" className={className}>
      {/* 빨대 */}
      <path
        d="M19.5 1.5 17.6 9"
        stroke="#389970"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* 뚜껑 */}
      <path d="M9.5 8.2C10.5 4.8 21.5 4.8 22.5 8.2Z" fill="#fff" />
      <rect x="7.5" y="7.6" width="17" height="2.4" rx="1.2" fill="#fff" />
      {/* 투명 컵 */}
      <path
        d="M9 10h14l-1.6 17.2a1.8 1.8 0 0 1-1.8 1.6h-7.2a1.8 1.8 0 0 1-1.8-1.6Z"
        fill="#fff"
        fillOpacity=".7"
      />
      {/* 커피 */}
      <path
        d="M9.4 13h13.2l-1.3 14.1a1.6 1.6 0 0 1-1.6 1.5h-7.4a1.6 1.6 0 0 1-1.6-1.5Z"
        fill="#7b4a2a"
      />
      {/* 얼음 */}
      <rect
        x="11.5"
        y="14.5"
        width="4"
        height="4"
        rx="1"
        fill="#fff"
        fillOpacity=".45"
        transform="rotate(-12 13.5 16.5)"
      />
      <rect
        x="16.5"
        y="16.2"
        width="4"
        height="4"
        rx="1"
        fill="#fff"
        fillOpacity=".35"
        transform="rotate(10 18.5 18.2)"
      />
      {/* 컵 반사광 */}
      <path
        d="m11.4 12 1.2 14"
        stroke="#fff"
        strokeOpacity=".5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IceCreamCone({ className }: IllustrationProps) {
  return (
    <svg aria-hidden viewBox="0 0 32 32" className={className}>
      {/* 콘 */}
      <path d="M10.5 16h11l-4.6 13.2a1 1 0 0 1-1.8 0Z" fill="#e9a752" />
      <path
        d="m12.5 16 4.3 10.5M19.5 16l-4.3 10.5M16 16l3 5M16 16l-3 5"
        stroke="#c47f2c"
        strokeWidth=".9"
        strokeLinecap="round"
      />
      {/* 딸기·민트·바닐라 세 덩이 */}
      <circle cx="12.8" cy="13.2" r="4.6" fill="#f27c9b" />
      <circle cx="19.2" cy="13.2" r="4.6" fill="#7ed3ae" />
      <circle cx="16" cy="8.6" r="4.8" fill="#fff6e0" />
      <rect x="10" y="15.6" width="12" height="2" rx="1" fill="#d99440" />
      {/* 체리 */}
      <path
        d="M17.2 2c.8-1.2 2.2-1.2 2.2-1.2"
        stroke="#389970"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="16.8" cy="3.6" r="1.9" fill="#e5484d" />
    </svg>
  );
}

export function StrawberryCake({ className }: IllustrationProps) {
  return (
    <svg aria-hidden viewBox="0 0 32 32" className={className}>
      {/* 접시 */}
      <rect x="4" y="26.4" width="24" height="2" rx="1" fill="#e3cc9c" />
      {/* 생크림 케이크와 딸기잼 층 */}
      <rect
        x="6.5"
        y="14"
        width="19"
        height="12.6"
        rx="2.4"
        fill="#fff"
        stroke="#ead7ae"
        strokeWidth=".8"
      />
      <rect x="6.9" y="19.6" width="18.2" height="1.8" fill="#f5a3b5" />
      {/* 초 */}
      <rect x="15.2" y="7.2" width="1.6" height="6.8" rx=".6" fill="#8db4f0" />
      <path
        d="M16 3c1.2 1.4 1.4 2.4 1.4 3a1.4 1.4 0 0 1-2.8 0c0-.6.2-1.6 1.4-3Z"
        fill="#ffb020"
      />
      {/* 딸기 두 개 */}
      <path
        d="M11.5 9.6c1.6 0 2.6 1 2.6 2.4 0 1.8-1.6 3-2.6 3.4-1-.4-2.6-1.6-2.6-3.4 0-1.4 1-2.4 2.6-2.4Z"
        fill="#e5484d"
      />
      <path
        d="M20.5 9.6c1.6 0 2.6 1 2.6 2.4 0 1.8-1.6 3-2.6 3.4-1-.4-2.6-1.6-2.6-3.4 0-1.4 1-2.4 2.6-2.4Z"
        fill="#e5484d"
      />
      <path
        d="m10.4 9.8 1.1-1.2 1.1 1.2m6.8 0 1.1-1.2 1.1 1.2"
        stroke="#389970"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
