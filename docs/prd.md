# 나만의 이모티콘 생성 서비스 - PRD (Product Requirements Document)

> 작성일: 2026-03-04
> 버전: 1.0
> Go/No-Go: Conditional Go (3.75/5.0) → Go 확정
> 조건: PoC 2주 선행 (얼굴 유사도 검증)

---

## 1. Problem Statement

**이모티콘을 만들고 싶지만 만들 수 없다.**

한국에서 이모티콘은 일상 커뮤니케이션의 핵심 도구다 (월 3,000만 명 사용, 누적 구매자 2,700만 명). 그러나 "나만의 이모티콘"을 만들려면:

1. **그림 실력** 필요 → 대다수 일반인에게 진입 장벽
2. **외주 비용** 50만원+ → 개인에게 부담
3. **플랫폼 규격** 복잡 → OGQ(740×640px, 24개), 카카오(360×360px, 32개) 각기 다름
4. **직접 제작** 수주~수개월 → 시간 부담

AI 이미지 생성 기술이 성숙했지만, **한국 이모티콘 플랫폼 규격에 특화된 얼굴 기반 AI 서비스는 아직 없다.**

---

## 2. 사용자 스토리

### 2.1 핵심 시나리오

**일반 사용자 (MZ세대):**
> "사용자로서, 셀카 1장만 올리면 나와 닮은 24개 이모티콘 세트를 받을 수 있다. 그래서 카톡/인스타에서 나만의 이모티콘으로 채팅할 수 있다."

**이모티콘 작가 지망생:**
> "작가 지망생으로서, AI가 만든 이모티콘을 편집하고 OGQ 마켓에 바로 제출할 수 있다. 그래서 그림 실력 없이도 이모티콘 작가가 되어 수익을 올릴 수 있다."

**기업 담당자:**
> "마케터로서, 브랜드 캐릭터 이미지로 이모티콘 세트를 빠르게 만들 수 있다. 그래서 외주 비용 50만원 대신 5만원으로 브랜드 이모티콘을 배포할 수 있다."

### 2.2 상세 시나리오

| # | 사용자 | 행동 | 기대 결과 |
|---|--------|------|----------|
| US-1 | 일반 사용자 | 셀카 1장 업로드 + 스타일 선택 | 24개 이모티콘 세트 미리보기 (워터마크) |
| US-2 | 일반 사용자 | 결제 (3,000원) | 워터마크 없는 고해상도 세트 ZIP 다운로드 |
| US-3 | 일반 사용자 | OGQ 규격 다운로드 버튼 클릭 | OGQ 규격(740×640px) 패키지 + 제출 가이드 PDF |
| US-4 | 일반 사용자 | 카카오톡 개인 사용 다운로드 | 투명 배경 PNG 세트 (개인 사용용) |
| US-5 | 작가 지망생 | 생성된 이모티콘 편집 (텍스트 추가) | 텍스트/말풍선이 추가된 이모티콘 |
| US-6 | 작가 지망생 | 마켓플레이스에 등록 | 다른 사용자가 구매 가능한 상태 |
| US-7 | 구매자 | 마켓플레이스에서 이모티콘 세트 구매 | 다운로드 + 작가에게 수익 분배 |
| US-8 | 구독자 | 월 구독 결제 | 무제한 이모티콘 생성 |
| US-9 | 기업 담당자 | 브랜드 로고/캐릭터로 이모티콘 생성 | 상업 라이선스 포함 세트 |

---

## 3. Functional Requirements

### 3.1 필수 기능 (Must Have) — MVP

#### F1: 사진 업로드 및 얼굴 감지
- [ ] 셀카/사진 1장 업로드 (JPEG, PNG, WebP, 최대 10MB)
- [ ] 얼굴 감지 및 품질 검증 (정면, 조명, 해상도)
- [ ] 얼굴 1개만 허용 (다수 얼굴 시 선택 요청)
- [ ] PIPA 동의 UI (개인정보 수집/이용 동의, 국외 이전 동의)
- [ ] 업로드 즉시 임시 저장, 생성 완료 후 원본 자동 삭제

