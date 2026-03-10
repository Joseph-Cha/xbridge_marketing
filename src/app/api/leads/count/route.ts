import { NextResponse } from "next/server";
import { countRows } from "@/lib/google-sheets";

export const revalidate = 300; // 5 minutes ISR

export async function GET() {
  try {
    const count = await countRows("leads");
    return NextResponse.json({ count });
  } catch (error) {
    console.error("Count query error:", error);
    return NextResponse.json({ count: 0 });
  }
}
