import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// 개별 스티커 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
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

  // 스티커 소유권 확인 (generation → user_id)
  const { data: sticker } = await supabase
    .from("fm_stickers")
    .select("id, generation_id, image_path, fm_generations!inner(user_id)")
    .eq("id", id)
    .single();

  if (!sticker) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "스티커를 찾을 수 없어요" } },
      { status: 404 },
    );
  }

  // Storage에서 이미지 삭제
  await supabase.storage.from("fm-stickers").remove([sticker.image_path]);

  // DB에서 삭제
  await supabase.from("fm_stickers").delete().eq("id", id);

  return NextResponse.json({ success: true });
}

// 개별 스티커 순서 변경
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
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

  const { sortOrder } = await request.json();

  if (typeof sortOrder !== "number") {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "순서 값이 필요합니다" } },
      { status: 400 },
    );
  }

  const { error } = await supabase
    .from("fm_stickers")
    .update({ sort_order: sortOrder })
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: { code: "UPDATE_FAILED", message: "순서 변경에 실패했습니다" } },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
