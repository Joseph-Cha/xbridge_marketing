#!/usr/bin/env python3
"""
수신자 목록 관리 스크립트

신규 업체 CSV를 기존 목록에 병합하거나, 발송 현황을 조회합니다.

사용법:
    # 발송 현황 조회
    python scripts/manage_recipients.py --status

    # 신규 CSV를 기존 수신자 목록에 병합
    python scripts/manage_recipients.py --merge scripts/output/신규_업체.csv

    # 수신 거부 이메일 등록
    python scripts/manage_recipients.py --unsubscribe someone@example.com

    # 수신 거부 목록 확인
    python scripts/manage_recipients.py --list-unsubscribed
"""

import argparse
import csv
import os
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
os.chdir(PROJECT_ROOT)
sys.path.insert(0, str(PROJECT_ROOT / "scripts"))

from email_config import RECIPIENTS_CSV, SEND_LOG_CSV

UNSUBSCRIBE_FILE = "scripts/output/수신거부_목록.csv"


# ─── 현황 조회 ──────────────────────────────────────────────

def show_status():
    """발송 현황을 요약합니다."""
    # 전체 수신 대상
    total = 0
    success_emails = 0
    if os.path.exists(RECIPIENTS_CSV):
        with open(RECIPIENTS_CSV, "r", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            for row in reader:
                total += 1
                if row.get("상태") == "성공" and row.get("이메일", "").strip():
                    success_emails += 1

    # 발송 로그
    sent_ok = 0
    sent_fail = 0
    if os.path.exists(SEND_LOG_CSV):
        with open(SEND_LOG_CSV, "r", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            for row in reader:
                if row.get("발송상태") == "성공":
                    sent_ok += 1
                elif row.get("발송상태") == "실패":
                    sent_fail += 1

    # 수신 거부
    unsub_count = 0
    if os.path.exists(UNSUBSCRIBE_FILE):
        with open(UNSUBSCRIBE_FILE, "r", encoding="utf-8-sig") as f:
            unsub_count = sum(1 for _ in csv.DictReader(f))

    print(f"\n{'='*50}")
    print(f"  XBridge 이메일 발송 현황")
    print(f"{'='*50}")
    print(f"  전체 업체 수:        {total}건")
    print(f"  이메일 확보:         {success_emails}건")
    print(f"  발송 성공:           {sent_ok}건")
    print(f"  발송 실패:           {sent_fail}건")
    print(f"  미발송:              {success_emails - sent_ok - sent_fail}건")
    print(f"  수신 거부:           {unsub_count}건")
    print(f"{'='*50}\n")


# ─── CSV 병합 ───────────────────────────────────────────────

def merge_csv(new_csv_path: str):
    """신규 CSV를 기존 수신자 목록에 병합합니다.

    신규 CSV는 최소한 '업체명' 열과 '이메일' 열을 포함해야 합니다.
    '웹사이트', '상태' 열은 선택 사항입니다.
    """
    if not os.path.exists(new_csv_path):
        print(f"  [오류] 파일을 찾을 수 없습니다: {new_csv_path}")
        sys.exit(1)

    # 기존 목록 로드
    existing = {}
    if os.path.exists(RECIPIENTS_CSV):
        with open(RECIPIENTS_CSV, "r", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            for row in reader:
                key = row.get("업체명", "").strip()
                if key:
                    existing[key] = row

    # 신규 목록 로드 및 병합
    added = 0
    skipped = 0
    with open(new_csv_path, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            company = row.get("업체명", "").strip()
            if not company:
                continue

            if company in existing:
                skipped += 1
                continue

            # 신규 CSV 형식을 기존 형식에 맞춤
            existing[company] = {
                "업체명": company,
                "웹사이트": row.get("웹사이트", "").strip(),
                "이메일": row.get("이메일", "").strip(),
                "상태": row.get("상태", "성공" if row.get("이메일", "").strip() else "이메일 미발견"),
            }
            added += 1

    # 저장
    fieldnames = ["업체명", "웹사이트", "이메일", "상태"]
    with open(RECIPIENTS_CSV, "w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for row in existing.values():
            writer.writerow(row)

    print(f"\n  병합 완료: 추가 {added}건, 중복 스킵 {skipped}건")
    print(f"  저장 위치: {RECIPIENTS_CSV}\n")


# ─── 수신 거부 관리 ─────────────────────────────────────────

def add_unsubscribe(email: str):
    """수신 거부 이메일을 등록합니다."""
    from datetime import datetime

    entries = {}
    if os.path.exists(UNSUBSCRIBE_FILE):
        with open(UNSUBSCRIBE_FILE, "r", encoding="utf-8-sig") as f:
            for row in csv.DictReader(f):
                entries[row["이메일"]] = row

    if email in entries:
        print(f"  이미 수신 거부 등록됨: {email}")
        return

    entries[email] = {
        "이메일": email,
        "등록일": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    }

    fieldnames = ["이메일", "등록일"]
    with open(UNSUBSCRIBE_FILE, "w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for row in entries.values():
            writer.writerow(row)

    print(f"  수신 거부 등록 완료: {email}")


def list_unsubscribed():
    """수신 거부 목록을 출력합니다."""
    if not os.path.exists(UNSUBSCRIBE_FILE):
        print("  수신 거부 등록된 이메일이 없습니다.")
        return

    with open(UNSUBSCRIBE_FILE, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    if not rows:
        print("  수신 거부 등록된 이메일이 없습니다.")
        return

    print(f"\n  수신 거부 목록 ({len(rows)}건):")
    for row in rows:
        print(f"    {row['이메일']} (등록일: {row['등록일']})")
    print()


# ─── CLI ─────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="XBridge 수신자 목록 관리",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("--status", action="store_true", help="발송 현황 조회")
    parser.add_argument("--merge", type=str, help="신규 CSV 파일을 기존 목록에 병합")
    parser.add_argument("--unsubscribe", type=str, help="수신 거부 이메일 등록")
    parser.add_argument("--list-unsubscribed", action="store_true", help="수신 거부 목록 확인")

    args = parser.parse_args()

    if args.status:
        show_status()
    elif args.merge:
        merge_csv(args.merge)
    elif args.unsubscribe:
        add_unsubscribe(args.unsubscribe)
    elif args.list_unsubscribed:
        list_unsubscribed()
    else:
        # 기본: 현황 조회
        show_status()


if __name__ == "__main__":
    main()