#### F2: AI 이모티콘 생성
- [ ] 24개 표정/포즈 프리셋으로 이모티콘 세트 자동 생성
- [ ] 한국형 표정 프리셋 (웃음, 하트, 눈물, 화남, 아이고, 대박 등)
- [ ] 생성 중 프로그레스바 표시 (예상 소요 시간: 1~3분)
- [ ] 생성 실패 시 자동 재시도 (최대 2회)

#### F3: 스타일 선택
- [ ] MVP: 카툰, 플랫 2종 스타일
- [ ] v1.0: 애니메, 수채화, 3D, 만화 추가 (총 6종)
- [ ] 스타일 미리보기 (샘플 이미지)

#### F4: OGQ 규격 자동 변환 및 다운로드
- [ ] 스티커 이미지: 24개, 740×640px, PNG, 투명 배경
- [ ] 메인 이미지: 1개, 240×240px 자동 생성
- [ ] 탭 이미지: 1개, 96×74px 자동 생성
- [ ] 흰색 테두리 자동 추가 (다크모드 대응)
- [ ] 파일 용량 1MB 이하 자동 최적화
- [ ] ZIP 패키지 다운로드 (폴더 구조: stickers/, main.png, tab.png)
- [ ] OGQ 크리에이터 스튜디오 제출 가이드 PDF 포함

#### F5: 결제 시스템
- [ ] Toss Payments 연동 (카드, 카카오페이, 네이버페이)
- [ ] 건당 결제: 세트 1건 3,000원 (기본), 5,000원 (프리미엄 스타일)
- [ ] 결제 전 미리보기 (워터마크 포함 저해상도)
- [ ] 결제 후 고해상도 원본 다운로드 활성화
- [ ] 영수증 발급 (이메일)

#### F6: 사용자 인증
- [ ] Supabase Auth (이메일, Google, Kakao 소셜 로그인)
- [ ] 비로그인 사용자: 미리보기만 가능, 결제/다운로드 시 로그인 요구
- [ ] 생성 이력 관리 (최근 10건, 7일 보관)

### 3.2 권장 기능 (Should Have) — v1.0

#### F7: 텍스트/말풍선 추가
- [ ] 이모티콘별 텍스트 입력 (최대 10자)
- [ ] 말풍선 스타일 3종 (기본, 둥근, 폭발)
- [ ] 한글 폰트 3종 번들 (둥근, 손글씨, 굵은)
- [ ] 텍스트 위치/크기 조정 (드래그)

#### F8: 구독제
- [ ] 베이직: 9,900원/월 (10세트/월)
- [ ] 프로: 19,900원/월 (무제한 생성 + 프리미엄 스타일)
- [ ] 구독 관리 (해지, 재가입, 결제 이력)

#### F9: 마켓플레이스
- [ ] 작가 프로필 등록 (닉네임, 소개, 포트폴리오)
- [ ] 이모티콘 세트 판매 등록 (가격 설정: 1,000~5,000원)
- [ ] 구매자 다운로드 및 리뷰
- [ ] 수수료 정산 (판매가의 20~30%)
- [ ] 인기 작가/세트 랭킹
- [ ] 카테고리/태그 검색

#### F10: 이모티콘 편집기
- [ ] 생성된 이모티콘 개별 수정 (재생성, 삭제, 순서 변경)
- [ ] 불만족 이모티콘 1장 단위 재생성 (프롬프트 조정)
- [ ] 세트 내 이모티콘 교체/추가

### 3.3 선택 기능 (Nice to Have) — v1.5+

#### F11: 움직이는 이모티콘
- [ ] GIF/APNG 애니메이션 스티커 생성
- [ ] OGQ 애니메이션 규격 (740×640px, 최대 3초, 100프레임)
- [ ] 간단한 모션 프리셋 (흔들기, 깜빡임, 점프)

