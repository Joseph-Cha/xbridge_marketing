#!/usr/bin/env python3
"""
XBridge 마케팅 이메일 발송 스크립트 (Resend API)

사용법:
    # 테스트 발송 (실제 발송 없이 대상 확인)
    python scripts/send_emails.py --dry-run

    # 특정 이메일로 테스트 발송
    python scripts/send_emails.py --test-to your@email.com

    # 실제 발송 (기본 CSV 사용)
    python scripts/send_emails.py

    # 별도 CSV 파일로 발송
    python scripts/send_emails.py --csv scripts/output/신규_업체_목록.csv

    # 최대 10건만 발송
    python scripts/send_emails.py --limit 10

    # 미발송 건만 재발송
    python scripts/send_emails.py --retry-failed
"""

import argparse
import csv
import os
import sys
import time
from datetime import datetime
from pathlib import Path

import resend

# 프로젝트 루트 기준으로 import 경로 설정
PROJECT_ROOT = Path(__file__).resolve().parent.parent
os.chdir(PROJECT_ROOT)
sys.path.insert(0, str(PROJECT_ROOT / "scripts"))

from email_config import (
    BATCH_SIZE,
    EMAIL_SUBJECT,
    LANDING_PAGE_URL,
    RECIPIENTS_CSV,
    RESEND_API_KEY,
    RETRY_COUNT,
    RETRY_DELAY,
    SEND_DELAY,
    SEND_LOG_CSV,
    SENDER_EMAIL,
    SENDER_NAME,
)
from email_template import build_email_html, build_email_text


# ─── CSV 파싱 ───────────────────────────────────────────────

