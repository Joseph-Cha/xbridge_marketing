"use client";

import { motion } from "framer-motion";
import { Search, Handshake, Package } from "lucide-react";
import { SECTION_IDS } from "@/constants/sections";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const FEATURES = [
  {
    icon: Search,
    title: "AI 수출 가능성 검토",
    description: "제품 정보만 입력하면, 5분 내 수출 가능성\n리포트를 받아보세요",
    details: [
      "목표 국가별 규제/인증 요건 분석",
      "시장 규모 및 경쟁 현황 파악",
      "예상 비용 및 소요 기간 산출",
    ],
  },
  {
    icon: Handshake,
    title: "검증된 바이어 매칭",
    description: "우리 제품에 맞는 바이어를 AI가 추천해\n드려요",
    details: [
      "아시아·북미·유럽의 글로벌 바이어 네트워크",
      "AI 기반 적합도 매칭",
      "바이어 신용도 정보 제공",
    ],
  },
  {
    icon: Package,
    title: "원스톱 수출 지원",
    description: "서류부터 물류까지 한 번에 해결하세요",
    details: [
      "수출 서류 AI 자동 생성",
      "인증 대행 연계",
      "물류/통관 파트너 연결",
    ],
  },
];

export default function FeaturesSection() {
  return (
    <section id={SECTION_IDS.FEATURES} className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.div variants={fadeInUp} className="text-center">
            <h2 className="text-3xl font-bold text-[#1E293B] sm:text-4xl">
              XBridge가 준비하고 있습니다
            </h2>
            <p className="mt-4 text-lg text-[#64748B]">
              출시 시 제공될 핵심 기능을 미리 만나보세요
            </p>
          </motion.div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {FEATURES.map((feature) => (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                whileHover={{ y: -4 }}
                className="group relative overflow-hidden rounded-xl border border-[#E2E8F0] bg-white p-8 transition-shadow hover:shadow-lg"
              >
                {/* Coming Soon overlay */}
                <div className="absolute top-4 right-4">
                  <span className="rounded-full bg-[#7C3AED]/10 px-3 py-1 text-xs font-medium text-[#7C3AED]">
                    Coming Soon
                  </span>
                </div>

                <div className="mb-6 inline-flex rounded-xl bg-[#1E40AF]/10 p-4">
                  <feature.icon className="h-8 w-8 text-[#1E40AF]" />
                </div>

                <h3 className="mb-2 text-xl font-semibold text-[#1E293B]">
                  {feature.title}
                </h3>
                <p className="mb-4 whitespace-pre-line text-[#64748B]">{feature.description}</p>

                <ul className="space-y-2">
                  {feature.details.map((detail) => (
                    <li
                      key={detail}
                      className="flex items-start gap-2 text-sm text-[#64748B]"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#3B82F6]" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
