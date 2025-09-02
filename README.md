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
- [x] 쿠폰 조회
  - [ ] 쿠폰 정렬
  - [ ] 사용 가능한 쿠폰만 보기
  - [x] 쿠폰 검색 (사용처, 쿠폰명 검색)
    - [ ] 업로드한 쿠폰에서 키워드 추출
- [x] 쿠폰 상세 조회
  - [x] 쿠폰 사용
- [x] 프로필 조회
  - [x] 프로필 수정
- [x] 그룹 조회
  - [x] 그룹 선택
  - [ ] 그룹 생성
  - [ ] 그룹 초대
    - [ ] 그룹 초대 받기
    - [ ] 초대 목록 조회
  - [ ] 그룹 멤버 조회
  - [ ] 그룹 나가기

- [x] supabase crud 권한 설정

<br/>

## 커밋 prefix

|          | 설명          |
| :------- | :------------ |
| feat     | 기능 추가     |
| fix      | 버그 수정     |
| style    | 스타일 수정   |
| refactor | 코드 리팩토링 |
| docs     | README 수정   |
