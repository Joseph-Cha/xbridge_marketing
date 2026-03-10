"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SECTION_IDS } from "@/constants/sections";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const FAQ_ITEMS = [
  {
    question: "사전 신청하면 비용이 발생하나요?",
    answer:
      "아니요, 사전 신청은 완전 무료이며 어떠한 결제 정보도 요구하지 않습니다. 정식 출시 후 서비스 이용 시에만 요금이 부과돼요.",
  },
  {
    question: "사전 신청 후 반드시 서비스를 이용해야 하나요?",
    answer:
      "아닙니다. 사전 신청은 우선 안내를 받기 위한 것으로, 이용 의무는 전혀 없어요. 출시 시 이용 여부는 자유롭게 결정하세요.",
  },
  {
    question: "서비스는 언제 출시되나요?",
    answer:
      "2026년 상반기 출시를 목표로 개발 중이며, 구체적 일정은 사전 신청자에게 가장 먼저 안내드려요.",
  },
  {
    question: "사전 신청 혜택은 언제까지 유효한가요?",
    answer:
      "정식 출시일로부터 3개월간 유효해요. 출시 전 신청자 모두에게 동일하게 적용됩니다.",
  },
  {
    question: "베타 테스트에는 어떻게 참여하나요?",
    answer:
      "사전 신청자 중 선착순으로 베타 테스터를 선정해요. 선정되시면 별도로 안내 메일을 보내드립니다.",
  },
  {
    question: "제출한 정보는 어떻게 사용되나요?",
    answer:
      "서비스 출시 안내, 혜택 제공, 서비스 개선을 위한 목적으로만 사용돼요. 개인정보처리방침에서 자세한 내용을 확인하실 수 있습니다.",
  },
];

export default function FAQSection() {
  return (
    <section id={SECTION_IDS.FAQ} className="py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.h2
            variants={fadeInUp}
            className="text-center text-3xl font-bold text-[#1E293B] sm:text-4xl"
          >
            자주 묻는 질문
          </motion.h2>

          <motion.div variants={fadeInUp} className="mt-12">
            <Accordion defaultValue={[]} className="space-y-3">
              {FAQ_ITEMS.map((item, index) => (
                <AccordionItem
                  key={index}
                  value={index}
                  className="rounded-lg border border-[#E2E8F0] bg-white px-6"
                >
                  <AccordionTrigger className="text-left text-base font-medium text-[#1E293B] hover:no-underline">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-[#64748B] leading-relaxed">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
