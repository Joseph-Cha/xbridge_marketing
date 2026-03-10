"use client";

import { useEffect, useRef } from "react";
import { SECTION_IDS } from "@/constants/sections";

interface UseSectionObserverProps {
  onSectionReached: (sectionId: string) => void;
  onScrollDepth: (depth: number) => void;
}

export function useSectionObserver({ onSectionReached, onScrollDepth }: UseSectionObserverProps) {
  const reportedDepths = useRef(new Set<number>());

  useEffect(() => {
    const sectionIds = Object.values(SECTION_IDS);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onSectionReached(entry.target.id);
          }
        });
      },
      { threshold: 0.5 }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const depth = Math.min(100, Math.round((scrollTop / docHeight) * 100));

      const milestones = [25, 50, 75, 100];
      for (const milestone of milestones) {
        if (depth >= milestone && !reportedDepths.current.has(milestone)) {
          reportedDepths.current.add(milestone);
          onScrollDepth(milestone);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [onSectionReached, onScrollDepth]);
}
