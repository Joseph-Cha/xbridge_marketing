export const AW_CONVERSION_ID = "AW-18094494786";

export function gtagReportConversion(callbackUrl?: string) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;

  window.gtag("event", "conversion", {
    send_to: `${AW_CONVERSION_ID}/rxb8CJbd-ZwcEMKokLRD`,
    ...(callbackUrl && { event_callback: () => (window.location.href = callbackUrl) }),
  });
}