def load_recipients(csv_path: str) -> list[dict]:
    """CSV에서 '성공' 상태인 업체의 이메일 목록을 로드합니다.

    각 이메일 셀에 세미콜론(;)으로 구분된 복수 주소가 있을 수 있으며,
    모든 주소를 개별 수신자로 등록합니다.
    """
    recipients = []
    seen_emails = set()

    with open(csv_path, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row.get("상태") != "성공":
                continue

            raw_emails = row.get("이메일", "").strip()
            if not raw_emails:
                continue

            company = row.get("업체명", "").strip()
            website = row.get("웹사이트", "").strip()

            for email in raw_emails.split(";"):
                email = email.strip()
                if not email or email in seen_emails:
                    continue

                if not _is_valid_email(email):
                    continue

                seen_emails.add(email)
                recipients.append({
                    "company": company,
                    "email": email,
                    "website": website,
                })

    return recipients


def _is_valid_email(email: str) -> bool:
    """기본적인 이메일 형식 검증."""
    if "@" not in email or "." not in email.split("@")[-1]:
        return False
    # 명백히 가짜/테스트 이메일 제외
    fake_emails = {
        "admin@admin.com", "111@111.com", "info@freehtml5.co",
        "hello@company.com", "support@domainagents.com",
        "hello@domainagents.com", "service@atom.com",
        "info@mysite.com", "support@mail.com", "support@gmail.com",
        "email@gmail.com", "9296763280sfdafsd@gmail.com",
        "firstname@chung.net", "eventos@chungo.com.ar",
        "rrhh@chungo.com.ar", "ventas@chungo.com.ar",
    }
    fake_domains = {
        "example.com", "test.com", "sentry.io",
        "sentry.wixpress.com", "sentry-next.wixpress.com",
        "w3.org", "schema.org", "ogp.me", "purl.org",
    }
    lower = email.lower()
    domain = lower.split("@")[-1]
    return lower not in fake_emails and domain not in fake_domains


def load_unsubscribe_list() -> set[str]:
    """수신 거부 목록을 로드합니다."""
    unsub_file = "scripts/output/수신거부_목록.csv"
    if not os.path.exists(unsub_file):
        return set()
    with open(unsub_file, "r", encoding="utf-8-sig") as f:
        return {row["이메일"].strip().lower() for row in csv.DictReader(f)}


# ─── 발송 이력 관리 ─────────────────────────────────────────

def load_send_log(log_path: str) -> dict[str, dict]:
    """기존 발송 로그를 로드합니다. {email: {status, sent_at, ...}}"""
    log = {}
    if not os.path.exists(log_path):
        return log

    with open(log_path, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            log[row["이메일"]] = row
    return log


def save_send_log(log_path: str, results: list[dict]):
    """발송 결과를 CSV로 저장합니다 (기존 내용 유지 + 신규 추가)."""
    existing = load_send_log(log_path)

    # 신규 결과 머지
    for r in results:
        existing[r["이메일"]] = r

    fieldnames = ["업체명", "이메일", "웹사이트", "발송상태", "발송시각", "오류내용", "소스파일"]
    with open(log_path, "w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for row in existing.values():
            writer.writerow(row)


# ─── Resend API 발송 ────────────────────────────────────────

def _init_resend():
    """Resend API 키를 초기화합니다."""
    if not RESEND_API_KEY:
        print("  [오류] email_config.py에서 RESEND_API_KEY를 설정해 주세요.")
        print("  API 키 발급: https://resend.com/api-keys")
        sys.exit(1)
    resend.api_key = RESEND_API_KEY


def _get_sender() -> str:
    """발신자 문자열을 반환합니다."""
    if not SENDER_EMAIL:
        print("  [오류] email_config.py에서 SENDER_EMAIL을 설정해 주세요.")
        print("  도메인 인증 전 테스트: onboarding@resend.dev 사용 가능")
        sys.exit(1)
    return f"{SENDER_NAME} <{SENDER_EMAIL}>"


def send_single_email(to_email: str, company_name: str) -> tuple[bool, str]:
    """Resend API로 단일 이메일을 발송합니다. (성공여부, 오류메시지) 반환."""
    html_body = build_email_html(company_name, LANDING_PAGE_URL)
    text_body = build_email_text(company_name, LANDING_PAGE_URL)

    params: resend.Emails.SendParams = {
        "from": _get_sender(),
        "to": [to_email],
        "subject": EMAIL_SUBJECT,
        "html": html_body,
        "text": text_body,
        "reply_to": SENDER_EMAIL,
        "tags": [
            {"name": "campaign", "value": "pre_launch"},
            {"name": "type", "value": "outreach"},
        ],
    }

    for attempt in range(1, RETRY_COUNT + 1):
        try:
            response = resend.Emails.send(params)
            email_id = response.get("id", "") if isinstance(response, dict) else getattr(response, "id", "")
            if email_id:
                return True, ""
            return False, f"응답에 ID 없음: {response}"
        except Exception as e:
            error_msg = str(e)
            if attempt < RETRY_COUNT:
                time.sleep(RETRY_DELAY)
                continue
            return False, f"Resend API 오류: {error_msg}"

    return False, "최대 재시도 초과"


# ─── 일괄 발송 ──────────────────────────────────────────────

def send_emails(
    recipients: list[dict],
    csv_source: str,
    dry_run: bool = False,
    limit: int = 0,
    retry_failed: bool = False,
):
    """이메일 일괄 발송을 실행합니다."""
    # 수신 거부 목록 제외
    unsubscribed = load_unsubscribe_list()
    recipients = [r for r in recipients if r["email"].lower() not in unsubscribed]

    # 이미 발송된 이메일 제외
    send_log = load_send_log(SEND_LOG_CSV)
    filtered = []
    for r in recipients:
        prev = send_log.get(r["email"])
        if prev:
            if retry_failed and prev.get("발송상태") == "실패":
                filtered.append(r)  # 실패한 건 재시도
            # 이미 성공한 건은 스킵
        else:
            filtered.append(r)

    # 배치 제한 적용
    effective_limit = limit if limit > 0 else (BATCH_SIZE if BATCH_SIZE > 0 else len(filtered))
    targets = filtered[:effective_limit]

    print(f"\n{'='*60}")
    print(f"  XBridge 이메일 발송 시스템 (Resend API)")
    print(f"{'='*60}")
    print(f"  전체 수신 대상: {len(recipients)}건")
    print(f"  이미 발송됨:    {len(recipients) - len(filtered)}건 (스킵)")
    print(f"  이번 발송 대상: {len(targets)}건")
    if dry_run:
        print(f"  모드: DRY-RUN (실제 발송 없음)")
    print(f"{'='*60}\n")

    if not targets:
        print("  발송할 대상이 없습니다.")
        return

    if dry_run:
        print(f"  {'#':<4} {'업체명':<40} {'이메일':<40}")
        print(f"  {'-'*4} {'-'*40} {'-'*40}")
        for i, r in enumerate(targets, 1):
            print(f"  {i:<4} {r['company'][:40]:<40} {r['email'][:40]:<40}")
        print(f"\n  총 {len(targets)}건이 발송 예정입니다.")
        print(f"  실제 발송하려면 --dry-run 플래그를 제거하세요.\n")
        return

    # Resend API 초기화
    _init_resend()
    sender = _get_sender()
    print(f"  발신자: {sender}\n")

    results = []
    success_count = 0
    fail_count = 0

    for i, r in enumerate(targets, 1):
        company = r["company"]
        email = r["email"]
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        ok, error_msg = send_single_email(email, company)

        status = "성공" if ok else "실패"
        if ok:
            success_count += 1
        else:
            fail_count += 1

        results.append({
            "업체명": company,
            "이메일": email,
            "웹사이트": r.get("website", ""),
            "발송상태": status,
            "발송시각": now,
            "오류내용": error_msg,
            "소스파일": csv_source,
        })

        icon = "O" if ok else "X"
        print(f"  [{icon}] {i}/{len(targets)} {company} -> {email} {f'({error_msg})' if error_msg else ''}")

        # 다음 발송 전 대기 (Rate limit 방지)
        if i < len(targets):
            time.sleep(SEND_DELAY)

    # 결과 저장
    if results:
        save_send_log(SEND_LOG_CSV, results)

    print(f"\n{'='*60}")
    print(f"  발송 완료: 성공 {success_count}건, 실패 {fail_count}건")
    print(f"  결과 파일: {SEND_LOG_CSV}")
    print(f"{'='*60}\n")


# ─── 테스트 발송 ────────────────────────────────────────────

def send_test_email(test_to: str):
    """특정 이메일 주소로 테스트 발송합니다."""
    _init_resend()
    sender = _get_sender()

    print(f"\n  테스트 발송 (Resend API)")
    print(f"  발신자: {sender}")
    print(f"  수신자: {test_to}")
    print(f"  제목: {EMAIL_SUBJECT}\n")

    ok, error_msg = send_single_email(test_to, "테스트 업체")

    if ok:
        print(f"  [성공] 테스트 이메일이 {test_to}로 발송되었습니다.")
        print(f"  Resend 대시보드에서 확인: https://resend.com/emails")
    else:
        print(f"  [실패] {error_msg}")


# ─── CLI ─────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="XBridge 마케팅 이메일 발송 스크립트 (Resend API)",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument(
        "--csv",
        default=RECIPIENTS_CSV,
        help=f"수신자 CSV 파일 경로 (기본: {RECIPIENTS_CSV})",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="실제 발송 없이 대상 목록만 출력",
    )
    parser.add_argument(
        "--test-to",
        type=str,
        help="특정 이메일 주소로 테스트 발송",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=0,
        help="발송 건수 제한 (0 = 설정된 BATCH_SIZE 적용)",
    )
    parser.add_argument(
        "--retry-failed",
        action="store_true",
        help="이전에 실패한 건만 재발송",
    )

    args = parser.parse_args()

    # 테스트 발송
    if args.test_to:
        send_test_email(args.test_to)
        return

    # CSV 로드
    csv_path = args.csv
    if not os.path.exists(csv_path):
        print(f"  [오류] CSV 파일을 찾을 수 없습니다: {csv_path}")
        sys.exit(1)

    recipients = load_recipients(csv_path)
    if not recipients:
        print(f"  [오류] 발송 가능한 수신자가 없습니다 (상태='성공'인 항목 없음)")
        sys.exit(1)

    send_emails(
        recipients=recipients,
        csv_source=csv_path,
        dry_run=args.dry_run,
        limit=args.limit,
        retry_failed=args.retry_failed,
    )


if __name__ == "__main__":
    main()
