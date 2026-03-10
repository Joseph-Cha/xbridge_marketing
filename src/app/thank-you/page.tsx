"use client";

import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ThankYouPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#22C55E]/10"
        >
          <CheckCircle className="h-12 w-12 text-[#22C55E]" />
        </motion.div>

        <h1 className="text-3xl font-bold text-[#1E293B]">
          사전 신청이 완료되었습니다!
        </h1>

        <p className="mt-4 text-[#64748B] leading-relaxed">
          정식 출시 시 가장 먼저 안내해 드리겠습니다.
        </p>

        <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#1E293B]">
            다음 단계
          </h2>
          <ul className="mt-4 space-y-3 text-left text-sm text-[#64748B]">
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1E40AF]/10 text-xs font-bold text-[#1E40AF]">
                1
              </span>
              베타 테스트 선정 시 별도 안내 예정
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1E40AF]/10 text-xs font-bold text-[#1E40AF]">
                2
              </span>
              정식 출시 시 우선 초대 + 50% 할인 혜택
            </li>
          </ul>
        </div>

        <Link
          href="/"
          className="mt-8 inline-flex h-10 items-center justify-center rounded-lg bg-[#1E40AF] px-6 text-sm font-medium text-white transition-colors hover:bg-[#1E3A8A]"
        >
          홈으로 돌아가기
        </Link>
      </motion.div>
    </div>
  );
}
