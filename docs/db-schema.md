# FaceMoji - DB 스키마 설계서

> 작성일: 2026-03-06
> 버전: 1.0
> DB: Supabase (PostgreSQL 15+)

---

## 1. ERD 관계도

```
auth.users (Supabase Auth)
    |
    | 1:1 (trigger)
    v
profiles (사용자 프로필 확장)
    |
    ├──→ generations (1:N)
    │         |
    │         └──→ stickers (1:N, 24개/세트)
    │
    ├──→ payments (1:N)
    │
    ├──→ consent_logs (1:N, PIPA 5년 보관)
    │
    └──→ subscriptions (1:N, v1.0)
```

### 설계 원칙
- **profiles 분리**: auth.users는 직접 확장 제한 → profiles 별도 테이블 + trigger 자동 생성
- **VARCHAR CHECK > ENUM**: 스타일/표정 추가 시 ALTER TYPE 마이그레이션 비용 회피
- **INTEGER 금액**: KRW는 소수점 없음, 정수 연산이 단순
- **Hard Delete**: 7일 만료 물리 삭제 (PIPA 준수, Storage도 함께 삭제)
- **consent_logs 분리**: 5년 의무 보관, 감사 추적, INSERT ONLY

---

## 2. 테이블 스키마

### 2.1 profiles

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name VARCHAR(50),
  avatar_url TEXT,
  subscription_type VARCHAR(10) NOT NULL DEFAULT 'free'
    CHECK (subscription_type IN ('free', 'basic', 'pro')),
  subscription_expires_at TIMESTAMPTZ,
  generation_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 2.2 generations

```sql
CREATE TABLE generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  style VARCHAR(20) NOT NULL
    CHECK (style IN ('cartoon', 'flat', 'anime', 'watercolor', '3d', 'manga')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'expired')),
  sticker_count SMALLINT NOT NULL DEFAULT 24,
  face_similarity_score NUMERIC(3,2)
    CHECK (face_similarity_score >= 0 AND face_similarity_score <= 1),
  source_image_path TEXT,
  cost_usd NUMERIC(6,4),
  retry_count SMALLINT NOT NULL DEFAULT 0,
  error_message TEXT,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days')
);
```

### 2.3 stickers

```sql
CREATE TABLE stickers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  generation_id UUID NOT NULL REFERENCES generations(id) ON DELETE CASCADE,
  sort_order SMALLINT NOT NULL CHECK (sort_order >= 1 AND sort_order <= 24),
  expression VARCHAR(20) NOT NULL,
  image_path TEXT NOT NULL,
  ogq_image_path TEXT,
  thumbnail_path TEXT,
  has_text BOOLEAN NOT NULL DEFAULT false,
  text_content VARCHAR(20),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (generation_id, sort_order)
);
```

### 2.4 payments

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  generation_id UUID REFERENCES generations(id) ON DELETE SET NULL,
  payment_type VARCHAR(20) NOT NULL DEFAULT 'generation'
    CHECK (payment_type IN ('generation', 'marketplace', 'subscription')),
  amount INTEGER NOT NULL CHECK (amount > 0),
  payment_method VARCHAR(20),
  toss_payment_key VARCHAR(200) UNIQUE,
  toss_order_id VARCHAR(100) NOT NULL UNIQUE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded')),
  receipt_url TEXT,
  refund_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);
```

### 2.5 consent_logs (PIPA 5년 보관)

```sql
CREATE TABLE consent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  consent_type VARCHAR(30) NOT NULL
    CHECK (consent_type IN ('privacy_collection', 'face_processing', 'overseas_transfer', 'marketing')),
  consent_version VARCHAR(10) NOT NULL,
  is_agreed BOOLEAN NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '5 years')
);
```

### 2.6 subscriptions (v1.0)

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  plan VARCHAR(10) NOT NULL CHECK (plan IN ('basic', 'pro')),
  amount INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'cancelled', 'expired', 'past_due')),
  generation_limit INTEGER,
  generation_used INTEGER NOT NULL DEFAULT 0,
  starts_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  cancelled_at TIMESTAMPTZ,
  toss_billing_key VARCHAR(200),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 3. 인덱스 전략

```sql
-- profiles: PK만으로 충분 (auth.uid() 기반 단건 조회)

-- generations: 마이페이지 이력 조회
CREATE INDEX idx_generations_user_created
  ON generations (user_id, created_at DESC);

-- generations: 7일 만료 삭제 cron (partial index)
CREATE INDEX idx_generations_expires_unpaid
  ON generations (expires_at)
  WHERE is_paid = false AND status != 'expired';

