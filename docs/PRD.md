# XBridge 홍보 페이지 PRD (Product Requirements Document)

> 작성일: 2026-03-10
> 버전: 1.0
> 기반 문서: MARKETING_PLAN.md v2.0
> 목적: 사전 수요 조사용 홍보 페이지의 기술 요구사항 및 구현 명세 정의

---

## 1. 프로젝트 개요

### 1.1 프로젝트명
XBridge 사전 수요 조사 홍보 페이지

### 1.2 목표
- 서비스 정식 출시 전 잠재 고객(K-Food 수출 희망 중소기업)의 사전 신청을 받아 리드를 수집한다.
- UTM 기반 유입 추적 시스템을 통해 마케팅 채널별 성과를 측정한다.
- 수집된 리드 및 행동 데이터를 기반으로 서비스 방향성 및 마케팅 전략을 수립한다.

### 1.3 성공 지표
| 지표 | 목표 |
|------|------|
| 사전 신청 수 | 500개 기업 이상 |
| 사전 신청 전환율 | 페이지 방문 대비 10% 이상 |
| 유효 리드 비율 | 70% 이상 |
| 폼 완료율 | 폼 시작 대비 70% 이상 |
| 평균 체류 시간 | 2분 이상 |

---

## 2. 시스템 아키텍처

### 2.1 기술 스택
| 영역 | 기술 | 비고 |
|------|------|------|
| Framework | Next.js 16 (App Router) | React 19 기반 |
| Language | TypeScript 5.x | strict 모드 |
| Styling | Tailwind CSS 4 | |
| UI Components | Radix UI + shadcn/ui | |
| Animation | Framer Motion | 스크롤 애니메이션, 인터랙션 |
| Icons | Lucide React | |
| Form | React Hook Form + Zod | 유효성 검사 |
| Database | Supabase (PostgreSQL) | 리드 + UTM 데이터 저장 |
| Hosting | Vercel | Next.js 최적화 배포 |
| Analytics | Google Analytics 4 | 퍼널 분석 |
| Email | Resend | 신청 확인 이메일 발송 |

### 2.2 인프라 구성도
```
┌──────────────────────────────────────────────────────────────┐
│                        Client (Browser)                      │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  UTM 파라미터 파싱 → sessionStorage 저장               │  │
│  │  페이지 뷰 / 섹션 도달 / 이벤트 → GA4 전송             │  │
│  │  폼 제출 → API 호출                                    │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────┬───────────────────────────────────────┘
                       │ HTTPS
                       ▼
┌──────────────────────────────────────────────────────────────┐
│                     Vercel (Hosting)                          │
│  ┌─────────────────┐  ┌──────────────────────────────────┐  │
│  │  Next.js SSR /   │  │  API Routes                      │  │
│  │  Static Pages    │  │  ├─ POST /api/leads              │  │
│  │                  │  │  ├─ POST /api/page-views          │  │
│  │                  │  │  └─ GET  /api/leads/count         │  │
│  └─────────────────┘  └──────────────┬───────────────────┘  │
└──────────────────────────────────────┼───────────────────────┘
                                       │
                       ┌───────────────┴───────────────┐
                       ▼                               ▼
          ┌─────────────────────┐         ┌─────────────────┐
          │   Supabase          │         │   Resend         │
          │  ┌───────────────┐  │         │   (Email API)    │
          │  │ leads         │  │         └─────────────────┘
          │  │ page_views    │  │
          │  │ utm_sessions  │  │
          │  │ form_events   │  │
          │  └───────────────┘  │
          └─────────────────────┘
```

---

## 3. 데이터베이스 설계

### 3.1 ERD 개요
```
utm_sessions (1) ──── (N) page_views
utm_sessions (1) ──── (N) form_events
utm_sessions (1) ──── (0..1) leads
```

### 3.2 테이블 정의

#### 3.2.1 `utm_sessions` — UTM 세션 추적
방문자의 유입 경로와 세션 정보를 기록한다.

