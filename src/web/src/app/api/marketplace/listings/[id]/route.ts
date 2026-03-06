import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// 리스팅 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: listing, error } = await supabase
    .from("fm_marketplace_listings")
    .select("*, fm_profiles!seller_id(display_name, avatar_url)")
    .eq("id", id)
    .single();

  if (error || !listing) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "리스팅을 찾을 수 없어요" } },
      { status: 404 },
    );
  }

  // 조회수 증가
  await supabase
    .from("fm_marketplace_listings")
    .update({ view_count: (listing.view_count || 0) + 1 })
    .eq("id", id);

  // 썸네일 목록 조회
  const { data: stickers } = await supabase
    .from("fm_stickers")
    .select("expression, thumbnail_path")
    .eq("generation_id", listing.generation_id)
    .order("sort_order");

  const thumbnails = (stickers || []).map((s) => ({
    expression: s.expression,
    url: s.thumbnail_path
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/fm-thumbnails/${s.thumbnail_path}`
      : null,
  }));

  return NextResponse.json({ ...listing, thumbnails });
}

// 리스팅 수정
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

  const updates = await request.json();
  const allowed = ["title", "description", "price", "category", "tags", "status"];
  const filtered: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in updates) filtered[key] = updates[key];
  }

  const { data, error } = await supabase
    .from("fm_marketplace_listings")
    .update(filtered)
    .eq("id", id)
    .eq("seller_id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: { code: "UPDATE_FAILED", message: "수정에 실패했습니다" } },
      { status: 500 },
    );
  }

  return NextResponse.json(data);
}

// 리스팅 삭제
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

  const { error } = await supabase
    .from("fm_marketplace_listings")
    .delete()
    .eq("id", id)
    .eq("seller_id", user.id);

  if (error) {
    return NextResponse.json(
      { error: { code: "DELETE_FAILED", message: "삭제에 실패했습니다" } },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
