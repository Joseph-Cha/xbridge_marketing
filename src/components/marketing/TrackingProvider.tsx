"use client";

import { useUTM } from "@/hooks/useUTM";
import { useSessionTracking } from "@/hooks/useSessionTracking";
import { useSectionObserver } from "@/hooks/useSectionObserver";
import { trackGA4Event } from "@/lib/ga4";

export default function TrackingProvider() {
  const { sessionId, visitorId, utm } = useUTM();
  const { addSection, setScrollDepth } = useSessionTracking({
    sessionId,
    visitorId,
    utm,
  });

  useSectionObserver({
    onSectionReached: (sectionId) => {
      addSection(sectionId);
      trackGA4Event("section_view", { section_id: sectionId });
    },
    onScrollDepth: (depth) => {
      setScrollDepth(depth);
      trackGA4Event("scroll_depth", { depth_percentage: depth });
    },
  });

  return null;
}
