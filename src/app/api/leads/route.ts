import { NextRequest, NextResponse } from "next/server";
import {
  appendRow,
  findRows,
  updateRowByColumn,
} from "@/lib/google-sheets";
import { leadSchema } from "@/lib/validations";

// Simple in-memory rate limit (per IP, 5 requests per minute)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = leadSchema.safeParse(body);

    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0]?.toString() || "unknown";
        errors[field] = issue.message;
      }
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    const data = parsed.data;

    // Check email duplicate
    const existing = await findRows("leads", "email", data.email);

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, error: "이미 신청된 이메일입니다." },
        { status: 409 }
      );
    }

    // Get UTM info from session
    let utmSource: string | null = null;
    let utmMedium: string | null = null;
    let utmCampaign: string | null = null;

    if (data.session_id) {
      const sessions = await findRows(
        "utm_sessions",
        "session_id",
        data.session_id
      );

      if (sessions.length > 0) {
        const session = sessions[0];
        utmSource = session.utm_source || null;
        utmMedium = session.utm_medium || null;
        utmCampaign = session.utm_campaign || null;
      }
    }

    // Insert lead
    const leadId = await appendRow("leads", {
      session_id: data.session_id || "",
      company_name: data.company_name,
      business_number: data.business_number || "",
      industry: data.industry,
      annual_revenue: data.annual_revenue || "",
      contact_name: data.contact_name,
      food_category: data.food_category || "",
      position: data.position || "",
      email: data.email,
      phone: data.phone,
      target_countries: data.target_countries,
      export_experience: data.export_experience,
      additional_notes: data.additional_notes || "",
      privacy_consent: data.privacy_consent,
      marketing_consent: data.marketing_consent ?? false,
      utm_source: utmSource || "",
      utm_medium: utmMedium || "",
      utm_campaign: utmCampaign || "",
      status: "new",
    });

    // Mark session as converted
    if (data.session_id) {
      await updateRowByColumn(
        "utm_sessions",
        "session_id",
        data.session_id,
        { is_converted: true }
      );

      // Record form_success event
      await appendRow("form_events", {
        session_id: data.session_id,
        event_type: "form_success",
        completion_rate: 100,
      });
    }

    return NextResponse.json(
      { success: true, lead_id: leadId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Leads API error:", error);
    return NextResponse.json(
      { success: false, error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
