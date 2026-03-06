import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "로그인이 필요해요" } },
      { status: 401 },
    );
  }

  const { generationId, order } = await request.json();

  if (!generationId || !Array.isArray(order)) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "잘못된 요청입니다" } },
      { status: 400 },
    );
  }

  // generation 소유권 확인
  const { data: generation } = await supabase
    .from("fm_generations")
    .select("id, user_id")
    .eq("id", generationId)
    .single();

  if (!generation || generation.user_id !== user.id) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "권한이 없습니다" } },
      { status: 403 },
    );
  }

  // 순서 일괄 업데이트: order = [{ id: stickerId, sortOrder: number }]
  for (const item of order as { id: string; sortOrder: number }[]) {
    await supabase
      .from("fm_stickers")
      .update({ sort_order: item.sortOrder })
      .eq("id", item.id)
      .eq("generation_id", generationId);
  }

  return NextResponse.json({ success: true });
}
