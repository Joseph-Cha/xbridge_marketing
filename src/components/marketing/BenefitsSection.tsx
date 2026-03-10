"use client";

import { motion } from "framer-motion";
import { Ticket, BadgePercent, MessageCircle, FlaskConical } from "lucide-react";
import { SECTION_IDS } from "@/constants/sections";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const BENEFITS = [
  {
    icon: Ticket,
    title: "우선 초대권",
    description: "정식 출시 시 가장 먼저 서비스를\n이용하세요",
  },
  {
    icon: BadgePercent,
    title: "첫 3개월 50% 할인",
    description: "정식 가격 확정 시 가장 유리한 조건을\n보장해 드려요",
  },
  {
    icon: MessageCircle,
    title: "무료 컨설팅",
    description: "10년 이상 경력 K-Food 수출 전문가\n1:1 상담 1회 무료",
  },
  {
    icon: FlaskConical,
    title: "베타 테스터 참여",
    description: "출시 전 베타 버전을 먼저 체험하세요\n(선착순)",
  },
];

export default function BenefitsSection() {
  return (
    <section id={SECTION_IDS.BENEFITS} className="bg-[#F8FAFC] py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.div variants={fadeInUp} className="text-center">
            <h2 className="text-3xl font-bold text-[#1E293B] sm:text-4xl">
              지금 사전 신청하시면
            </h2>
            <p className="mt-4 text-lg text-[#64748B]">
              정식 출시 전 신청자에게만 드리는 특별 혜택
            </p>
          </motion.div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((benefit) => (
              <motion.div
                key={benefit.title}
                variants={fadeInUp}
                whileHover={{ y: -4 }}
                className="rounded-xl bg-white p-6 text-center shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mx-auto mb-4 inline-flex rounded-full bg-[#F97316]/10 p-4">
                  <benefit.icon className="h-7 w-7 text-[#F97316]" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-[#1E293B]">
                  {benefit.title}
                </h3>
                <p className="whitespace-pre-line text-sm leading-relaxed text-[#64748B]">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Urgency */}
          <motion.div
            variants={fadeInUp}
            className="mt-12 text-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-[#EF4444]/10 px-6 py-3 text-sm font-semibold text-[#EF4444]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#EF4444] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#EF4444]" />
              </span>
              선착순 500개 기업 한정
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