```sql
CREATE TABLE utm_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- 세션 식별
  session_id TEXT NOT NULL UNIQUE,        -- 클라이언트에서 생성한 세션 ID (UUID v4)
  visitor_id TEXT NOT NULL,               -- 브라우저 fingerprint 기반 방문자 식별자 (localStorage)

  -- UTM 파라미터
  utm_source TEXT,                        -- 유입 소스 (google, naver, facebook 등)
  utm_medium TEXT,                        -- 유입 매체 (cpc, email, social, organic 등)
  utm_campaign TEXT,                      -- 캠페인명
  utm_term TEXT,                          -- 검색 키워드
  utm_content TEXT,                       -- 광고 소재 구분

  -- 유입 정보
  referrer TEXT,                          -- HTTP Referer
  landing_page TEXT NOT NULL,             -- 랜딩 페이지 URL (path)

  -- 디바이스 정보
  user_agent TEXT,
  device_type TEXT,                       -- mobile, tablet, desktop
  browser TEXT,                           -- chrome, safari, firefox 등
  os TEXT,                                -- windows, macos, ios, android 등
  screen_resolution TEXT,                 -- 예: 1920x1080

  -- 세션 정보
  session_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  session_end TIMESTAMPTZ,
  page_view_count INTEGER DEFAULT 0,
  is_converted BOOLEAN DEFAULT FALSE      -- 리드 전환 여부
);

-- 인덱스
CREATE INDEX idx_utm_sessions_visitor ON utm_sessions(visitor_id);
CREATE INDEX idx_utm_sessions_source ON utm_sessions(utm_source);
CREATE INDEX idx_utm_sessions_campaign ON utm_sessions(utm_campaign);
CREATE INDEX idx_utm_sessions_created ON utm_sessions(created_at);
```

#### 3.2.2 `page_views` — 페이지 뷰 및 섹션 도달 추적
사용자가 어떤 섹션까지 스크롤했는지, 어느 요소와 상호작용했는지 기록한다.

```sql
CREATE TABLE page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- 세션 연결
  session_id TEXT NOT NULL REFERENCES utm_sessions(session_id),

  -- 페이지 정보
  page_path TEXT NOT NULL,                -- 페이지 경로

  -- 섹션 도달 추적
  sections_reached TEXT[] DEFAULT '{}',   -- 도달한 섹션 목록 (hero, pain_points, features, benefits, form, faq, final_cta)
  max_scroll_depth INTEGER DEFAULT 0,     -- 최대 스크롤 깊이 (%)

  -- 체류 시간
  time_on_page INTEGER DEFAULT 0,         -- 체류 시간 (초)

  -- 인터랙션
  cta_clicks INTEGER DEFAULT 0,           -- CTA 클릭 수
  faq_opens TEXT[] DEFAULT '{}'           -- 열어본 FAQ 항목
);

-- 인덱스
CREATE INDEX idx_page_views_session ON page_views(session_id);
CREATE INDEX idx_page_views_created ON page_views(created_at);
```

#### 3.2.3 `form_events` — 폼 인터랙션 추적
리드 캡처 폼과의 상호작용을 단계별로 기록한다.

```sql
CREATE TABLE form_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- 세션 연결
  session_id TEXT NOT NULL REFERENCES utm_sessions(session_id),

  -- 이벤트 정보
  event_type TEXT NOT NULL,               -- form_view, form_start, field_focus, field_blur, field_error, form_submit, form_success, form_error
  field_name TEXT,                         -- 이벤트 발생 필드명 (field_focus, field_blur, field_error 시)
  error_message TEXT,                      -- 에러 메시지 (field_error, form_error 시)

  -- 폼 진행 상태
  fields_filled TEXT[] DEFAULT '{}',      -- 입력 완료된 필드 목록
  completion_rate INTEGER DEFAULT 0,       -- 폼 완성도 (%)
  time_spent INTEGER DEFAULT 0            -- 폼에서 보낸 시간 (초)
);

-- 인덱스
CREATE INDEX idx_form_events_session ON form_events(session_id);
CREATE INDEX idx_form_events_type ON form_events(event_type);
CREATE INDEX idx_form_events_created ON form_events(created_at);
```

#### 3.2.4 `leads` — 리드 (사전 신청) 데이터
폼 제출을 통해 수집된 기업 및 담당자 정보를 저장한다.

