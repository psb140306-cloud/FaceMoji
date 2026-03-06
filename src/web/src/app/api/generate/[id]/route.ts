import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getJobStatus } from "@/lib/api/ai-server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: generationId } = await params;

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

  // generation 조회
  const { data: generation, error } = await supabase
    .from("fm_generations")
    .select("*, fm_stickers(*)")
    .eq("id", generationId)
    .eq("user_id", user.id)
    .single();

  if (error || !generation) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "생성 기록을 찾을 수 없어요" } },
      { status: 404 },
    );
  }

  return NextResponse.json({
    generation,
    stickers: generation.fm_stickers || [],
  });
}
