import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ generationId: string }> },
) {
  const { generationId } = await params;
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

  // generation 소유권 + 결제 확인
  const { data: generation, error: genError } = await supabase
    .from("fm_generations")
    .select("id, user_id, is_paid, status")
    .eq("id", generationId)
    .single();

  if (genError || !generation) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "생성 기록을 찾을 수 없어요" } },
      { status: 404 },
    );
  }

  if (generation.user_id !== user.id) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "권한이 없습니다" } },
      { status: 403 },
    );
  }

  if (!generation.is_paid) {
    return NextResponse.json(
      { error: { code: "NOT_PAID", message: "결제가 필요합니다" } },
      { status: 402 },
    );
  }

  // 스티커 목록 조회 → signed URL 생성
  const { data: stickers, error: stickersError } = await supabase
    .from("fm_stickers")
    .select("id, sort_order, expression, image_path")
    .eq("generation_id", generationId)
    .order("sort_order");

  if (stickersError || !stickers?.length) {
    return NextResponse.json(
      { error: { code: "NO_STICKERS", message: "스티커가 없어요" } },
      { status: 404 },
    );
  }

  // 각 스티커에 대해 signed URL 생성 (1시간 유효)
  const downloadUrls = await Promise.all(
    stickers.map(async (sticker) => {
      const { data } = await supabase.storage
        .from("fm-stickers")
        .createSignedUrl(sticker.image_path, 3600);

      return {
        expression: sticker.expression,
        sortOrder: sticker.sort_order,
        url: data?.signedUrl || null,
      };
    }),
  );

  return NextResponse.json({
    generationId,
    stickers: downloadUrls.filter((s) => s.url),
  });
}
