export interface Lead {
  id: string;
  created_at: string;
  updated_at: string;
  session_id: string | null;
  company_name: string;
  business_number: string | null;
  industry: Industry;
  annual_revenue: AnnualRevenue | null;
  contact_name: string;
  food_category: string | null;
  position: string | null;
  email: string;
  phone: string;
  target_countries: TargetCountry[];
  export_experience: ExportExperience;
  additional_notes: string | null;
  privacy_consent: boolean;
  marketing_consent: boolean;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  status: LeadStatus;
  assigned_to: string | null;
  notes: string | null;
  contacted_at: string | null;
  qualified_at: string | null;
  converted_at: string | null;
}

export type Industry =
  | "가공식품"
  | "음료"
  | "건강식품"
  | "전통식품"
  | "기타";

export type AnnualRevenue =
  | "10억 미만"
  | "10억 ~ 50억"
  | "50억 ~ 100억"
  | "100억 이상";

export type TargetCountry = "us" | "jp" | "cn" | "sea" | "eu" | "other";

export type ExportExperience = "yes" | "no" | "preparing";

export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "converted"
  | "rejected";

export interface LeadFormData {
  session_id: string;
  company_name: string;
  business_number?: string;
  industry: Industry;
  annual_revenue?: AnnualRevenue;
  contact_name: string;
  food_category?: string;
  position?: string;
  email: string;
  phone: string;
  target_countries: TargetCountry[];
  export_experience: ExportExperience;
  additional_notes?: string;
  privacy_consent: boolean;
  marketing_consent?: boolean;
}
