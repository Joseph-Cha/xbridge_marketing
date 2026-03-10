declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackGA4Event(
  eventName: string,
  params?: Record<string, unknown>
) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", eventName, params);
}
