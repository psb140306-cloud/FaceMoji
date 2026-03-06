# FaceMoji - UI/UX 설계서

> 작성일: 2026-03-06
> 버전: 1.0
> 기술 스택: Next.js 15 + React 19 + TypeScript + Tailwind CSS + shadcn/ui

---

## 1. 사용자 플로우

### 1.1 핵심 플로우 (Happy Path)

```
[랜딩 페이지] → CTA 클릭
    ↓
[사진 업로드] → 셀카 촬영/갤러리 → 얼굴 감지 → PIPA 동의
    ↓
[스타일 선택] → 카툰/플랫 중 선택
    ↓
[생성 대기] → 프로그레스바 (1~3분) → 24개 순차 생성
    ↓
[결과 미리보기] → 워터마크 포함 그리드
    ↓
[결제] → Toss Payments (3,000원/5,000원)
    ↓
[다운로드] → OGQ 규격 ZIP + 제출 가이드
```

### 1.2 분기 플로우

- **얼굴 미감지**: 촬영 가이드 표시 → 재업로드
- **다수 얼굴**: 얼굴 선택 UI 표시
- **생성 실패**: 자동 재시도 2회 → 실패 통보 + 무료 재생성
- **결제 실패**: 에러 메시지 + 다른 결제 수단 제안
- **비로그인**: 미리보기까지 허용 → 결제 시 로그인 요구

### 1.3 페이지 맵

```
/                           랜딩 페이지
/create                     사진 업로드 (Step 1)
/create/style               스타일 선택 (Step 2)
/create/progress             생성 대기
/create/[id]                결과 미리보기
/payment/[generationId]     결제
/payment/success             결제 완료
/payment/fail               결제 실패
/my                         마이페이지
/my/generations             생성 이력
/login                      로그인
/privacy                    개인정보 처리방침
/terms                      이용약관
```

---

## 2. 디자인 시스템

### 2.1 색상 팔레트

#### Primary (브랜드 컬러 - 코랄 레드)

| 이름 | Hex | 용도 |
|------|-----|------|
| Primary 50 | `#FFF1F0` | 배경 틴트, 호버 |
| Primary 100 | `#FFD6D2` | 뱃지 배경 |
| Primary 300 | `#FF8A7E` | 보조 버튼 |
| Primary 400 | `#FF6B5A` | 호버 상태 |
| **Primary 500** | **`#FF4D3A`** | **메인 CTA** |
| Primary 600 | `#E63E2D` | pressed 상태 |
| Primary 700 | `#BF2E20` | 본문 텍스트 링크 (접근성) |

선정 이유: 에너지, 재미, 친근함. MZ세대 비비드 톤.

#### Secondary / Accent

| 이름 | Hex | 용도 |
|------|-----|------|
| Secondary 500 | `#4A7AFF` | 링크, 정보 강조 |
| Yellow | `#FFD43B` | 별점, 인기 뱃지 |
| Green | `#34D399` | 성공 상태 |
| Purple | `#A78BFA` | 프리미엄 표시 |

#### Neutral / Semantic

- Gray 50 `#FAFAFA` ~ Gray 900 `#171717` (Tailwind 기본)
- Error `#EF4444`, Warning `#F59E0B`, Success `#22C55E`, Info `#3B82F6`

### 2.2 타이포그래피

| 용도 | 폰트 |
|------|------|
| 한글 본문 | **Pretendard** (가변, 한글 최적화) |
| 영문/숫자 | **Geist Sans** (Next.js 기본) |
| 모노스페이스 | **Geist Mono** |

| 레벨 | 모바일 | 데스크톱 | Weight |
|------|--------|---------|--------|
| Display | 28px | 40px | 800 |
| H1 | 24px | 32px | 700 |
| H2 | 20px | 24px | 700 |
| H3 | 18px | 20px | 600 |
| Body | 14px | 16px | 400 |
| Caption | 12px | 12px | 400 |

### 2.3 간격 & 반경

- 기본 단위: 4px (Tailwind 스케일)
- 카드 패딩: 16px (모바일), 24px (데스크톱)
- 섹션 간격: 48px (모바일), 80px (데스크톱)
- 반경: sm=6px, md=8px, lg=12px, xl=16px, full=9999px

