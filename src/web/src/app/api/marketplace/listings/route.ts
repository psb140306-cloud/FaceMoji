import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const PLATFORM_FEE_RATE = 0.25; // 25% 수수료

// 리스팅 목록 조회 (공개)
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = request.nextUrl;
  const category = searchParams.get("category");
  const sort = searchParams.get("sort") || "latest";
  const page = Number(searchParams.get("page") || "1");
  const limit = 12;
  const offset = (page - 1) * limit;

  let query = supabase
    .from("fm_marketplace_listings")
    .select("*, fm_profiles!seller_id(display_name, avatar_url)", { count: "exact" })
    .eq("status", "published");

  if (category && category !== "all") {
    query = query.eq("category", category);
  }

  if (sort === "popular") {
    query = query.order("purchase_count", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, count, error } = await query.range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json(
      { error: { code: "QUERY_FAILED", message: "목록을 불러올 수 없습니다" } },
      { status: 500 },
    );
  }

  return NextResponse.json({
    listings: data || [],
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  });
}

// 리스팅 등록
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

  const { generationId, title, description, price, category, tags } = await request.json();

  if (!generationId || !title || !price) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "필수 항목을 입력해 주세요" } },
      { status: 400 },
    );
  }

  // generation 소유권 + 결제 확인
  const { data: generation } = await supabase
    .from("fm_generations")
    .select("id, user_id, is_paid")
    .eq("id", generationId)
    .single();

  if (!generation || generation.user_id !== user.id) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "권한이 없습니다" } },
      { status: 403 },
    );
  }

  if (!generation.is_paid) {
    return NextResponse.json(
      { error: { code: "NOT_PAID", message: "결제 완료된 세트만 판매할 수 있어요" } },
      { status: 400 },
    );
  }

  // 작가 프로필 활성화
  await supabase
    .from("fm_profiles")
    .update({ is_seller: true })
    .eq("id", user.id);

  // 썸네일 URL 가져오기 (첫 번째 스티커의 thumbnail)
  const { data: firstSticker } = await supabase
    .from("fm_stickers")
    .select("thumbnail_path")
    .eq("generation_id", generationId)
    .order("sort_order")
    .limit(1)
    .single();

  const thumbnailUrl = firstSticker?.thumbnail_path
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/fm-thumbnails/${firstSticker.thumbnail_path}`
    : null;

  const { data: listing, error } = await supabase
    .from("fm_marketplace_listings")
    .insert({
      seller_id: user.id,
      generation_id: generationId,
      title,
      description: description || null,
      price: Math.max(1000, price),
      category: category || "general",
      tags: tags || [],
      thumbnail_url: thumbnailUrl,
      status: "published",
      published_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Create listing error:", error);
    return NextResponse.json(
      { error: { code: "CREATE_FAILED", message: "등록에 실패했습니다" } },
      { status: 500 },
    );
  }

  return NextResponse.json(listing);
}
