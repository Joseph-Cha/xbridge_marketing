"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SECTION_IDS } from "@/constants/sections";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const TRUST_BADGES = [
  "완전 무료",
  "1분 내 신청 완료",
  "언제든 취소 가능",
];

export default function CTASection() {
  const [leadCount, setLeadCount] = useState(0);

  useEffect(() => {
    fetch("/api/leads/count")
      .then((res) => res.json())
      .then((data) => setLeadCount(data.count ?? 0))
      .catch(() => {});
  }, []);

  const scrollToForm = () => {
    document
      .getElementById(SECTION_IDS.FORM)
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id={SECTION_IDS.FINAL_CTA}
      className="relative overflow-hidden bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] py-24"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-white blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-white blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          <motion.h2
            variants={fadeInUp}
            className="text-3xl font-bold text-white sm:text-4xl"
          >
            지금 사전 신청하고,
            <br />
            출시와 동시에 K-Food 수출을 시작하세요
          </motion.h2>

          <motion.p
            variants={fadeInUp}
            className="mt-4 text-lg font-medium text-white/90"
          >
            선착순 500개 기업 한정 — 50% 할인 + 무료 컨설팅 혜택
          </motion.p>

          <motion.p
            variants={fadeInUp}
            className="mt-3 text-sm text-white/80"
          >
            {leadCount > 0 ? (
              <>
                현재{" "}
                <span className="font-semibold text-white">
                  {leadCount.toLocaleString()}
                </span>
                개 기업 신청 완료 — 남은 자리가 얼마 없습니다!
              </>
            ) : (
              "지금 바로 사전 신청하세요!"
            )}
          </motion.p>

          <motion.div variants={fadeInUp} className="mt-10">
            <Button
              onClick={scrollToForm}
              size="lg"
              className="h-14 bg-[#F97316] px-10 text-lg font-semibold text-white shadow-lg shadow-black/20 transition-all hover:bg-[#EA580C] hover:shadow-xl"
            >
              사전 신청하기
            </Button>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="mt-8 flex flex-wrap items-center justify-center gap-6"
          >
            {TRUST_BADGES.map((badge) => (
              <span
                key={badge}
                className="flex items-center gap-2 text-sm text-white/90"
              >
                <Check className="h-4 w-4" />
                {badge}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