### 2.4 브레이크포인트

| 이름 | 값 | 대상 |
|------|-----|------|
| sm | 640px | 스마트폰 가로 |
| md | 768px | 태블릿 |
| lg | 1024px | 데스크톱 |
| xl | 1280px | 대형 데스크톱 (max-w: 1200px) |

---

## 3. 화면별 설계

### 3.1 랜딩 페이지 (/)

**구성**: 히어로 → 3스텝 안내 → 샘플 갤러리 → OGQ 설명 → 가격표 → CTA

| 요소 | 모바일 | 데스크톱 |
|------|--------|---------|
| 히어로 | 1컬럼: 텍스트 위, 비주얼 아래 | 2컬럼: 좌측 텍스트, 우측 비주얼 |
| 3스텝 | 가로 스크롤 카드 | 3컬럼 고정 |
| 샘플 그리드 | 2열 x 3행 | 6열 x 1행 |
| 가격 카드 | 1컬럼 스택 | 2컬럼 나란히 |
| CTA | 풀 너비 | max-w-sm, 중앙 |

핵심: 셀카→이모티콘 변환 루프 애니메이션, CTA 상단+하단 2곳 배치, 가격 투명 표기

### 3.2 사진 업로드 (/create)

**스텝 위저드 Step 1**: 업로드 영역 + 얼굴 감지 결과 + PIPA 동의

- 모바일: `capture="user"` 전면 카메라 기본
- 데스크톱: 드래그&드롭 기본
- 업로드 후: 원형 크롭 프리뷰(200x200) + 감지 결과 체크리스트
- PIPA 동의: 체크박스 2개 (수집/이용, 해외 이전) + "자세히 보기" Sheet
- "사진은 이모티콘 생성 후 즉시 삭제됩니다" 안내

### 3.3 스타일 선택 (/create/style)

**스텝 위저드 Step 2**: 스타일 카드 그리드

- 각 카드: 샘플 이모티콘 2x2 + 스타일명 + 설명 + 가격
- 선택 시 Primary 보더 + ring + scale(1.02)
- 모바일: 1컬럼 / 데스크톱: 2컬럼
- CTA: "이모티콘 만들기 (약 2분)"

### 3.4 생성 대기 (/create/progress)

- 중앙 애니메이션 (200x200) + "이모티콘을 만들고 있어요"
- Progress바 (0~24 기반, 정직한 진행률)
- 완성된 이모티콘 순차 fade-in (48x48 미니 그리드)
- 하단: 재미 요소 카드 로테이션 (OGQ 팁 등)
- 뒤로가기 방지 (beforeunload 확인)
- 백그라운드 생성 지원 (탭 전환 시 계속, 완료 시 Notification)

### 3.5 결과 화면 (/create/[id])

- 이모티콘 그리드: 모바일 4열 / 데스크톱 6열
- 각 셀: 워터마크 + 표정 라벨
- 탭/클릭: 개별 확대 (모바일 Drawer, 데스크톱 Dialog)
- 좌우 내비게이션 (모바일 스와이프, 데스크톱 화살표)
- Sticky Bottom CTA: "다운로드 3,000원"

### 3.6 결제 (/payment/[generationId])

- 주문 요약 카드 (이모티콘 2x2 미리보기 + 가격)
- 결제 수단 RadioGroup (카드, 카카오페이, 네이버페이)
- 결제 동의 체크박스
- 신뢰 뱃지 (Toss Payments, SSL)
- 모바일: 1컬럼 / 데스크톱: 2컬럼 (좌 요약, 우 결제)

### 3.7 결제 완료 (/payment/success)

- 체크 아이콘 + confetti 애니메이션
- ZIP 다운로드 버튼 (자동 다운로드 + 수동 버튼)
- OGQ 제출 가이드 버튼
- ZIP 내부 폴더 구조 시각화
- "새 이모티콘 만들기" / "마이페이지" 링크

### 3.8 마이페이지 (/my)

- 프로필 영역 (아바타 + 이름 + 이메일)
- 생성 이력 카드 리스트
  - 결제 완료: 다운로드 버튼
  - 미결제: 결제 버튼
  - 만료 임박: Warning 색상 표시
