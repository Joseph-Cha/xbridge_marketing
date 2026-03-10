import { NextRequest, NextResponse } from "next/server";
import { appendRow } from "@/lib/google-sheets";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      session_id,
      event_type,
      field_name,
      error_message,
      fields_filled,
      completion_rate,
      time_spent,
    } = body;

    if (!session_id || !event_type) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    await appendRow("form_events", {
      session_id,
      event_type,
      field_name: field_name || "",
      error_message: error_message || "",
      fields_filled: fields_filled || [],
      completion_rate: completion_rate || 0,
      time_spent: time_spent || 0,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Form events API error:", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
