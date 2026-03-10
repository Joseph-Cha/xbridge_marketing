import { z } from "zod";

export const leadSchema = z.object({
  session_id: z.string().optional(),
  company_name: z.string().min(2, "회사명을 입력해주세요"),
  business_number: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\d{3}-\d{2}-\d{5}$/.test(val),
      "올바른 사업자등록번호를 입력해주세요"
    ),
  industry: z
    .enum(["processed_food", "beverage", "health_food", "traditional_food", "other"])
    .optional(),
  annual_revenue: z
    .enum(["under_1b", "1b_to_5b", "5b_to_10b", "over_10b"])
    .optional(),
  contact_name: z.string().optional(),
  position: z.string().optional(),
  email: z.string().email("올바른 이메일을 입력해주세요"),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/.test(val),
      "올바른 연락처를 입력해주세요"
    ),
  target_countries: z
    .array(z.string())
    .min(1, "관심 수출국을 선택해주세요"),
  export_experience: z.enum(["yes", "no", "preparing"]).optional(),
  additional_notes: z.string().max(1000, "1000자 이내로 입력해주세요").optional(),
  privacy_consent: z.literal(true, {
    message: "개인정보 수집에 동의해주세요",
  }),
  marketing_consent: z.boolean().optional(),
});

export type LeadFormValues = z.input<typeof leadSchema>;
