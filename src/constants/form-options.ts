export const INDUSTRY_OPTIONS = [
  { value: "processed_food", label: "가공식품" },
  { value: "beverage", label: "음료" },
  { value: "health_food", label: "건강식품" },
  { value: "traditional_food", label: "전통식품" },
  { value: "other", label: "기타" },
] as const;

export const ANNUAL_REVENUE_OPTIONS = [
  { value: "under_1b", label: "10억 미만" },
  { value: "1b_to_5b", label: "10억 ~ 50억" },
  { value: "5b_to_10b", label: "50억 ~ 100억" },
  { value: "over_10b", label: "100억 이상" },
] as const;

export const TARGET_COUNTRY_OPTIONS = [
  { value: "us", label: "\u{1F1FA}\u{1F1F8} 미국" },
  { value: "jp", label: "\u{1F1EF}\u{1F1F5} 일본" },
  { value: "cn", label: "\u{1F1E8}\u{1F1F3} 중국" },
  { value: "sea", label: "\u{1F30F} 동남아" },
  { value: "eu", label: "\u{1F1EA}\u{1F1FA} 유럽" },
  { value: "other", label: "\u{1F30D} 기타" },
] as const;

export const EXPORT_EXPERIENCE_OPTIONS = [
  { value: "yes", label: "있음" },
  { value: "no", label: "없음" },
  { value: "preparing", label: "준비중" },
] as const;