```sql
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- 세션 연결
  session_id TEXT REFERENCES utm_sessions(session_id),

  -- 기업 정보
  company_name TEXT NOT NULL,
  business_number TEXT,                   -- 사업자등록번호 (000-00-00000)
  industry TEXT NOT NULL,                 -- processed_food, beverage, health_food, traditional_food, other
  annual_revenue TEXT,                    -- under_1b, 1b_to_5b, 5b_to_10b, over_10b

  -- 담당자 정보
  contact_name TEXT NOT NULL,
  position TEXT,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,

  -- 수출 관심 정보
  target_countries TEXT[] NOT NULL,       -- us, jp, cn, sea, eu, other
  export_experience TEXT NOT NULL,        -- yes, no, preparing
  additional_notes TEXT,

  -- 동의 정보
  privacy_consent BOOLEAN NOT NULL DEFAULT FALSE,
  marketing_consent BOOLEAN NOT NULL DEFAULT FALSE,

  -- UTM 정보 (비정규화 — 조회 편의를 위해 세션에서 복사)
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,

  -- 관리 정보
  status TEXT NOT NULL DEFAULT 'new',     -- new, contacted, qualified, converted, rejected
  assigned_to TEXT,                        -- 담당자
  notes TEXT,                             -- 내부 메모
  contacted_at TIMESTAMPTZ,
  qualified_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ
);

-- 인덱스
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_industry ON leads(industry);
CREATE INDEX idx_leads_created ON leads(created_at);
CREATE INDEX idx_leads_session ON leads(session_id);
```

### 3.3 Supabase Row Level Security (RLS)
```sql
-- leads 테이블: API Route(서비스 역할 키)에서만 INSERT, 관리자만 SELECT/UPDATE
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert from API" ON leads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow read for admin" ON leads
  FOR SELECT USING (auth.role() = 'authenticated');

-- utm_sessions, page_views, form_events: API Route에서만 INSERT
ALTER TABLE utm_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert" ON utm_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert" ON page_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert" ON form_events FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow read for admin" ON utm_sessions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read for admin" ON page_views FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read for admin" ON form_events FOR SELECT USING (auth.role() = 'authenticated');
```

---

## 4. UTM 추적 시스템 설계

### 4.1 UTM 파라미터 정의
| 파라미터 | 용도 | 예시 값 |
|----------|------|---------|
| `utm_source` | 유입 소스 | google, naver, facebook, instagram, linkedin, newsletter, partner |
| `utm_medium` | 유입 매체 | cpc, organic, social, email, referral, display, banner |
| `utm_campaign` | 캠페인 이름 | prelaunch_2026q1, kfood_expo, early_bird |
| `utm_term` | 검색 키워드 | 식품수출, K-Food수출플랫폼 |
| `utm_content` | 광고 소재 구분 | hero_banner_a, sidebar_cta, email_header |

### 4.2 추적 URL 예시
```
https://xbridge.co.kr?utm_source=google&utm_medium=cpc&utm_campaign=prelaunch_2026q1&utm_term=식품수출
https://xbridge.co.kr?utm_source=newsletter&utm_medium=email&utm_campaign=early_bird&utm_content=cta_button
https://xbridge.co.kr?utm_source=facebook&utm_medium=social&utm_campaign=prelaunch_2026q1&utm_content=video_ad_01
```

### 4.3 클라이언트 추적 흐름
```
1. 사용자 랜딩
   ├─ URL에서 UTM 파라미터 파싱
   ├─ visitor_id 확인/생성 (localStorage)
   ├─ session_id 생성 (sessionStorage, UUID v4)
   └─ POST /api/page-views (세션 생성 + 첫 페이지뷰)

2. 페이지 인터랙션
   ├─ 섹션 도달 감지 (Intersection Observer)
   ├─ 스크롤 깊이 추적
   ├─ CTA 클릭 추적
   └─ 주기적으로 PATCH /api/page-views (체류시간, 스크롤, 섹션)

3. 폼 인터랙션
   ├─ 폼 영역 진입 → POST /api/form-events (form_view)
   ├─ 첫 필드 포커스 → POST /api/form-events (form_start)
   ├─ 필드 변경 시 → POST /api/form-events (field_blur, 완성도 업데이트)
   └─ 유효성 오류 시 → POST /api/form-events (field_error)

4. 폼 제출
   ├─ POST /api/leads (리드 데이터 + session_id)
   ├─ utm_sessions.is_converted = TRUE 업데이트
   ├─ 확인 이메일 발송 (Resend)
   └─ Thank You 페이지 리다이렉트

5. 세션 종료
   └─ beforeunload 시 PATCH /api/page-views (최종 체류시간)
```