#### F12: 확장 세트
- [ ] 커플 이모티콘 (2인 사진 → 커플 세트 24개)
- [ ] 반려동물 이모티콘 (강아지/고양이 사진 → 24개)
- [ ] 시즌 이벤트 세트 (크리스마스, 설날, 추석 등)

#### F13: B2B 브랜드 서비스
- [ ] 기업 전용 대시보드
- [ ] 브랜드 가이드라인 반영 (색상, 로고)
- [ ] 대량 생성 (직원 단체 이모티콘)
- [ ] 상업 라이선스 포함

---

## 4. Non-Goals (이번 범위 제외)

- **카카오톡 이모티콘 스튜디오 직접 연동**: AI 입점 제한 정책 유지 중
- **OGQ API 자동 업로드**: OGQ가 공개 API를 미제공
- **실시간 카메라 이모티콘 생성**: 기술적 복잡도 과도
- **3D 아바타 생성**: 제페토와 직접 경쟁 회피, 2D 스티커 집중
- **AR 필터/이모티콘**: 스노우와 직접 경쟁 회피
- **다국어 지원 (영어 등)**: 한국 시장 우선, 글로벌은 v3.0+

---

## 5. Design Considerations

### 5.1 UI/UX 방향

**디자인 원칙:**
- **3단계 완료**: 업로드 → 스타일 선택 → 결과 확인 (3분 이내)
- **모바일 퍼스트**: 셀카 업로드가 핵심이므로 모바일 최적화
- **미리보기 우선**: 결제 전 워터마크 미리보기로 기대치 관리
- **한국어 네이티브**: 모든 UI/UX 한국어 우선

**핵심 화면:**

1. **랜딩 페이지**: 서비스 소개, 샘플 결과물, CTA (사진 업로드)
2. **업로드 화면**: 드래그&드롭 / 카메라 촬영, PIPA 동의 체크
3. **스타일 선택**: 스타일 카드 그리드, 각 스타일별 샘플
4. **생성 대기**: 프로그레스바, 예상 시간, 재미 요소 (생성 과정 애니메이션)
5. **결과 화면**: 24개 이모티콘 그리드, 개별 확대, OGQ 규격 다운로드 버튼
6. **결제 화면**: 가격, 결제 수단, 영수증
7. **마이페이지**: 생성 이력, 다운로드, 구독 관리
8. **마켓플레이스**: 인기 세트, 카테고리 검색, 작가 프로필

### 5.2 데이터 모델

```
users
├── id (UUID, PK)
├── email
├── display_name
├── avatar_url
├── subscription_type (free | basic | pro)
├── subscription_expires_at
├── created_at
└── updated_at

generations
├── id (UUID, PK)
├── user_id (FK → users)
├── style (cartoon | flat | anime | watercolor | 3d | manga)
├── status (pending | processing | completed | failed)
├── sticker_count (24)
├── face_similarity_score (0~1)
├── cost_usd (API 비용)
├── created_at
└── expires_at (7일 후 자동 삭제)

stickers
├── id (UUID, PK)
├── generation_id (FK → generations)
├── index (1~24)
├── expression (smile | heart | cry | angry | ...)
├── image_url (Supabase Storage)
├── ogq_image_url (740×640 변환본)
├── has_text (boolean)
├── text_content
└── created_at

payments
├── id (UUID, PK)
├── user_id (FK → users)
├── generation_id (FK → generations)
├── amount (KRW)
├── payment_method (card | kakaopay | naverpay)
├── toss_payment_key
├── status (pending | completed | failed | refunded)
└── created_at

marketplace_listings
├── id (UUID, PK)
├── seller_id (FK → users)
├── generation_id (FK → generations)
├── title
├── description
├── price (KRW)
├── category
├── tags (text[])
├── sales_count
├── rating_avg
├── status (active | sold_out | hidden)
└── created_at

marketplace_purchases
├── id (UUID, PK)
├── buyer_id (FK → users)
├── listing_id (FK → marketplace_listings)
├── payment_id (FK → payments)
├── amount (KRW)
├── commission_amount (수수료)
└── created_at

subscriptions
├── id (UUID, PK)
├── user_id (FK → users)
├── plan (basic | pro)
├── amount (KRW)
├── status (active | cancelled | expired)
├── starts_at
├── expires_at
├── toss_billing_key
└── created_at
```

