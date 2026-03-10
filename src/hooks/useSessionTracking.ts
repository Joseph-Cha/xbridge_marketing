"use client";

import { useEffect, useRef, useCallback } from "react";
import { trackPageView, updatePageView } from "@/lib/tracking";
import { getDeviceInfo } from "@/lib/utm";
import type { UTMParams } from "@/types/utm";

interface UseSessionTrackingProps {
  sessionId: string;
  visitorId: string;
  utm: UTMParams;
}

export function useSessionTracking({ sessionId, visitorId, utm }: UseSessionTrackingProps) {
  const pageViewIdRef = useRef<string | null>(null);
  const startTimeRef = useRef(Date.now());
  const sectionsRef = useRef<string[]>([]);
  const scrollDepthRef = useRef(0);
  const ctaClicksRef = useRef(0);
  const faqOpensRef = useRef<string[]>([]);

  const sendUpdate = useCallback(() => {
    if (!pageViewIdRef.current) return;
    const timeOnPage = Math.floor((Date.now() - startTimeRef.current) / 1000);
    updatePageView(pageViewIdRef.current, {
      sections_reached: sectionsRef.current,
      max_scroll_depth: scrollDepthRef.current,
      time_on_page: timeOnPage,
      cta_clicks: ctaClicksRef.current,
      faq_opens: faqOpensRef.current,
    });
  }, []);

  // Create page view on mount
  useEffect(() => {
    if (!sessionId || !visitorId) return;

    const device = getDeviceInfo();
    trackPageView({
      session_id: sessionId,
      visitor_id: visitorId,
      utm,
      referrer: document.referrer,
      landing_page: window.location.pathname,
      device_type: device.device_type,
      browser: device.browser,
      os: device.os,
      screen_resolution: device.screen_resolution,
      user_agent: navigator.userAgent,
      page_path: window.location.pathname,
    }).then((id) => {
      pageViewIdRef.current = id;
    });
  }, [sessionId, visitorId, utm]);

  // Periodic updates (every 30s)
  useEffect(() => {
    const interval = setInterval(sendUpdate, 30_000);
    return () => clearInterval(interval);
  }, [sendUpdate]);

  // Send on page unload
  useEffect(() => {
    const handleUnload = () => sendUpdate();
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [sendUpdate]);

  const addSection = useCallback((sectionId: string) => {
    if (!sectionsRef.current.includes(sectionId)) {
      sectionsRef.current = [...sectionsRef.current, sectionId];
    }
  }, []);

  const setScrollDepth = useCallback((depth: number) => {
    if (depth > scrollDepthRef.current) {
      scrollDepthRef.current = depth;
    }
  }, []);

  const addCtaClick = useCallback(() => {
    ctaClicksRef.current++;
  }, []);

  const addFaqOpen = useCallback((faqId: string) => {
    if (!faqOpensRef.current.includes(faqId)) {
      faqOpensRef.current = [...faqOpensRef.current, faqId];
    }
  }, []);

  return { addSection, setScrollDepth, addCtaClick, addFaqOpen };
}
