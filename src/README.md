# Feature-Sliced Design (FSD) 구조

이 프로젝트는 Feature-Sliced Design 아키텍처를 따릅니다.

## 폴더 구조

```
src/
├── app/                    # Next.js App Router
│   ├── (home)/
│   │   └── page.tsx       # 홈페이지 라우트
│   ├── layout.tsx          # 루트 레이아웃
│   └── globals.css        # 전역 스타일
├── widgets/                # 위젯 (큰 UI 블록)
│   └── home/
│       ├── ui/
│       │   └── HomeWidget.tsx
│       └── index.ts
├── features/               # 기능 단위
├── entities/               # 비즈니스 엔티티
└── shared/                 # 공유 유틸리티
    ├── ui/                 # 공유 UI 컴포넌트
    │   ├── Logo/
    │   ├── Title/
    │   └── index.ts
    ├── lib/                # 공유 라이브러리
    ├── api/                # API 관련
    ├── config/             # 설정
    └── assets/             # 에셋
```

## 레이어 규칙

1. **app**: Next.js App Router 설정
2. **widgets**: 큰 UI 블록 (페이지의 주요 섹션)
3. **features**: 기능 단위 (사용자 액션, 비즈니스 로직)
4. **entities**: 비즈니스 엔티티, 도메인 모델 (ex. User, Product 등)
5. **shared**: 공유 유틸리티 (UI, 라이브러리, 설정 등)

## 의존성 규칙

- 상위 레이어는 하위 레이어에만 의존할 수 있음
- 같은 레이어 내에서는 의존성 없음
- 하위 레이어는 상위 레이어에 의존할 수 없음

예: `pages` → `widgets` → `features` → `entities` → `shared`