### 5.3 API 설계 방향

**인증:**
- `POST /api/auth/login` — 소셜 로그인 (Supabase Auth)
- `POST /api/auth/logout`

**이모티콘 생성:**
- `POST /api/generate` — 사진 업로드 + 스타일 선택 → 생성 시작
- `GET /api/generate/:id` — 생성 상태 확인 (polling)
- `GET /api/generate/:id/preview` — 미리보기 (워터마크)
- `GET /api/generate/:id/download` — 다운로드 (결제 후)
- `GET /api/generate/:id/download/ogq` — OGQ 규격 패키지 다운로드

**결제:**
- `POST /api/payments/request` — 결제 요청 (Toss Payments)
- `POST /api/payments/confirm` — 결제 승인 콜백
- `GET /api/payments/:id` — 결제 상태 조회

**마켓플레이스:**
- `GET /api/marketplace` — 이모티콘 목록 (검색, 필터, 정렬)
- `POST /api/marketplace/listings` — 판매 등록
- `POST /api/marketplace/purchase` — 구매
- `GET /api/marketplace/sellers/:id` — 작가 프로필

**사용자:**
- `GET /api/users/me` — 내 정보
- `GET /api/users/me/generations` — 생성 이력
- `POST /api/subscriptions` — 구독 시작
- `DELETE /api/subscriptions` — 구독 해지

**AI 서버 (FastAPI, 내부 호출):**
- `POST /ai/generate` — 이모티콘 세트 생성 요청
- `GET /ai/status/:job_id` — 생성 상태
- `POST /ai/resize` — OGQ/카카오 규격 변환

---

## 6. 기술적 제약사항

### 6.1 성능 요구사항
- 이모티콘 세트 생성: **3분 이내** (24개 세트)
- 페이지 로드: **2초 이내** (LCP)
- 이미지 다운로드: **5초 이내** (24개 ZIP)
- 동시 생성 요청: **50건/분** (MVP), **500건/분** (v1.0)

### 6.2 보안 요구사항
- 얼굴 사진 암호화 전송 (HTTPS TLS 1.3)
- 원본 사진 생성 완료 후 즉시 삭제 (메모리 + 스토리지)
- 생성된 이모티콘 7일 보관 후 자동 삭제 (유료 결제 건 제외)
- PIPA 준수: 동의 기록 5년 보관
- Rate limiting: IP당 5회/시간 (미인증), 20회/시간 (인증)

### 6.3 호환성 요구사항
- 브라우저: Chrome 90+, Safari 15+, Firefox 90+, Edge 90+
- 모바일: iOS Safari 15+, Android Chrome 90+
- 해상도: 반응형 (360px~1920px)

---

## 7. 성공 기준 (KPI)

### MVP KPI (출시 후 4주)

| 지표 | 목표 | 측정 방법 |
|------|------|---------|
| 유사도 만족율 | 80%+ | 생성 후 설문 ("닮았나요?" 4/5점 이상) |
| 결제 전환율 | 20%+ | 유료 결제 / 미리보기 완료 |
| 유료 결제 건수 | 50건+ | Toss Payments 대시보드 |
| 평균 생성 시간 | 3분 이내 | 서버 로그 |
| 불만족 재생성율 | 30% 이하 | 재생성 요청 / 총 생성 |

### v1.0 KPI (출시 후 3개월)

| 지표 | 목표 | 측정 방법 |
|------|------|---------|
| MAU | 1,000명+ | Supabase Auth 로그 |
| 월 매출 | 100만원+ | 결제 대시보드 |
| OGQ 등록 작가 | 50명+ | 사용자 설문/추적 |
| 마켓 거래 건수 | 100건+/월 | 마켓플레이스 DB |
| 구독 전환율 | 5%+ | 구독자 / 총 사용자 |
| NPS | 40+ | 분기 설문 |
