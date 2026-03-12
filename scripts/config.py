"""
이메일 수집 스크립트 설정 파일

검색 방식을 선택하고 API 키를 설정합니다.
"""

# ============================================================
# 검색 방식 선택
# ============================================================
# "naver"   : 네이버 검색 API (추천, 안정적)
# "google"  : Google Custom Search API (일 100건 무료)
# "duckduckgo" : DuckDuckGo (API 키 불필요, 무료, 제한 있음)
# ============================================================
SEARCH_ENGINE = "duckduckgo"

# ============================================================
# 네이버 검색 API 설정
# 발급 방법은 docs/검색API_가이드.md 참고
# ============================================================
NAVER_CLIENT_ID = ""
NAVER_CLIENT_SECRET = ""

# ============================================================
# Google Custom Search API 설정 (선택)
# ============================================================
GOOGLE_API_KEY = ""
GOOGLE_CX = ""

# ============================================================
# 크롤링 설정
# ============================================================
REQUEST_DELAY = 1          # 요청 간 대기 시간(초) - 도메인 추정 방식은 빠르게 가능
REQUEST_TIMEOUT = 10       # HTTP 요청 타임아웃(초)
MAX_RETRIES = 2            # 실패 시 재시도 횟수
MAX_SUBPAGES = 3           # 이메일 탐색할 하위 페이지 수

# 이메일 탐색 대상 하위 페이지 키워드
CONTACT_PAGE_KEYWORDS = [
    "about", "contact", "company", "intro",
    "회사소개", "연락처", "문의", "오시는길",
    "greeting", "info", "support",
]

# 제외할 이메일 도메인 (일반적인/의미없는 이메일)
EXCLUDED_EMAIL_DOMAINS = [
    "example.com",
    "test.com",
    "email.com",
    "your-email.com",
    "youremail.com",
    "domain.com",
    "sentry.io",
    "wixpress.com",
    "sentry.wixpress.com",
    "sentry-next.wixpress.com",
    "w3.org",
    "schema.org",
    "ogp.me",
    "purl.org",
    "googleapis.com",
    "googleusercontent.com",
    "gstatic.com",
]

# 입출력 파일 경로
INPUT_FILE = "docs/업체명 리스트.md"
OUTPUT_FILE = "scripts/output/업체_이메일_결과.csv"
OUTPUT_EXCEL = "scripts/output/업체_이메일_결과.xlsx"
