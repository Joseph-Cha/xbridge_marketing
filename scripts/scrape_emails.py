#!/usr/bin/env python3
"""
업체 웹사이트에서 이메일 주소를 자동 수집하는 스크립트

사용법:
    cd xbridge_marketing
    pip install -r scripts/requirements.txt
    python scripts/scrape_emails.py
"""

import csv
import os
import re
import sys
import time
import urllib.parse
from pathlib import Path

import requests
from bs4 import BeautifulSoup

# 프로젝트 루트를 기준으로 config 임포트
sys.path.insert(0, os.path.dirname(__file__))
import config

# ============================================================
# 상수
# ============================================================
EMAIL_REGEX = re.compile(
    r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}",
)

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
}

SESSION = requests.Session()
SESSION.headers.update(HEADERS)


# ============================================================
# 1) 업체명 리스트 로드
# ============================================================
def load_company_list(filepath: str) -> list[str]:
    """마크다운 파일에서 업체명 리스트를 읽어옵니다."""
    path = Path(filepath)
    if not path.exists():
        print(f"[ERROR] 파일을 찾을 수 없습니다: {filepath}")
        sys.exit(1)

    companies = []
    for line in path.read_text(encoding="utf-8").splitlines():
        name = line.strip()
        if name:
            companies.append(name)
    return companies


# ============================================================
# 2) 검색 엔진별 웹사이트 URL 찾기
# ============================================================
def search_naver(query: str) -> str | None:
    """네이버 검색 API로 업체 공식 웹사이트를 찾습니다."""
    url = "https://openapi.naver.com/v1/search/webkr.json"
    headers = {
        "X-Naver-Client-Id": config.NAVER_CLIENT_ID,
        "X-Naver-Client-Secret": config.NAVER_CLIENT_SECRET,
    }
    params = {"query": query + " 공식 홈페이지", "display": 5}

    try:
        resp = SESSION.get(url, headers=headers, params=params, timeout=config.REQUEST_TIMEOUT)
        resp.raise_for_status()
        items = resp.json().get("items", [])
        for item in items:
            link = item.get("link", "")
            if _is_company_site(link):
                return link
    except Exception as e:
        print(f"  [WARN] 네이버 검색 실패: {e}")
    return None


def search_google(query: str) -> str | None:
    """Google Custom Search API로 업체 공식 웹사이트를 찾습니다."""
    url = "https://www.googleapis.com/customsearch/v1"
    params = {
        "key": config.GOOGLE_API_KEY,
        "cx": config.GOOGLE_CX,
        "q": query + " 공식 홈페이지",
        "num": 5,
    }

    try:
        resp = SESSION.get(url, params=params, timeout=config.REQUEST_TIMEOUT)
        resp.raise_for_status()
        items = resp.json().get("items", [])
        for item in items:
            link = item.get("link", "")
            if _is_company_site(link):
                return link
    except Exception as e:
        print(f"  [WARN] 구글 검색 실패: {e}")
    return None


