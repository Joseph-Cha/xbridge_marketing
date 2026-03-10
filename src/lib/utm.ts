import type { UTMParams } from "@/types/utm";

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

export function parseAndStoreUTM(): UTMParams {
  if (typeof window === "undefined") {
    return { utm_source: null, utm_medium: null, utm_campaign: null, utm_term: null, utm_content: null };
  }

  const params = new URLSearchParams(window.location.search);
  const hasUTM = UTM_KEYS.some((key) => params.has(key));

  if (hasUTM) {
    const utm: UTMParams = {
      utm_source: params.get("utm_source"),
      utm_medium: params.get("utm_medium"),
      utm_campaign: params.get("utm_campaign"),
      utm_term: params.get("utm_term"),
      utm_content: params.get("utm_content"),
    };
    sessionStorage.setItem("xb_utm", JSON.stringify(utm));
    return utm;
  }

  // Return stored UTM if no new params
  const stored = sessionStorage.getItem("xb_utm");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // ignore
    }
  }

  return { utm_source: null, utm_medium: null, utm_campaign: null, utm_term: null, utm_content: null };
}

export function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("xb_visitor_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("xb_visitor_id", id);
  }
  return id;
}

export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem("xb_session_id");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("xb_session_id", id);
  }
  return id;
}

export function getDeviceInfo() {
  if (typeof window === "undefined") {
    return { device_type: "desktop", browser: "", os: "", screen_resolution: "" };
  }

  const ua = navigator.userAgent;

  // Device type
  let device_type: "mobile" | "tablet" | "desktop" = "desktop";
  if (/tablet|ipad/i.test(ua)) device_type = "tablet";
  else if (/mobile|iphone|android.*mobile/i.test(ua)) device_type = "mobile";

  // Browser
  let browser = "other";
  if (/edg\//i.test(ua)) browser = "edge";
  else if (/chrome/i.test(ua) && !/edg/i.test(ua)) browser = "chrome";
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = "safari";
  else if (/firefox/i.test(ua)) browser = "firefox";

  // OS
  let os = "other";
  if (/windows/i.test(ua)) os = "windows";
  else if (/mac os/i.test(ua)) os = "macos";
  else if (/iphone|ipad/i.test(ua)) os = "ios";
  else if (/android/i.test(ua)) os = "android";
  else if (/linux/i.test(ua)) os = "linux";

  const screen_resolution = `${window.screen.width}x${window.screen.height}`;

  return { device_type, browser, os, screen_resolution };
}
