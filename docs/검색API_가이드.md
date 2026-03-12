# 검색 API 설정 가이드

이메일 수집 스크립트(`scripts/scrape_emails.py`)에서 사용할 수 있는 검색 방식 3가지입니다.

---

## 방식 1: DuckDuckGo (기본값, API 키 불필요)

**장점:** API 키 없이 바로 사용 가능
**단점:** 한국어 검색 품질이 네이버보다 낮음, 대량 요청 시 일시 차단 가능

별도 설정 없이 바로 실행 가능합니다:

```bash
cd xbridge_marketing
pip install -r scripts/requirements.txt
python scripts/scrape_emails.py
```

---

## 방식 2: 네이버 검색 API (추천)

한국 업체 검색에 가장 적합합니다. 하루 25,000건 무료.

### API 키 발급 절차

1. [네이버 개발자센터](https://developers.naver.com) 접속
2. 네이버 계정으로 로그인
3. 상단 메뉴에서 **Application** → **애플리케이션 등록** 클릭
4. 애플리케이션 정보 입력:
   - **애플리케이션 이름**: `이메일수집` (자유롭게 입력)
   - **사용 API**: `검색` 선택
   - **비로그인 오픈 API 서비스 환경**: `WEB 설정` 선택 → URL에 `http://localhost` 입력
5. **등록하기** 클릭
6. 등록 완료 후 **Client ID**와 **Client Secret** 확인

### 스크립트에 적용

`scripts/config.py`를 열고 다음을 수정합니다:

```python
SEARCH_ENGINE = "naver"
NAVER_CLIENT_ID = "발급받은_Client_ID"
NAVER_CLIENT_SECRET = "발급받은_Client_Secret"
```

---

## 방식 3: Google Custom Search API

영문 업체명 검색에 유리합니다. 하루 100건 무료 (유료 시 1,000건당 $5).

### API 키 발급 절차

1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 프로젝트 생성 또는 선택
3. **API 및 서비스** → **라이브러리** → `Custom Search API` 검색 후 사용 설정
4. **사용자 인증 정보** → **API 키 만들기** → API 키 복사
5. [Programmable Search Engine](https://programmablesearchengine.google.com) 접속
6. **검색엔진 추가** → 전체 웹 검색으로 설정
7. 생성된 검색 엔진의 **cx** (검색엔진 ID) 복사

### 스크립트에 적용

```python
SEARCH_ENGINE = "google"
GOOGLE_API_KEY = "발급받은_API_KEY"
GOOGLE_CX = "발급받은_CX_ID"
```

> 일 100건 무료 제한이 있으므로 527개 업체를 처리하려면 6일 소요되거나 유료 전환이 필요합니다.

---

## 실행 방법

```bash
# 1. 프로젝트 루트로 이동
cd xbridge_marketing

# 2. 패키지 설치
pip install -r scripts/requirements.txt

# 3. config.py에서 검색 엔진 및 API 키 설정

# 4. 스크립트 실행
python scripts/scrape_emails.py
```

## 결과 파일

- `scripts/output/업체_이메일_결과.csv` - CSV 형식
- `scripts/output/업체_이메일_결과.xlsx` - 엑셀 형식

| 컬럼 | 설명 |
|------|------|
| 업체명 | 원본 리스트의 업체명 |
| 웹사이트 | 검색으로 찾은 공식 웹사이트 URL |
| 이메일 | 추출된 이메일 (복수일 경우 `;`로 구분) |
| 상태 | `성공` / `이메일 미발견` / `웹사이트 미발견` |

## 참고사항

- 스크립트를 중단 후 다시 실행하면 이미 처리된 업체는 건너뛰고 이어서 진행됩니다.
- `config.py`의 `REQUEST_DELAY` 값을 조정하여 요청 속도를 제어할 수 있습니다.
- 일부 웹사이트는 JavaScript로 렌더링되어 이메일이 추출되지 않을 수 있습니다.
