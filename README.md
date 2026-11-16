## 실행 방법

### 1. 로컬에서 실행

```bash
pnpm dev
```

[http://localhost:3000](http://localhost:3000)

### 2. 링크

[https://coupong.vercel.app](https://coupong.vercel.app)

<br/>

## 기술 스택

`next.js` `typescript` `tailwind css` `zustand` `tanstack query`
`pwa (next-pwa)`

<br/>

## 요구사항

- [x] 로그인 / 로그아웃
- [x] 쿠폰 등록
  - [x] 여러 장 한 번에 등록
  - [x] 사용처·쿠폰 이름 자동완성
- [x] 쿠폰 조회
  - [x] 쿠폰 정렬
  - [x] 사용 가능한 쿠폰만 보기
  - [x] 쿠폰 검색 (사용처, 쿠폰명 검색)
    - [x] 추천 검색어 (그룹에서 많이 쓴 사용처)
  - [x] 길게 눌러 수정·삭제 메뉴 열기
- [x] 쿠폰 상세 조회
  - [x] 스와이프로 이전·다음 쿠폰 보기
  - [x] 쿠폰 사진 크게 보기
  - [x] 보는 동안 화면 꺼짐 방지
  - [x] 쿠폰 사용
    - [x] 사용 완료 되돌리기 (5초)
  - [x] 쿠폰 수정
  - [x] 쿠폰 삭제
- [x] 프로필 조회
  - [x] 프로필 수정
  - [x] 다크 모드 (기기 설정을 따르거나 직접 고르기)
- [x] 그룹 조회
  - [x] 그룹 선택
  - [x] 그룹 생성
  - [x] 그룹 초대
    - [x] 그룹 초대 받기
    - [x] 초대 목록 조회
    - [x] 초대 취소
  - [x] 그룹 멤버 조회
    - [x] 관리자 지정·해제
    - [x] 그룹원 내보내기
  - [x] 그룹 나가기
- [x] 쿠폰 알림
  - [x] 쿠폰 추가 시 그룹원들에게 알림
  - [x] 쿠폰 임박 시 그룹원들에게 알림 (7일·3일·1일 전 중 선택)
  - [x] 알림 종류별 켜고 끄기
  - [x] 알림을 누르면 쿠폰 상세로 이동

- [x] supabase crud 권한 설정

<br/>

## Supabase

### Extensions

| 이름     | 역할                                                  |
| :------- | :---------------------------------------------------- |
| `pg_net` | DB에서 외부로 HTTP 요청을 보낼 수 있게 해주는 확장    |
| `pg_cron`| DB 내부에서 동작하는 크론 스케줄러                    |

### Functions

| 이름                          | 스키마   | 역할                                                                                                                    |
| :---------------------------- | :------- | :---------------------------------------------------------------------------------------------------------------------- |
| `handle_new_user`             | `public` | 신규 가입자가 생기면 `public.users`에 대응 행 생성. 이름은 `raw_user_meta_data.name` → `email` → `'사용자'` 순으로 결정 |
| `add_creator_to_organization` | `public` | 그룹 생성자를 `user_organization`에 자동 추가하여 멤버로 등록                                                           |
| `search_coupon_suggestions`   | `public` | 쿠폰 등록 시 사용처·쿠폰 이름 추천 검색. 띄어쓰기·대소문자를 무시해 중복 제거하고 많이 쓴 순으로 반환 (`supabase/sql/search_coupon_suggestions.sql`) |
| `notify_expiring_coupons`     | `public` | Vault에 저장된 `webhook_url`/`webhook_secret`을 꺼내 `pg_net`으로 만료 임박 쿠폰 알림 웹훅을 호출                        |

### Triggers

| 이름                      | 대상 테이블            | 시점         | 호출 함수                     | 역할                                   |
| :------------------------ | :--------------------- | :----------- | :---------------------------- | :------------------------------------- |
| `on_auth_user_created`    | `auth.users`           | AFTER INSERT | `handle_new_user`             | 첫 가입 시 `public.users` 자동 생성    |
| `on_organization_created` | `public.organizations` | AFTER INSERT | `add_creator_to_organization` | 그룹 생성 시 생성자를 멤버로 자동 추가 |

### Cron Jobs

| 이름                       | 스케줄      | 실행 내용                                | 설명                                                     |
| :------------------------- | :---------- | :--------------------------------------- | :------------------------------------------------------- |
| `notify-expiring-coupons`  | `0 0 * * *` | `select public.notify_expiring_coupons()` | 매일 UTC 00:00 (KST 09:00)에 만료 임박 쿠폰 알림 트리거 |

### Vault Secrets

`notify_expiring_coupons`가 동작하려면 Supabase Dashboard → Project Settings → Vault에 아래 secret이 등록되어 있어야 한다.

| 이름             | 값                                                            |
| :--------------- | :------------------------------------------------------------ |
| `webhook_url`    | `https://<your-domain>/api/push/expiring-soon` 형태의 웹훅 URL |
| `webhook_secret` | 임의의 긴 랜덤 문자열. Vercel 환경변수 `WEBHOOK_SECRET`와 동일해야 함 |

<br/>

## 커밋 prefix

|          | 설명          |
| :------- | :------------ |
| feat     | 기능 추가     |
| fix      | 버그 수정     |
| style    | 스타일 수정   |
| refactor | 코드 리팩토링 |
| docs     | README 수정   |