### 4.4 클라이언트 UTM 유틸리티 모듈 명세

```typescript
// lib/utm.ts

interface UTMParams {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
}

interface SessionInfo {
  session_id: string;
  visitor_id: string;
  utm: UTMParams;
  referrer: string;
  landing_page: string;
  device_type: 'mobile' | 'tablet' | 'desktop';
  browser: string;
  os: string;
  screen_resolution: string;
}

/**
 * URL에서 UTM 파라미터를 파싱하여 sessionStorage에 저장.
 * UTM 파라미터가 있는 경우에만 덮어쓰기 (Direct 방문 시 기존 UTM 유지).
 */
function parseAndStoreUTM(): UTMParams;

/**
 * visitor_id를 localStorage에서 가져오거나 신규 생성.
 * 재방문자를 식별하는 용도.
 */
function getOrCreateVisitorId(): string;

/**
 * session_id를 sessionStorage에서 가져오거나 신규 생성.
 * 탭/브라우저 종료 시 자동 소멸.
 */
function getOrCreateSessionId(): string;

/**
 * 디바이스/브라우저 정보를 User-Agent에서 추출.
 */
function getDeviceInfo(): { device_type: string; browser: string; os: string; screen_resolution: string };
```

---

## 5. API 명세

### 5.1 `POST /api/page-views`
세션 생성 및 페이지 뷰 기록.

**Request Body**
```typescript
{
  session_id: string;
  visitor_id: string;
  utm: UTMParams;
  referrer: string;
  landing_page: string;
  device_type: string;
  browser: string;
  os: string;
  screen_resolution: string;
  user_agent: string;
  page_path: string;
}
```

**Response**
```typescript
// 200 OK
{ success: true; session_id: string; }
// 400 Bad Request
{ success: false; error: string; }
```

**로직**
1. `utm_sessions` 테이블에 세션이 없으면 INSERT, 있으면 `page_view_count` 증가
2. `page_views` 테이블에 새 레코드 INSERT
3. Rate limit: 같은 session_id로 초당 1회 제한

### 5.2 `PATCH /api/page-views/:id`
페이지 뷰 데이터 업데이트 (스크롤, 체류시간, 섹션 도달).

**Request Body**
```typescript
{
  sections_reached?: string[];
  max_scroll_depth?: number;
  time_on_page?: number;
  cta_clicks?: number;
  faq_opens?: string[];
}
```

**Response**
```typescript
// 200 OK
{ success: true; }
```

### 5.3 `POST /api/form-events`
폼 인터랙션 이벤트 기록.

**Request Body**
```typescript
{
  session_id: string;
  event_type: 'form_view' | 'form_start' | 'field_focus' | 'field_blur' | 'field_error' | 'form_submit' | 'form_success' | 'form_error';
  field_name?: string;
  error_message?: string;
  fields_filled?: string[];
  completion_rate?: number;
  time_spent?: number;
}
```

**Response**
```typescript
// 200 OK
{ success: true; }
```

### 5.4 `POST /api/leads`
리드 (사전 신청) 데이터 저장 및 확인 이메일 발송.

**Request Body**
```typescript
{
  session_id: string;

  // 기업 정보
  company_name: string;
  business_number?: string;
  industry: 'processed_food' | 'beverage' | 'health_food' | 'traditional_food' | 'other';
  annual_revenue?: 'under_1b' | '1b_to_5b' | '5b_to_10b' | 'over_10b';

  // 담당자 정보
  contact_name: string;
  position?: string;
  email: string;
  phone: string;

  // 수출 관심 정보
  target_countries: string[];  // ['us', 'jp', 'cn', 'sea', 'eu', 'other']
  export_experience: 'yes' | 'no' | 'preparing';
  additional_notes?: string;

  // 동의 정보
  privacy_consent: boolean;
  marketing_consent?: boolean;
}
```

