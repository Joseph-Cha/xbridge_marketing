"use client";

import { useRef, useCallback } from "react";
import { trackFormEvent } from "@/lib/tracking";

export function useFormTracking(sessionId: string) {
  const startTimeRef = useRef(0);
  const startedRef = useRef(false);
  const filledFieldsRef = useRef<Set<string>>(new Set());
  const totalFields = 13;

  const trackView = useCallback(() => {
    if (!sessionId) return;
    trackFormEvent({ session_id: sessionId, event_type: "form_view" });
  }, [sessionId]);

  const trackStart = useCallback(() => {
    if (!sessionId || startedRef.current) return;
    startedRef.current = true;
    startTimeRef.current = Date.now();
    trackFormEvent({ session_id: sessionId, event_type: "form_start" });
  }, [sessionId]);

  const trackFieldBlur = useCallback(
    (fieldName: string) => {
      if (!sessionId) return;
      filledFieldsRef.current.add(fieldName);
      const completionRate = Math.round(
        (filledFieldsRef.current.size / totalFields) * 100
      );
      const timeSpent = startTimeRef.current
        ? Math.floor((Date.now() - startTimeRef.current) / 1000)
        : 0;

      trackFormEvent({
        session_id: sessionId,
        event_type: "field_blur",
        field_name: fieldName,
        fields_filled: Array.from(filledFieldsRef.current),
        completion_rate: completionRate,
        time_spent: timeSpent,
      });
    },
    [sessionId]
  );

  const trackFieldError = useCallback(
    (fieldName: string, errorMessage: string) => {
      if (!sessionId) return;
      trackFormEvent({
        session_id: sessionId,
        event_type: "field_error",
        field_name: fieldName,
        error_message: errorMessage,
      });
    },
    [sessionId]
  );

  const trackSubmit = useCallback(() => {
    if (!sessionId) return;
    const timeSpent = startTimeRef.current
      ? Math.floor((Date.now() - startTimeRef.current) / 1000)
      : 0;
    trackFormEvent({
      session_id: sessionId,
      event_type: "form_submit",
      fields_filled: Array.from(filledFieldsRef.current),
      completion_rate: Math.round(
        (filledFieldsRef.current.size / totalFields) * 100
      ),
      time_spent: timeSpent,
    });
  }, [sessionId]);

  const trackError = useCallback(
    (errorMessage: string) => {
      if (!sessionId) return;
      trackFormEvent({
        session_id: sessionId,
        event_type: "form_error",
        error_message: errorMessage,
      });
    },
    [sessionId]
  );

  return {
    trackView,
    trackStart,
    trackFieldBlur,
    trackFieldError,
    trackSubmit,
    trackError,
  };
}
