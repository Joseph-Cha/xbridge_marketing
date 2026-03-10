import { NextRequest, NextResponse } from "next/server";
import {
  appendRow,
  findRows,
  updateRowByColumn,
} from "@/lib/google-sheets";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      session_id,
      visitor_id,
      utm,
      referrer,
      landing_page,
      device_type,
      browser,
      os,
      screen_resolution,
      user_agent,
      page_path,
    } = body;

    if (!session_id || !visitor_id || !page_path) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Upsert session
    const existingSessions = await findRows(
      "utm_sessions",
      "session_id",
      session_id
    );

    if (existingSessions.length > 0) {
      const currentCount = parseInt(existingSessions[0].page_view_count || "0", 10);
      await updateRowByColumn("utm_sessions", "session_id", session_id, {
        page_view_count: currentCount + 1,
      });
    } else {
      await appendRow("utm_sessions", {
        session_id,
        visitor_id,
        utm_source: utm?.utm_source || "",
        utm_medium: utm?.utm_medium || "",
        utm_campaign: utm?.utm_campaign || "",
        utm_term: utm?.utm_term || "",
        utm_content: utm?.utm_content || "",
        referrer: referrer || "",
        landing_page,
        user_agent: user_agent || "",
        device_type: device_type || "",
        browser: browser || "",
        os: os || "",
        screen_resolution: screen_resolution || "",
        page_view_count: 1,
        is_converted: false,
      });
    }

    // Insert page view
    const pageViewId = await appendRow("page_views", {
      session_id,
      page_path,
    });

    return NextResponse.json({
      success: true,
      session_id,
      page_view_id: pageViewId,
    });
  } catch (error) {
    console.error("Page views API error:", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
