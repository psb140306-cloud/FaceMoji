# FaceMoji - 전체 시스템 아키텍처 설계서

> 작성일: 2026-03-06
> 버전: 1.0
> 기반 문서: PRD v1.0, 작업계획서

---

## 1. 전체 시스템 아키텍처

```
사용자 (브라우저/모바일)
    | HTTPS
    v
Vercel Edge Network (CDN)
    Next.js 15 App (App Router + SSR)
    ├── API Routes /api/*
    ├── Server Components
    └── Static Assets
    |
    | 내부 API 호출 (HTTPS + X-API-Key)
    v
FastAPI AI 서버 (Railway / Render)
    ├── /ai/generate    — 이모티콘 세트 생성
    ├── /ai/status      — 생성 상태 조회
    ├── /ai/resize      — OGQ 규격 변환
    └── /ai/health      — 헬스체크
    |
    | MVP: fal.ai API / v1.5+: RunPod Serverless
    v
Supabase (Auth + PostgreSQL + Storage)
    |
    v
외부 서비스: Toss Payments, Sentry, Vercel Analytics
```

## 2. 데이터 흐름 (이모티콘 생성)

1. 사용자: 셀카 업로드 + PIPA 동의 + 스타일 선택
2. Next.js API Route `POST /api/generate`: 이미지 검증 → Supabase Storage 저장 → FastAPI 호출
3. FastAPI `POST /ai/generate`: 작업 큐 등록 → fal.ai 24회 호출 → 결과 Storage 저장
4. Next.js `GET /api/generate/:id`: 클라이언트 polling (3초 간격)
5. 결과 표시: 24개 그리드 (워터마크 미리보기)
6. 결제: Toss Payments → 고해상도 다운로드 활성화
7. OGQ 다운로드: 규격 변환 → ZIP 패키징

## 3. API 설계

### Next.js API Routes

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| POST | /api/generate | 생성 시작 | 필수 |
| GET | /api/generate/[id] | 상태 조회 (polling) | 필수 |
| GET | /api/generate/[id]/preview | 워터마크 미리보기 | 선택 |
| GET | /api/generate/[id]/download | 다운로드 (결제 후) | 필수+결제 |
| GET | /api/generate/[id]/download/ogq | OGQ 패키지 | 필수+결제 |
| POST | /api/payments/request | 결제 요청 | 필수 |
| POST | /api/payments/confirm | 결제 승인 (웹훅) | 서버 검증 |
| GET | /api/users/me | 내 정보 | 필수 |
| GET | /api/users/me/generations | 생성 이력 | 필수 |

### FastAPI 엔드포인트 (내부 전용)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | /ai/generate | 세트 생성 요청 |
| GET | /ai/status/{job_id} | 상태 조회 |
| POST | /ai/resize | OGQ 규격 변환 |
| GET | /ai/health | 헬스체크 |

### 서버 간 통신
- 인증: `X-API-Key` 헤더 (서버 간 공유 시크릿)
- 타임아웃: 생성 요청 5초 (비동기), 상태 조회 3초
- 재시도: exponential backoff (1s, 2s, 4s), 최대 3회

## 4. 상태 관리

| 범주 | 도구 | 예시 |
|------|------|------|
| 서버 캐시 | React Query | 생성 상태, 사용자 정보, 이력 |
| 클라이언트 UI | Zustand | 현재 스텝, 모달, 선택 스티커 |
| 폼 | React Hook Form + Zod | 업로드 폼, 결제 폼 |
| URL | Next.js searchParams | 마켓 필터, 페이지네이션 |
| 인증 | Supabase Auth + Zustand | 로그인 여부, 프로필 |

## 5. 인증 플로우

- 비로그인: 업로드 + 미리보기까지 허용, 결제/다운로드 시 로그인 요구
- 로그인: Supabase Auth (이메일, Google, Kakao v1.0)
- 세션: JWT httpOnly 쿠키, Next.js middleware에서 자동 갱신
- RLS: 본인 데이터만 접근 가능

## 6. 에러 처리

| 에러 코드 | HTTP | 메시지 |
|-----------|------|--------|
| FACE_NOT_DETECTED | 400 | 얼굴이 감지되지 않았어요 |
| MULTIPLE_FACES | 400 | 1명만 나온 사진을 사용해 주세요 |
| IMAGE_TOO_LARGE | 400 | 10MB 이하 이미지를 업로드해 주세요 |
| GENERATION_FAILED | 500 | 이모티콘 생성에 실패했어요 (자동 재시도 2회) |
| PAYMENT_FAILED | 400 | 결제에 실패했어요 |
| UNAUTHORIZED | 401 | 로그인이 필요해요 |
| RATE_LIMITED | 429 | 요청이 너무 많아요 |

AI 생성 재시도: 1회차 즉시 → 2회차 2초 후 → 3회차 실패 통보

## 7. 환경 변수

### Next.js
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `AI_SERVER_URL`, `AI_SERVER_API_KEY`
- `NEXT_PUBLIC_TOSS_CLIENT_KEY`, `TOSS_SECRET_KEY`
- `NEXT_PUBLIC_SENTRY_DSN`
- `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_APP_NAME`

### FastAPI
- `API_KEY`, `FAL_KEY`, `FAL_MODEL`
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- `DEFAULT_INSTANT_ID_STRENGTH` (0.7), `DEFAULT_IP_ADAPTER_WEIGHT` (0.2)
- `MAX_CONCURRENT_GENERATIONS` (10), `GENERATION_TIMEOUT_SECONDS` (300)

## 8. 핵심 설계 결정

| 결정 | 선택 | 근거 |
|------|------|------|
| 프론트-AI 분리 | Next.js + FastAPI | AI는 Python 생태계, GPU 독립 스케일링 |
| 상태 확인 방식 | Polling 3초 | MVP 단순성, 1~3분 생성이므로 부담 미미 |
| 이미지 저장소 | Supabase Storage | 단일 플랫폼 통합, 비용 절감 |
| 상태 관리 | Zustand + React Query | 보일러플레이트 최소, 서버/클라이언트 분리 |
| 작업 큐 | asyncio.Queue (MVP) | 동시 요청 적어 충분, v1.0에서 Redis 전환 |
| 원본 사진 | 생성 완료 즉시 삭제 | PIPA 최소 보관 원칙 |
