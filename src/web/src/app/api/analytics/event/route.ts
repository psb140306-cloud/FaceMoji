import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// 커스텀 이벤트 수집 (sendBeacon으로 호출)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, properties, timestamp } = body;

    if (!event) {
      return NextResponse.json({ error: "event required" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from("fm_analytics_events").insert({
      user_id: user?.id || null,
      event_name: event,
      properties: properties || {},
      created_at: timestamp || new Date().toISOString(),
    });

    return NextResponse.json({ ok: true });
  } catch {
    // sendBeacon 에러는 무시
    return NextResponse.json({ ok: true });
  }
}
