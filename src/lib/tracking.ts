import type { PageViewCreatePayload, PageViewUpdatePayload, FormEventCreatePayload } from "@/types/tracking";

function sendBeaconOrFetch(url: string, data: unknown) {
  const body = JSON.stringify(data);
  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon(url, blob);
  } else {
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  }
}

export async function trackPageView(payload: PageViewCreatePayload): Promise<string | null> {
  try {
    const res = await fetch("/api/page-views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      return data.page_view_id || null;
    }
  } catch {
    // non-blocking
  }
  return null;
}

export function updatePageView(id: string, payload: PageViewUpdatePayload) {
  sendBeaconOrFetch(`/api/page-views/${id}`, payload);
}

export function trackFormEvent(payload: FormEventCreatePayload) {
  sendBeaconOrFetch("/api/form-events", payload);
}
