export interface UTMParams {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
}

export interface UTMSession {
  id: string;
  created_at: string;
  session_id: string;
  visitor_id: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  referrer: string | null;
  landing_page: string;
  user_agent: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  screen_resolution: string | null;
  session_start: string;
  session_end: string | null;
  page_view_count: number;
  is_converted: boolean;
}

export interface SessionInfo {
  session_id: string;
  visitor_id: string;
  utm: UTMParams;
  referrer: string;
  landing_page: string;
  device_type: "mobile" | "tablet" | "desktop";
  browser: string;
  os: string;
  screen_resolution: string;
}