-- generations: 처리 중 작업 모니터링 (partial index)
CREATE INDEX idx_generations_status
  ON generations (status)
  WHERE status IN ('pending', 'processing');

-- stickers: 세트별 순서 조회
CREATE INDEX idx_stickers_generation_order
  ON stickers (generation_id, sort_order);

-- payments: 사용자별 결제 이력
CREATE INDEX idx_payments_user_created
  ON payments (user_id, created_at DESC);

-- consent_logs: 사용자별 동의 기록
CREATE INDEX idx_consent_user_type
  ON consent_logs (user_id, consent_type);
```

---

## 4. RLS 정책

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE stickers ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_logs ENABLE ROW LEVEL SECURITY;

-- profiles: 본인만 조회/수정
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- generations: 본인만 조회/생성/수정
CREATE POLICY "generations_select_own" ON generations
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "generations_insert_own" ON generations
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "generations_update_own" ON generations
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- stickers: 본인 세트만 조회
CREATE POLICY "stickers_select_own" ON stickers
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM generations WHERE generations.id = stickers.generation_id AND generations.user_id = auth.uid())
  );

-- payments: 본인만 조회 (INSERT/UPDATE는 service_role)
CREATE POLICY "payments_select_own" ON payments
  FOR SELECT USING (auth.uid() = user_id);

-- consent_logs: 본인만 INSERT/조회 (UPDATE/DELETE 불가)
CREATE POLICY "consent_select_own" ON consent_logs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "consent_insert_own" ON consent_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

서비스 역할(service_role)로만 수행하는 작업:
- profiles INSERT (Auth trigger)
- stickers INSERT (AI 파이프라인 결과)
- payments INSERT/UPDATE (결제 콜백)
- generations 상태 업데이트 (AI 서버)
- 만료 데이터 삭제 (cron)

---

## 5. 트리거 & 함수

```sql
-- updated_at 자동 갱신
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auth 회원가입 -> profiles 자동 생성
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 결제 완료 -> generation 자동 업데이트
CREATE OR REPLACE FUNCTION handle_payment_completed()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND NEW.payment_type = 'generation' AND NEW.generation_id IS NOT NULL THEN
    UPDATE generations SET is_paid = true, expires_at = '9999-12-31T23:59:59Z'::timestamptz WHERE id = NEW.generation_id;
    UPDATE profiles SET generation_count = generation_count + 1 WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_payment_completed
  AFTER UPDATE OF status ON payments
  FOR EACH ROW WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
  EXECUTE FUNCTION handle_payment_completed();

-- 만료 generation 삭제 함수 (cron에서 호출)
CREATE OR REPLACE FUNCTION cleanup_expired_generations()
RETURNS INTEGER AS $$
DECLARE deleted_count INTEGER;
BEGIN
  WITH deleted AS (
    DELETE FROM generations WHERE expires_at < now() AND is_paid = false AND status != 'processing' RETURNING id
  ) SELECT count(*) INTO deleted_count FROM deleted;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 6. Supabase Storage 버킷

| 버킷 | 접근 | 용도 | 보관 | 경로 규칙 |
|------|------|------|------|---------|
| uploads | Private | 원본 셀카 | 생성 완료 즉시 삭제 | `{user_id}/{gen_id}/original.{ext}` |
| stickers | Private | 생성 이모티콘 원본 | 결제: 영구 / 미결제: 7일 | `{user_id}/{gen_id}/01_smile.png` |
| thumbnails | Public | 워터마크 미리보기 | generation과 동일 | `{user_id}/{gen_id}/01_smile_thumb.png` |
| ogq-packages | Private | OGQ 규격 ZIP | 결제 건만 | `{user_id}/{gen_id}/package.zip` |

### 용량 추정 (월 1,000세트)
- 원본 스티커: ~4.8GB, 썸네일: ~0.7GB, OGQ: ~6.0GB → **세트당 ~11.5MB**
- Supabase Pro 100GB 기본 → ~8,700세트 (미결제 7일 삭제로 실 사용량 감소)

---

## 7. 자동 정리 운영

```
스케줄: 매일 03:00 KST (pg_cron 또는 Edge Function)
1. cleanup_expired_generations() 호출 → DB 레코드 삭제 (stickers CASCADE)
2. 해당 generation의 Storage 파일 삭제 (stickers, thumbnails 버킷)
제외: status = 'processing' (진행 중 작업 보호)
```

### PIPA 원본 삭제 플로우
1. 업로드 → `uploads/{user_id}/{gen_id}/original.png` 저장
2. AI 생성 완료 → status = 'completed'
3. 콜백에서 즉시 삭제 → Storage 파일 삭제 + `source_image_path = NULL`
