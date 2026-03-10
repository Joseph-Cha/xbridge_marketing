"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SECTION_IDS } from "@/constants/sections";
import { fadeInUp, staggerContainer } from "@/lib/animations";

function AnimatedCounter({ target }: { target: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (target <= 0) return;
    const duration = 1500;
    const steps = 30;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target]);

  return <span>{count.toLocaleString()}</span>;
}

export default function HeroSection() {
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
      id={SECTION_IDS.HERO}
      className="relative flex min-h-screen items-center overflow-hidden bg-gradient-to-br from-[#1E40AF]/5 via-white to-[#F97316]/5"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-[#1E40AF]/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-[#F97316]/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-3xl text-center"
        >
          {/* Badge */}
          <motion.div variants={fadeInUp} className="mb-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#7C3AED]/10 px-4 py-2 text-sm font-medium text-[#7C3AED]">
              <Rocket className="h-4 w-4" />
              2026년 상반기 출시 예정
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeInUp}
            className="text-4xl font-bold leading-tight tracking-tight text-[#1E293B] sm:text-5xl lg:text-6xl"
          >
            K-Food,{" "}
            <span className="bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] bg-clip-text text-transparent">
              세계 시장으로 연결하는
            </span>
            <br />
            가장 확실한 길
          </motion.h1>

          {/* Sub copy */}
          <motion.p
            variants={fadeInUp}
            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#64748B]"
          >
            AI가 최적 시장을 찾아주고, 검증된 바이어까지 연결해 주는
            <br className="hidden sm:block" />
            K-Food 수출 플랫폼이 곧 출시됩니다.
          </motion.p>

          {/* CTA */}
          <motion.div variants={fadeInUp} className="mt-10 flex flex-col items-center gap-4">
            <Button
              onClick={scrollToForm}
              size="lg"
              className="h-14 bg-[#F97316] px-10 text-lg font-semibold text-white shadow-lg shadow-[#F97316]/25 transition-all hover:bg-[#EA580C] hover:shadow-xl hover:shadow-[#F97316]/30"
            >
              사전 신청하고 특별 혜택 받기
            </Button>
            <p className="text-sm text-[#64748B]">
              지금 신청하시면 출시 시 우선 초대 + 특별 할인 혜택
            </p>
          </motion.div>

          {/* Counter */}
          <motion.div
            variants={fadeInUp}
            className="mt-12 inline-flex items-center gap-2 rounded-full bg-white/80 px-6 py-3 shadow-sm backdrop-blur-sm"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22C55E] opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#22C55E]" />
            </span>
            <span className="text-sm text-[#64748B]">
              {leadCount > 0 ? (
                <>
                  현재{" "}
                  <span className="font-semibold text-[#1E293B]">
                    <AnimatedCounter target={leadCount} />
                  </span>
                  개 기업이 사전 신청 완료
                </>
              ) : (
                "사전 신청 접수 중"
              )}
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