**Validation (Zod)**
```typescript
const leadSchema = z.object({
  session_id: z.string().uuid(),
  company_name: z.string().min(2, "회사명을 입력해주세요"),
  business_number: z.string().regex(/^\d{3}-\d{2}-\d{5}$/).optional(),
  industry: z.enum(['processed_food', 'beverage', 'health_food', 'traditional_food', 'other']),
  annual_revenue: z.enum(['under_1b', '1b_to_5b', '5b_to_10b', 'over_10b']).optional(),
  contact_name: z.string().min(2, "담당자명을 입력해주세요"),
  position: z.string().optional(),
  email: z.string().email("올바른 이메일을 입력해주세요"),
  phone: z.string().regex(/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/, "올바른 연락처를 입력해주세요"),
  target_countries: z.array(z.string()).min(1, "관심 수출국을 선택해주세요"),
  export_experience: z.enum(['yes', 'no', 'preparing']),
  additional_notes: z.string().max(1000).optional(),
  privacy_consent: z.literal(true, { errorMap: () => ({ message: "개인정보 수집에 동의해주세요" }) }),
  marketing_consent: z.boolean().optional().default(false),
});
```

**Response**
```typescript
// 201 Created
{ success: true; lead_id: string; }
// 400 Bad Request
{ success: false; errors: Record<string, string>; }
// 409 Conflict (이메일 중복)
{ success: false; error: "이미 신청된 이메일입니다."; }
```

**로직**
1. Zod 유효성 검사
2. 이메일 중복 체크
3. `utm_sessions`에서 UTM 정보 조회 → `leads`에 비정규화 저장
4. `leads` 테이블에 INSERT
5. `utm_sessions.is_converted = TRUE` 업데이트
6. `form_events`에 `form_success` 이벤트 기록
7. Resend API로 확인 이메일 발송
8. 201 응답 반환

### 5.5 `GET /api/leads/count`
현재 사전 신청 수를 반환 (Hero 섹션의 실시간 카운터용).

**Response**
```typescript
// 200 OK
{ count: number; }
```

**캐싱**: Vercel Edge Cache, 5분 TTL (revalidate: 300)

---

## 6. 페이지 구조 및 라우팅

### 6.1 라우트 맵
| 경로 | 설명 | 타입 |
|------|------|------|
| `/` | 메인 랜딩 페이지 | SSG + Client Hydration |
| `/thank-you` | 신청 완료 페이지 | SSG |
| `/privacy` | 개인정보처리방침 | SSG |
| `/terms` | 이용약관 | SSG |
| `/api/leads` | 리드 API | API Route |
| `/api/leads/count` | 신청 수 카운트 API | API Route (Edge) |
| `/api/page-views` | 페이지 뷰 API | API Route |
| `/api/page-views/:id` | 페이지 뷰 업데이트 API | API Route |
| `/api/form-events` | 폼 이벤트 API | API Route |

### 6.2 파일 구조
```
src/
├── app/
│   ├── layout.tsx                    # 루트 레이아웃 (폰트, GA4 스크립트)
│   ├── page.tsx                      # 메인 랜딩 페이지
│   ├── thank-you/
│   │   └── page.tsx                  # 신청 완료 페이지
│   ├── privacy/
│   │   └── page.tsx                  # 개인정보처리방침
│   ├── terms/
│   │   └── page.tsx                  # 이용약관
│   └── api/
│       ├── leads/
│       │   ├── route.ts              # POST: 리드 저장
│       │   └── count/
│       │       └── route.ts          # GET: 신청 수 조회
│       ├── page-views/
│       │   ├── route.ts              # POST: 페이지 뷰 생성
│       │   └── [id]/
│       │       └── route.ts          # PATCH: 페이지 뷰 업데이트
│       └── form-events/
│           └── route.ts              # POST: 폼 이벤트 기록
├── components/
│   ├── marketing/
│   │   ├── Header.tsx                # 네비게이션 헤더
│   │   ├── HeroSection.tsx           # 히어로 섹션
│   │   ├── PainPointsSection.tsx     # 문제 제기 섹션
│   │   ├── FeaturesSection.tsx       # 서비스 예정 기능
│   │   ├── BenefitsSection.tsx       # 사전 신청 혜택
│   │   ├── LeadCaptureForm.tsx       # 리드 캡처 폼
│   │   ├── FAQSection.tsx            # FAQ 섹션
│   │   ├── CTASection.tsx            # 최종 CTA 섹션
│   │   └── Footer.tsx                # 푸터
│   └── ui/                           # shadcn/ui 컴포넌트
├── hooks/
│   ├── useUTM.ts                     # UTM 파라미터 관리
│   ├── useSessionTracking.ts         # 세션/페이지뷰 추적
│   ├── useSectionObserver.ts         # 섹션 도달 감지
│   └── useFormTracking.ts            # 폼 인터랙션 추적
├── lib/
│   ├── supabase.ts                   # Supabase 클라이언트 (서버용)
│   ├── utm.ts                        # UTM 유틸리티
│   ├── tracking.ts                   # 추적 이벤트 전송 유틸리티
│   ├── validations.ts                # Zod 스키마 정의
│   └── email.ts                      # Resend 이메일 발송
├── types/
│   ├── lead.ts                       # 리드 관련 타입
│   ├── tracking.ts                   # 추적 관련 타입
│   └── utm.ts                        # UTM 관련 타입
└── constants/
    ├── form-options.ts               # 폼 선택지 (업종, 국가 등)
    └── sections.ts                   # 섹션 ID 상수
```