def _extract_domain_candidates(company_name: str) -> list[str]:
    """업체명에서 가능한 도메인 후보를 생성합니다."""
    # 법인 형태 표기 제거
    name = company_name.strip()
    remove_patterns = [
        r"\bCO\.?,?\s*LTD\.?",
        r"\bCORP\.?(?:ORATION)?",
        r"\bINC\.?",
        r"\bLTD\.?",
        r"\bCO\.?",
        r"\bGP\b",
        r"\bFarming\s+(?:Association|Corp(?:oration)?)\b",
        r"\bAgricultural\s+(?:Association|Corporation|Company)\b",
        r"\bAGRICULTURAL\b",
        r"\bAssociation\b",
        r"\bNONGEOPHOESABEOPIN\b",
        r"\(.*?\)",  # 괄호 안 내용 제거
    ]
    for pat in remove_patterns:
        name = re.sub(pat, "", name, flags=re.IGNORECASE)

    # 특수문자 제거, 공백 정리
    name = re.sub(r"[.,;:'\"\-&!@#$%^*+=]", " ", name)
    name = re.sub(r"\s+", " ", name).strip()

    words = name.lower().split()
    if not words:
        return []

    # 도메인 후보 생성
    candidates = []
    joined = "".join(words)           # 예: sempiofoods
    hyphenated = "-".join(words)      # 예: sempio-foods
    first_word = words[0]             # 예: sempio

    # "food" 관련 단어를 포함하는 축약형
    food_words = {"food", "foods", "seafood", "seafoods"}
    non_food_words = [w for w in words if w not in food_words]
    without_food = "".join(non_food_words) if non_food_words else joined
    with_food = without_food + "food" if without_food != joined else joined

    # 도메인 패턴 후보
    name_variants = list(dict.fromkeys([
        joined, with_food, without_food, first_word, hyphenated,
    ]))

    tlds = [".co.kr", ".com", ".kr", ".net"]

    for variant in name_variants:
        if not variant or len(variant) < 3:
            continue
        for tld in tlds:
            candidates.append(f"http://www.{variant}{tld}")
            candidates.append(f"https://www.{variant}{tld}")
            candidates.append(f"http://{variant}{tld}")
            candidates.append(f"https://{variant}{tld}")

    return candidates


def search_domain_guess(company_name: str) -> str | None:
    """업체명에서 도메인을 추정하고 직접 접속하여 웹사이트를 찾습니다."""
    candidates = _extract_domain_candidates(company_name)
    seen_domains = set()

    for url in candidates:
        parsed = urllib.parse.urlparse(url)
        domain_key = parsed.netloc
        if domain_key in seen_domains:
            continue
        seen_domains.add(domain_key)

        try:
            resp = SESSION.head(url, timeout=5, allow_redirects=True)
            if resp.status_code < 400:
                final_url = resp.url
                # 파킹 페이지나 판매 페이지가 아닌지 확인
                if _is_company_site(final_url):
                    # 실제 콘텐츠가 있는지 간단 확인
                    resp2 = SESSION.get(final_url, timeout=5, allow_redirects=True)
                    if resp2.status_code < 400 and len(resp2.text) > 500:
                        return final_url
        except Exception:
            continue

    return None


def _is_company_site(url: str) -> bool:
    """SNS/포털/마켓플레이스가 아닌 업체 자체 사이트인지 판별합니다."""
    exclude_domains = [
        "facebook.com", "instagram.com", "twitter.com", "youtube.com",
        "blog.naver.com", "cafe.naver.com", "map.naver.com",
        "shopping.naver.com", "search.naver.com",
        "coupang.com", "gmarket.co.kr", "11st.co.kr", "auction.co.kr",
        "wikipedia.org", "linkedin.com", "tiktok.com",
        "google.com", "naver.com",
        # B2B/디렉토리/마켓플레이스
        "buykorea.org", "tradekorea.com", "ec21.com", "alibaba.com",
        "dnb.com", "kompass.com", "yellowpages",
        "opencorporates.com", "bloomberg.com", "crunchbase.com",
        "yelp.com", "trustpilot.com",
        # 정부/공공
        "ftc.go.kr", "data.go.kr", "dart.fss.or.kr",
        # 기타 포털/블로그
        "tistory.com", "daum.net", "kakao.com",
        "medium.com", "reddit.com", "quora.com",
        "smartstore.naver.com", "brand.naver.com",
    ]
    url_lower = url.lower()
    return all(domain not in url_lower for domain in exclude_domains)


def find_website(company_name: str) -> str | None:
    """설정된 검색 엔진을 사용하여 업체 웹사이트를 찾습니다."""
    engine = config.SEARCH_ENGINE.lower()
    if engine == "naver":
        return search_naver(company_name)
    elif engine == "google":
        return search_google(company_name)
    elif engine == "duckduckgo":
        return search_domain_guess(company_name)
    else:
        print(f"  [ERROR] 지원하지 않는 검색 엔진: {engine}")
        return None


