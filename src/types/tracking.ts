export interface PageView {
  id: string;
  created_at: string;
  session_id: string;
  page_path: string;
  sections_reached: string[];
  max_scroll_depth: number;
  time_on_page: number;
  cta_clicks: number;
  faq_opens: string[];
}

export interface FormEvent {
  id: string;
  created_at: string;
  session_id: string;
  event_type: FormEventType;
  field_name: string | null;
  error_message: string | null;
  fields_filled: string[];
  completion_rate: number;
  time_spent: number;
}

export type FormEventType =
  | "form_view"
  | "form_start"
  | "field_focus"
  | "field_blur"
  | "field_error"
  | "form_submit"
  | "form_success"
  | "form_error";

export interface PageViewCreatePayload {
  session_id: string;
  visitor_id: string;
  utm: import("./utm").UTMParams;
  referrer: string;
  landing_page: string;
  device_type: string;
  browser: string;
  os: string;
  screen_resolution: string;
  user_agent: string;
  page_path: string;
}

export interface PageViewUpdatePayload {
  sections_reached?: string[];
  max_scroll_depth?: number;
  time_on_page?: number;
  cta_clicks?: number;
  faq_opens?: string[];
}

export interface FormEventCreatePayload {
  session_id: string;
  event_type: FormEventType;
  field_name?: string;
  error_message?: string;
  fields_filled?: string[];
  completion_rate?: number;
  time_spent?: number;
}