---

## 7. 컴포넌트 명세

### 7.1 페이지 섹션 구성
| 순서 | 컴포넌트 | Section ID | 설명 |
|------|----------|------------|------|
| 1 | `Header` | - | 고정 네비게이션, 스크롤 시 배경 변경 |
| 2 | `HeroSection` | `hero` | 메인 비주얼 + 사전 신청 CTA + 신청 카운터 |
| 3 | `PainPointsSection` | `pain_points` | 4개 Pain Point 카드 |
| 4 | `FeaturesSection` | `features` | 3개 서비스 예정 기능 카드 |
| 5 | `BenefitsSection` | `benefits` | 4개 사전 신청 혜택 카드 |
| 6 | `LeadCaptureForm` | `form` | 리드 캡처 폼 (핵심) |
| 7 | `FAQSection` | `faq` | 아코디언 FAQ |
| 8 | `CTASection` | `final_cta` | 최종 전환 유도 |
| 9 | `Footer` | - | 회사 정보 및 법적 고지 |

### 7.2 LeadCaptureForm 상세

#### 폼 필드 구성
| 필드명 | 타입 | 필수 | 유효성 검사 |
|--------|------|------|-------------|
| company_name | text | ✅ | 2자 이상 |
| business_number | text | - | 000-00-00000 형식 (입력 시 자동 포매팅) |
| industry | select | ✅ | enum 값 |
| annual_revenue | select | - | enum 값 |
| contact_name | text | ✅ | 2자 이상 |
| position | text | - | - |
| email | email | ✅ | 이메일 형식 |
| phone | tel | ✅ | 01X-XXXX-XXXX 형식 (입력 시 자동 포매팅) |
| target_countries | checkbox group | ✅ | 1개 이상 선택 |
| export_experience | radio | ✅ | enum 값 |
| additional_notes | textarea | - | 1000자 이내 |
| privacy_consent | checkbox | ✅ | true |
| marketing_consent | checkbox | - | - |

#### 폼 UX 요구사항
- 실시간 유효성 검사 (필드 blur 시)
- 전화번호, 사업자등록번호 자동 하이픈 포매팅
- 제출 중 로딩 상태 표시 (버튼 비활성화 + 스피너)
- 제출 성공 시 `/thank-you` 페이지로 라우팅
- 제출 실패 시 에러 메시지 표시 (토스트)
- 이메일 중복 시 안내 메시지 표시

---

## 8. 추적 이벤트 정의

### 8.1 GA4 커스텀 이벤트
| 이벤트명 | 트리거 | 파라미터 |
|----------|--------|----------|
| `page_view` | 페이지 로드 | page_path, utm_source, utm_medium, utm_campaign |
| `section_view` | 섹션 뷰포트 진입 (50% 이상 노출) | section_id |
| `cta_click` | CTA 버튼 클릭 | cta_location (header, hero, final_cta) |
| `form_view` | 폼 섹션 뷰포트 진입 | - |
| `form_start` | 폼 첫 필드 포커스 | - |
| `form_field_complete` | 필드 입력 완료 (blur) | field_name |
| `form_field_error` | 필드 유효성 오류 | field_name, error_type |
| `form_submit` | 폼 제출 시도 | completion_rate |
| `form_success` | 폼 제출 성공 | lead_id |
| `form_error` | 폼 제출 실패 | error_type |
| `faq_open` | FAQ 항목 펼침 | question_index |
| `scroll_depth` | 스크롤 25%, 50%, 75%, 100% 도달 | depth_percentage |