# ============================================================
# 3) 웹사이트에서 이메일 추출
# ============================================================
def fetch_page(url: str) -> str | None:
    """URL의 HTML 콘텐츠를 가져옵니다."""
    try:
        resp = SESSION.get(url, timeout=config.REQUEST_TIMEOUT, allow_redirects=True)
        resp.raise_for_status()
        resp.encoding = resp.apparent_encoding or "utf-8"
        return resp.text
    except Exception:
        return None


def extract_emails_from_html(html: str) -> set[str]:
    """HTML에서 이메일 주소를 추출합니다."""
    emails = set()
    # HTML 엔티티 디코딩
    soup = BeautifulSoup(html, "html.parser")
    text = soup.get_text(separator=" ")

    # mailto: 링크에서도 추출
    for a_tag in soup.find_all("a", href=True):
        href = a_tag["href"]
        if href.startswith("mailto:"):
            email = href.replace("mailto:", "").split("?")[0].strip()
            if EMAIL_REGEX.match(email):
                emails.add(email.lower())

    # 텍스트에서 정규식으로 추출
    for match in EMAIL_REGEX.findall(text):
        emails.add(match.lower())

    # 또한 원본 HTML에서도 추출 (JavaScript 변수 등에 포함된 이메일)
    for match in EMAIL_REGEX.findall(html):
        emails.add(match.lower())

    # 제외 도메인 필터링
    filtered = set()
    for email in emails:
        domain = email.split("@")[1]
        # 제외 도메인 부분 일치 확인
        excluded = any(
            excl in domain for excl in config.EXCLUDED_EMAIL_DOMAINS
        )
        if not excluded:
            # 이미지 파일 확장자 제외 (예: image@2x.png 같은 오탐)
            if not re.search(r"\.(png|jpg|jpeg|gif|svg|webp|css|js)$", email, re.I):
                filtered.add(email)

    return filtered


def find_contact_subpages(base_url: str, html: str) -> list[str]:
    """메인 페이지에서 회사소개/연락처 관련 하위 페이지 링크를 찾습니다."""
    soup = BeautifulSoup(html, "html.parser")
    parsed_base = urllib.parse.urlparse(base_url)
    base_domain = parsed_base.netloc

    subpages = []
    for a_tag in soup.find_all("a", href=True):
        href = a_tag["href"].strip()
        text = a_tag.get_text(strip=True).lower()

        # 키워드 매칭 (링크 텍스트 또는 URL 경로)
        href_lower = href.lower()
        is_contact = any(
            kw in text or kw in href_lower
            for kw in config.CONTACT_PAGE_KEYWORDS
        )
        if not is_contact:
            continue

        # 상대 경로를 절대 경로로 변환
        full_url = urllib.parse.urljoin(base_url, href)
        parsed = urllib.parse.urlparse(full_url)

        # 같은 도메인인지 확인
        if parsed.netloc == base_domain and full_url != base_url:
            if full_url not in subpages:
                subpages.append(full_url)

        if len(subpages) >= config.MAX_SUBPAGES:
            break

    return subpages


def scrape_emails_from_site(url: str) -> set[str]:
    """웹사이트 메인 페이지 + 하위 페이지에서 이메일을 수집합니다."""
    all_emails = set()

    # 메인 페이지 크롤링
    html = fetch_page(url)
    if not html:
        return all_emails

    all_emails.update(extract_emails_from_html(html))

    # 하위 페이지 크롤링
    subpages = find_contact_subpages(url, html)
    for sub_url in subpages:
        time.sleep(1)
        sub_html = fetch_page(sub_url)
        if sub_html:
            all_emails.update(extract_emails_from_html(sub_html))

    return all_emails


