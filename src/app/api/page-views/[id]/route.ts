import { NextRequest, NextResponse } from "next/server";
import { updateRowById } from "@/lib/google-sheets";

async function handleUpdate(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updateData: Record<string, unknown> = {};

    if (body.sections_reached) updateData.sections_reached = body.sections_reached;
    if (body.max_scroll_depth !== undefined) updateData.max_scroll_depth = body.max_scroll_depth;
    if (body.time_on_page !== undefined) updateData.time_on_page = body.time_on_page;
    if (body.cta_clicks !== undefined) updateData.cta_clicks = body.cta_clicks;
    if (body.faq_opens) updateData.faq_opens = body.faq_opens;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: true });
    }

    const updated = await updateRowById("page_views", id, updateData);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Page view not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Page view update error:", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}

export { handleUpdate as PATCH, handleUpdate as POST };
