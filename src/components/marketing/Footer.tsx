"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[#E2E8F0] bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Company */}
          <div>
            <h3 className="text-lg font-bold text-[#1E40AF]">XBridge</h3>
            <p className="mt-3 text-sm leading-relaxed text-[#64748B]">
              K-Food 수출의 새로운 기준.
              <br />
              AI 기반 수출 플랫폼
            </p>
          </div>

          {/* Service */}
          <div>
            <h4 className="text-sm font-semibold text-[#1E293B]">서비스</h4>
            <ul className="mt-3 space-y-2">
              <li>
                <button
                  onClick={() =>
                    document
                      .getElementById("features")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="text-sm text-[#64748B] hover:text-[#1E40AF]"
                >
                  서비스 소개
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    document
                      .getElementById("form")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="text-sm text-[#64748B] hover:text-[#1E40AF]"
                >
                  사전 신청
                </button>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold text-[#1E293B]">고객 지원</h4>
            <ul className="mt-3 space-y-2">
              <li>
                <button
                  onClick={() =>
                    document
                      .getElementById("faq")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="text-sm text-[#64748B] hover:text-[#1E40AF]"
                >
                  FAQ
                </button>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-[#1E293B]">법적 고지</h4>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-[#64748B] hover:text-[#1E40AF]"
                >
                  이용약관
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-[#64748B] hover:text-[#1E40AF]"
                >
                  개인정보처리방침
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-[#E2E8F0] pt-8 text-center text-sm text-[#64748B]">
          <p>&copy; 2026 XBridge. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