# ============================================================
# 4) 메인 실행
# ============================================================
def main():
    project_root = Path(__file__).resolve().parent.parent
    os.chdir(project_root)

    # 출력 디렉토리 생성
    output_dir = Path(config.OUTPUT_FILE).parent
    output_dir.mkdir(parents=True, exist_ok=True)

    # API 키 검증
    if config.SEARCH_ENGINE == "naver" and not config.NAVER_CLIENT_ID:
        print("[ERROR] config.py에 네이버 API 키를 설정해주세요.")
        print("        발급 방법: docs/검색API_가이드.md 참고")
        sys.exit(1)

    if config.SEARCH_ENGINE == "google" and not config.GOOGLE_API_KEY:
        print("[ERROR] config.py에 Google API 키를 설정해주세요.")
        sys.exit(1)

    # 업체 리스트 로드
    companies = load_company_list(config.INPUT_FILE)
    total = len(companies)
    print(f"[INFO] 총 {total}개 업체 처리 시작")
    print(f"[INFO] 검색 엔진: {config.SEARCH_ENGINE}")
    print(f"[INFO] 요청 간격: {config.REQUEST_DELAY}초")
    print("=" * 60)

    # 이미 처리된 결과가 있으면 이어서 진행 (중단 후 재개 지원)
    processed = {}
    csv_path = Path(config.OUTPUT_FILE)
    if csv_path.exists():
        with open(csv_path, "r", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            for row in reader:
                processed[row["업체명"]] = row
        print(f"[INFO] 기존 결과 {len(processed)}건 로드 (이어서 진행)")

    # CSV 파일 열기
    fieldnames = ["업체명", "웹사이트", "이메일", "상태"]
    write_header = not csv_path.exists() or len(processed) == 0

    with open(csv_path, "a" if not write_header else "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        if write_header:
            writer.writeheader()

        for idx, company in enumerate(companies, 1):
            # 이미 처리된 업체 건너뛰기
            if company in processed:
                continue

            print(f"\n[{idx}/{total}] {company}")

            # 웹사이트 검색
            website = find_website(company)
            if not website:
                print("  → 웹사이트를 찾지 못했습니다")
                row = {
                    "업체명": company,
                    "웹사이트": "",
                    "이메일": "",
                    "상태": "웹사이트 미발견",
                }
                writer.writerow(row)
                f.flush()
                time.sleep(config.REQUEST_DELAY)
                continue

            print(f"  → 웹사이트: {website}")

            # 이메일 추출
            emails = scrape_emails_from_site(website)
            if emails:
                email_str = "; ".join(sorted(emails))
                print(f"  → 이메일 발견: {email_str}")
                status = "성공"
            else:
                email_str = ""
                print("  → 이메일을 찾지 못했습니다")
                status = "이메일 미발견"

            row = {
                "업체명": company,
                "웹사이트": website,
                "이메일": email_str,
                "상태": status,
            }
            writer.writerow(row)
            f.flush()

            time.sleep(config.REQUEST_DELAY)

    # 엑셀 파일로도 저장
    try:
        import openpyxl

        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "업체 이메일"
        ws.append(fieldnames)

        with open(csv_path, "r", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            for row in reader:
                ws.append([row[col] for col in fieldnames])

        # 컬럼 너비 자동 조정
        for col in ws.columns:
            max_len = max(len(str(cell.value or "")) for cell in col)
            ws.column_dimensions[col[0].column_letter].width = min(max_len + 2, 50)

        wb.save(config.OUTPUT_EXCEL)
        print(f"\n[INFO] 엑셀 파일 저장: {config.OUTPUT_EXCEL}")
    except ImportError:
        print("\n[WARN] openpyxl이 설치되지 않아 엑셀 파일은 생성하지 않았습니다")

    # 결과 요약
    print("\n" + "=" * 60)
    print("[완료] 결과 요약")

    success = email_not_found = site_not_found = 0
    with open(csv_path, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row["상태"] == "성공":
                success += 1
            elif row["상태"] == "이메일 미발견":
                email_not_found += 1
            else:
                site_not_found += 1

    print(f"  이메일 확보: {success}건")
    print(f"  이메일 미발견: {email_not_found}건")
    print(f"  웹사이트 미발견: {site_not_found}건")
    print(f"  CSV 저장: {config.OUTPUT_FILE}")


if __name__ == "__main__":
    main()
