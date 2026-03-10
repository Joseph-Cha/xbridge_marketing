"use client";

import { motion } from "framer-motion";
import { HelpCircle, ShieldAlert, Wallet, Globe } from "lucide-react";
import { SECTION_IDS } from "@/constants/sections";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const PAIN_POINTS = [
  {
    icon: HelpCircle,
    title: "어디서부터 시작해야 할지\n모르겠어요",
    description: "인증부터 통관, 라벨링까지\n어디서부터 손대야 할지 모르겠어요",
  },
  {
    icon: ShieldAlert,
    title: "믿을 수 있는 바이어를\n찾기 어려워요",
    description: "실제 거래까지 이어질 수 있는\n바이어인지 확신이 없습니다",
  },
  {
    icon: Wallet,
    title: "소규모라 수출 비용이\n부담돼요",
    description: "대행사·인증·물류 비용이 쌓이면\n수익이 남을지 걱정됩니다",
  },
  {
    icon: Globe,
    title: "해외 시장 정보가 부족해요",
    description: "어떤 국가에서 우리 제품이 팔릴지\n모르겠습니다",
  },
];

export default function PainPointsSection() {
  return (
    <section id={SECTION_IDS.PAIN_POINTS} className="bg-[#F8FAFC] py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="text-center"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-3xl font-bold text-[#1E293B] sm:text-4xl"
          >
            K-Food 수출, 이런 벽에 부딪히셨나요?
          </motion.h2>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PAIN_POINTS.map((point) => (
              <motion.div
                key={point.title}
                variants={fadeInUp}
                whileHover={{ y: -4 }}
                className="group rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 inline-flex rounded-lg bg-[#1E40AF]/10 p-3">
                  <point.icon className="h-6 w-6 text-[#1E40AF]" />
                </div>
                <h3 className="mb-2 whitespace-pre-line text-lg font-semibold text-[#1E293B]">
                  {point.title}
                </h3>
                <p className="whitespace-pre-line text-sm leading-relaxed text-[#64748B]">
                  {point.description}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.p
            variants={fadeInUp}
            className="mt-12 text-lg font-medium text-[#1E40AF]"
          >
            XBridge가 이 모든 고민을 해결해 드립니다
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
