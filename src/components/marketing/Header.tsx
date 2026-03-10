"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SECTION_IDS, SECTION_NAV_ITEMS } from "@/constants/sections";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="text-xl font-bold text-[#1E40AF]"
        >
          XBridge
        </button>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {SECTION_NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="text-sm font-medium text-[#64748B] transition-colors hover:text-[#1E40AF]"
            >
              {item.label}
            </button>
          ))}
          <span className="rounded-full bg-[#7C3AED]/10 px-3 py-1 text-xs font-medium text-[#7C3AED]">
            Coming Soon
          </span>
          <Button
            onClick={() => scrollToSection(SECTION_IDS.FORM)}
            className="bg-[#F97316] text-white hover:bg-[#EA580C]"
          >
            사전 신청하기
          </Button>
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "메뉴 닫기" : "메뉴 열기"}
        >
          {mobileOpen ? (
            <X className="h-6 w-6 text-[#1E293B]" />
          ) : (
            <Menu className="h-6 w-6 text-[#1E293B]" />
          )}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-[#E2E8F0] bg-white px-4 pb-4 md:hidden"
        >
          {SECTION_NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="block w-full py-3 text-left text-sm font-medium text-[#64748B] hover:text-[#1E40AF]"
            >
              {item.label}
            </button>
          ))}
          <Button
            onClick={() => scrollToSection(SECTION_IDS.FORM)}
            className="mt-2 w-full bg-[#F97316] text-white hover:bg-[#EA580C]"
          >
            사전 신청하기
          </Button>
        </motion.nav>
      )}
    </motion.header>
  );
}