- 7일 보관 정책 안내

---

## 4. shadcn/ui 컴포넌트 매핑

| 용도 | 컴포넌트 | 화면 |
|------|---------|------|
| 알림 | Sonner | 전체 |
| 사용자 메뉴 | DropdownMenu + Avatar | 헤더 |
| 모바일 메뉴 | Sheet | 헤더 |
| 업로드 PIPA | Checkbox | /create |
| 스타일 카드 | Card + Badge | /create/style |
| 프로그레스바 | Progress | /create/progress |
| 스티커 그리드 | Card 반복 (CSS Grid) | /create/[id] |
| 확대 미리보기 | Dialog (데스크톱) / Drawer (모바일) | /create/[id] |
| 로딩 상태 | Skeleton | 전체 |
| 결제 수단 | RadioGroup (직접 구현) | /payment |
| 가격/요약 | Card + Separator | /payment |
| 뒤로가기 확인 | AlertDialog (직접 구현) | /create/progress |
| 탭 메뉴 | Tabs | /my |
| 버튼 | Button | 전체 |

직접 구현 필요: 이모티콘 그리드, 스텝 인디케이터, 업로드 dropzone, RadioGroup, AlertDialog

---

## 5. 반응형 전략 요약

| 요소 | 모바일 (< 768px) | 데스크톱 (>= 1024px) |
|------|-----------------|-------------------|
| 네비게이션 | Sheet 햄버거 | 수평 네비 |
| 업로드 | 카메라 우선 | 드래그&드롭 우선 |
| 스타일 카드 | 1열 | 2열 |
| 이모티콘 그리드 | 4열 (80x69px) | 6열 (160x138px) |
| 확대 보기 | Drawer (하단) | Dialog (중앙) |
| CTA | Sticky Bottom Bar | 인라인 또는 Sticky Sidebar |
| 결제 | 1컬럼 | 2컬럼 |
| 터치 타겟 | 최소 48px | 44px 허용 |

---

## 6. 에러 상태

| 상황 | UI 처리 |
|------|---------|
| 얼굴 미감지 | Error 보더 + 가이드 자동 펼침 |
| 파일 형식/크기 오류 | Toast 알림 |
| 생성 실패 (3회) | 에러 화면 + 무료 재생성 버튼 |
| 결제 실패 | AlertDialog + 다른 수단 제안 |
| 세션 만료 | Toast + 로그인 리다이렉트 |
| Rate Limit | AlertDialog + 대기 시간 표시 |
| 만료 결과 접근 | "만료됨" 안내 + "새로 만들기" CTA |

---

## 7. 사용자 여정 시간 목표

| 구간 | 목표 |
|------|------|
| 랜딩 → CTA 클릭 | 10초 |
| 사진 업로드 완료 | 30초 |
| 스타일 선택 | 10초 |
| 생성 대기 | 1~3분 |
| 결과 확인 → 결제 | 30초 |
| 결제 완료 | 30초 |
| **전체 (업로드 → 다운로드)** | **5분 이내** |

---

## 부록: 컴포넌트 계층 구조

```
components/
  layout/       Header, Footer, MobileNav, PageContainer
  create/       StepIndicator, PhotoUploader, FaceDetectionResult,
                PipaConsent, ShootingGuide, StyleCard, StyleSelector
  loading/      GenerationProgress, ProgressAnimation, MiniGrid, FunFact
  result/       EmojiGrid, EmojiCell, EmojiDetailModal, StickyBottomBar, WatermarkOverlay
  payment/      OrderSummary, PaymentMethodSelect, PaymentComplete
  mypage/       ProfileCard, HistoryCard, HistoryList
  shared/       Providers, ErrorBoundary, EmptyState, TrustBadge
```

## 부록: Tailwind 커스텀 색상

```
primary: {
  50: '#FFF1F0', 100: '#FFD6D2', 200: '#FFB0A8', 300: '#FF8A7E',
  400: '#FF6B5A', 500: '#FF4D3A', 600: '#E63E2D', 700: '#BF2E20',
  800: '#991F15', 900: '#73110C'
}
secondary: { 50: '#F0F4FF', 100: '#D6E2FF', 500: '#4A7AFF', 700: '#2952CC' }
```
