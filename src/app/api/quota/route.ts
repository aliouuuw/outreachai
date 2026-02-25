import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth-middleware";
import { getQuotaStatus } from "@/lib/quota";

export async function GET(request: NextRequest) {
  const { session, userId } = await requireSession(request);
  if (!session || !userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const quota = await getQuotaStatus(userId);
    return NextResponse.json(quota);
  } catch (err) {
    console.error("Failed to fetch quota status:", err);
    return NextResponse.json({ error: "Failed to fetch quota status" }, { status: 500 });
  }
}
