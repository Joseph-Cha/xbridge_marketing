export const SECTION_IDS = {
  HERO: "hero",
  PAIN_POINTS: "pain_points",
  FEATURES: "features",
  TRUST: "trust",
  BENEFITS: "benefits",
  FORM: "form",
  FAQ: "faq",
  FINAL_CTA: "final_cta",
} as const;

export type SectionId = (typeof SECTION_IDS)[keyof typeof SECTION_IDS];

export const SECTION_NAV_ITEMS = [
  { id: SECTION_IDS.FEATURES, label: "서비스 소개" },
  { id: SECTION_IDS.BENEFITS, label: "사전 신청 혜택" },
  { id: SECTION_IDS.FAQ, label: "FAQ" },
] as const;
