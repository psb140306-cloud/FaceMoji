# FaceMoji - AI 이모티콘 생성 서비스

## 프로젝트 개요
셀카 1장으로 24개 이모티콘 세트를 자동 생성하는 웹 서비스.
네이버 OGQ 마켓 규격(740x640px)으로 자동 변환하여 즉시 판매 가능.

- Go/No-Go: Conditional Go (3.75/5.0) → Go 확정
- 규모: 풀 버전 (PoC → MVP → v1.0 → v1.5 → v2.0)

## 기술 스택
- **프론트엔드**: Next.js 15 + React 19 + TypeScript + Tailwind CSS + shadcn/ui
- **AI 백엔드**: FastAPI (Python)
- **AI 모델 (MVP)**: fal.ai Face-to-Sticker API (~$0.02-0.04/이미지)
- **AI 모델 (정식)**: SDXL + IP-Adapter-FaceID + ControlNet (RunPod Serverless L40S)
- **DB/Auth/Storage**: Supabase (PostgreSQL)
- **결제**: Toss Payments
- **배포**: Vercel (웹) + RunPod (AI)
- **모니터링**: Sentry + Vercel Analytics

## 프로젝트 구조
```
09.FaceMoji/
├── CLAUDE.md            # 이 파일
├── docs/                # 기획 문서
│   ├── planning.md      # 기획서
│   ├── prd.md           # PRD
│   ├── tasks.md         # 작업계획서
│   ├── research.md      # 자료조사
│   ├── brainstorm.md    # 브레인스토밍
│   └── analysis.md      # Go/No-Go 분석
├── src/                 # 소스 코드
├── logs/                # 작업일지
└── .claude/             # Claude 설정
```

## 핵심 기능 (MVP)
1. **사진 → 이모티콘 생성**: 셀카 업로드 → 24개 표정 세트 자동 생성
2. **스타일 선택**: 카툰, 플랫, 애니메, 수채화
3. **OGQ 규격 자동 변환**: 740x640px PNG + 메인/탭 이미지
4. **건당 결제**: Toss Payments, 크레딧 시스템
5. **OGQ 제출 가이드**: 체크리스트 + ZIP 패키징

## OGQ 스티커 규격
- 스티커: 24개, 740x640px, 투명 배경 PNG
- 메인: 240x240px, 탭: 96x74px
- 72dpi 이상, RGB, 각 1MB 이하
- API 없음 → 수동 업로드 (규격 자동 변환 + 가이드 제공)

## 개발 규칙
- 작업 전 `docs/tasks.md`에서 다음 태스크 확인
- 작업 완료 시 태스크 체크 표시
- `/work-log`로 작업일지 생성
- `/sync-notion`으로 진행상황 동기화
- PIPA 준수: 얼굴 사진 = 민감정보, 명시적 동의 + 즉시 삭제 필수

## 마일스톤
| # | 마일스톤 | 기간 | 핵심 |
|---|---------|------|------|
| M0 | PoC | 2주 | fal.ai 검증, 유사도 4/5+ 달성 |
| M1 | MVP 기반 | 2주 | Next.js + Supabase + FastAPI 셋업 |
| M2 | 핵심 기능 | 2주 | AI 파이프라인 + OGQ 변환 |
| M3 | 결제+출시 | 1주 | Toss Payments + 배포 |
| M4 | 편집+마켓 | 3주 | 텍스트 편집 + 마켓플레이스 |
| M5 | 구독+고도화 | 3주 | 구독제 + 스타일 확장 |
| M6 | 확장 | 5주 | RunPod 자체 호스팅 + 애니메이션 |
| M7 | B2B+모바일 | 6주 | B2B + 모바일 앱 |

## 관련 문서
- 기획서: docs/planning.md
- PRD: docs/prd.md
- 작업계획서: docs/tasks.md
- 자료조사: docs/research.md
- 분석: docs/analysis.md

## 노션
- Resource DB page_id: 319ce4d6-b442-813f-8a0e-e48f2df750c4