### 8.2 Supabase 추적 (서버사이드)
GA4와 별도로 Supabase에 직접 저장하여 자체 대시보드에서 분석 가능하도록 한다. 섹션 4.3의 추적 흐름에 따라 `utm_sessions`, `page_views`, `form_events` 테이블에 기록한다.

---

## 9. 이메일 발송

### 9.1 신청 완료 확인 이메일
| 항목 | 내용 |
|------|------|
| 발송 시점 | 리드 폼 제출 성공 직후 |
| 발신자 | noreply@xbridge.co.kr |
| 제목 | [XBridge] 사전 신청이 완료되었습니다 |
| 내용 | 담당자명, 회사명, 신청 내용 요약, 사전 신청 혜택 안내, 예상 출시 일정 |
| 템플릿 | React Email (Resend 호환) |

---

## 10. 성능 요구사항

| 항목 | 목표 |
|------|------|
| Lighthouse Performance | 90점 이상 |
| LCP (Largest Contentful Paint) | 2.5초 이내 |
| FID (First Input Delay) | 100ms 이내 |
| CLS (Cumulative Layout Shift) | 0.1 이하 |
| 페이지 로드 (초기) | 3초 이내 (3G 기준) |
| API 응답 시간 | 500ms 이내 |
| 추적 API 응답 시간 | 200ms 이내 (비차단) |

### 10.1 최적화 전략
- 이미지: Next.js Image 컴포넌트 (WebP/AVIF 자동 변환, lazy loading)
- 폰트: Pretendard 서브셋, `next/font` 최적화
- 번들: 동적 import로 Below-the-fold 섹션 코드 분할
- 추적 API: `navigator.sendBeacon()` 사용 (비차단)
- 리드 카운트: ISR (revalidate: 300)

---

## 11. 보안 요구사항

| 항목 | 구현 방법 |
|------|----------|
| CSRF 방지 | API Route에 Origin 헤더 검증 |
| Rate Limiting | 리드 API: IP당 분당 5회 제한 |
| 입력 검증 | 서버 사이드 Zod 검증 (클라이언트 검증과 별도) |
| XSS 방지 | React 기본 이스케이핑 + 추가 입력 sanitize |
| 환경 변수 | Supabase 키, Resend 키는 서버 전용 (NEXT_PUBLIC_ 미사용) |
| 개인정보 | 사업자등록번호, 연락처 등 민감정보 Supabase RLS 적용 |
| HTTPS | Vercel 기본 SSL |

---

## 12. 환경 변수

```env
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...     # 서버 전용 (API Route에서만 사용)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...  # 클라이언트용 (RLS 적용)

# Resend
RESEND_API_KEY=re_xxx

# GA4
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# App
NEXT_PUBLIC_BASE_URL=https://xbridge.co.kr
```

---

## 13. 배포 전략

### 13.1 Vercel 설정
| 항목 | 설정 |
|------|------|
| Framework Preset | Next.js |
| Build Command | `next build` |
| Output Directory | `.next` |
| Node.js Version | 20.x |
| Region | ICN1 (서울) |
| Domain | xbridge.co.kr |

### 13.2 환경별 구성
| 환경 | 브랜치 | 도메인 | Supabase |
|------|--------|--------|----------|
| Production | `main` | xbridge.co.kr | Production 프로젝트 |
| Preview | PR 브랜치 | *.vercel.app | Staging 프로젝트 |
| Development | 로컬 | localhost:3000 | Local 또는 Staging |

---

## 14. 개발 마일스톤

| 단계 | 내용 | 산출물 |
|------|------|--------|
| **M1** | 프로젝트 초기 설정 | Next.js 프로젝트, Supabase 스키마, Vercel 연동 |
| **M2** | UI 컴포넌트 개발 | 전체 섹션 컴포넌트 (정적 UI) |
| **M3** | 폼 기능 개발 | 리드 캡처 폼 + API + DB 연동 |
| **M4** | UTM 추적 시스템 | 세션 추적, 페이지 뷰, 폼 이벤트 추적 |
| **M5** | 이메일 자동화 | 신청 확인 이메일 발송 |
| **M6** | QA 및 최적화 | 반응형 테스트, 성능 최적화, 접근성 |
| **M7** | 배포 | Production 배포 + 모니터링 설정 |

---

*본 PRD는 MARKETING_PLAN.md v2.0을 기반으로 작성되었으며, 구현 진행에 따라 업데이트됩니다.*
