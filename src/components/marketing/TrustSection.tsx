"use client";

import { motion } from "framer-motion";
import { Users, Award, Building2 } from "lucide-react";
import { SECTION_IDS } from "@/constants/sections";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const TRUST_POINTS = [
  {
    icon: Users,
    title: "전문가 팀",
    description: "10년 이상 경력의 식품 수출 전문가와\nAI 엔지니어가 함께 만들어요",
  },
  {
    icon: Building2,
    title: "파트너 협력",
    description: "한국무역협회 등 주요 기관과 협력하며\n서비스를 준비하고 있어요",
  },
  {
    icon: Award,
    title: "검증된 기술",
    description: "AI 기반 시장 분석과 바이어 매칭 기술로\n수출 성공률을 높여드려요",
  },
];

export default function TrustSection() {
  return (
    <section id={SECTION_IDS.TRUST} className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.div variants={fadeInUp} className="text-center">
            <h2 className="text-3xl font-bold text-[#1E293B] sm:text-4xl">
              왜 XBridge인가요?
            </h2>
            <p className="mt-4 text-lg text-[#64748B]">
              K-Food 수출의 모든 과정을 함께할 신뢰할 수 있는 파트너
            </p>
          </motion.div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {TRUST_POINTS.map((point) => (
              <motion.div
                key={point.title}
                variants={fadeInUp}
                className="text-center"
              >
                <div className="mx-auto mb-4 inline-flex rounded-full bg-[#1E40AF]/10 p-4">
                  <point.icon className="h-7 w-7 text-[#1E40AF]" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-[#1E293B]">
                  {point.title}
                </h3>
                <p className="whitespace-pre-line text-sm leading-relaxed text-[#64748B]">
                  {point.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* 파트너 로고 영역 */}
          <motion.div
            variants={fadeInUp}
            className="mt-16 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-8"
          >
            <p className="mb-6 text-center text-sm font-medium text-[#64748B]">
              협력 기관 및 파트너
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
              {["한국무역협회", "Pinesol VINA", "DYPrime", "록시에이에프씨"].map((name) => (
                <span
                  key={name}
                  className="text-base font-semibold text-[#94A3B8]"
                >
                  {name}
                </span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
