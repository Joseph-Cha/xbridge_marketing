"use client";

import { useEffect, useRef } from "react";
import { parseAndStoreUTM, getOrCreateVisitorId, getOrCreateSessionId, getDeviceInfo } from "@/lib/utm";
import type { UTMParams } from "@/types/utm";

interface UTMState {
  sessionId: string;
  visitorId: string;
  utm: UTMParams;
}

export function useUTM(): UTMState {
  const stateRef = useRef<UTMState>({
    sessionId: "",
    visitorId: "",
    utm: { utm_source: null, utm_medium: null, utm_campaign: null, utm_term: null, utm_content: null },
  });

  useEffect(() => {
    stateRef.current = {
      sessionId: getOrCreateSessionId(),
      visitorId: getOrCreateVisitorId(),
      utm: parseAndStoreUTM(),
    };
  }, []);

  // Return refs for stable reference; values are set after first render
  if (typeof window !== "undefined") {
    return {
      sessionId: getOrCreateSessionId(),
      visitorId: getOrCreateVisitorId(),
      utm: stateRef.current.utm,
    };
  }

  return stateRef.current;
}

export { getDeviceInfo };
