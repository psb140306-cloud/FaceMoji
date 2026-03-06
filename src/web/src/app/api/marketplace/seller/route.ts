import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// 작가 수익 대시보드 데이터
export async function GET() {
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

  // 프로필 (작가 정보)
  const { data: profile } = await supabase
    .from("fm_profiles")
    .select("display_name, avatar_url, is_seller, total_sales, total_revenue")
    .eq("id", user.id)
    .single();

  if (!profile?.is_seller) {
    return NextResponse.json(
      { error: { code: "NOT_SELLER", message: "작가 등록이 필요합니다" } },
      { status: 403 },
    );
  }

  // 내 리스팅 목록
  const { data: listings } = await supabase
    .from("fm_marketplace_listings")
    .select("id, title, price, status, view_count, purchase_count, created_at, thumbnail_url")
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  // 내 판매 내역 (최근 50건)
  const { data: sales } = await supabase
    .from("fm_marketplace_purchases")
    .select("id, amount, seller_revenue, platform_fee, status, created_at, listing_id, fm_marketplace_listings!listing_id(title)")
    .eq("fm_marketplace_listings.seller_id", user.id)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(50);

  // 판매 내역을 listing의 seller_id로 필터 (join 기반)
  // Supabase에서 foreign table 필터가 안 될 수 있으므로 listing ids로 재조회
  const listingIds = (listings || []).map((l) => l.id);

  const { data: salesByListings } = listingIds.length > 0
    ? await supabase
        .from("fm_marketplace_purchases")
        .select("id, amount, seller_revenue, platform_fee, status, created_at, listing_id")
        .in("listing_id", listingIds)
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(50)
    : { data: [] };

  // 통계 계산
  const totalRevenue = (salesByListings || []).reduce((sum, s) => sum + s.seller_revenue, 0);
  const totalSales = (salesByListings || []).length;
  const totalViews = (listings || []).reduce((sum, l) => sum + l.view_count, 0);

  // 월별 수익 (최근 6개월)
  const monthlyRevenue: Record<string, number> = {};
  for (const sale of salesByListings || []) {
    const month = sale.created_at.slice(0, 7); // YYYY-MM
    monthlyRevenue[month] = (monthlyRevenue[month] || 0) + sale.seller_revenue;
  }

  return NextResponse.json({
    profile: {
      displayName: profile.display_name,
      avatarUrl: profile.avatar_url,
    },
    stats: {
      totalRevenue,
      totalSales,
      totalViews,
      listingCount: (listings || []).length,
      conversionRate: totalViews > 0 ? ((totalSales / totalViews) * 100).toFixed(1) : "0",
    },
    listings: listings || [],
    recentSales: salesByListings || [],
    monthlyRevenue,
  });
}
