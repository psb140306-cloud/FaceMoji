import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// 관리자 분석 대시보드 데이터
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

  // TODO: 관리자 권한 체크 (현재는 로그인 사용자 모두 접근 가능 — MVP)

  // 전체 사용자 수
  const { count: userCount } = await supabase
    .from("fm_profiles")
    .select("id", { count: "exact", head: true });

  // 전체 생성 수
  const { count: generationCount } = await supabase
    .from("fm_generations")
    .select("id", { count: "exact", head: true });

  // 결제 완료 수 + 총 매출
  const { data: payments } = await supabase
    .from("fm_payments")
    .select("amount")
    .eq("status", "completed");

  const totalRevenue = (payments || []).reduce((sum, p) => sum + p.amount, 0);
  const paidCount = (payments || []).length;

  // 활성 구독자 수
  const { count: subscriberCount } = await supabase
    .from("fm_subscriptions")
    .select("id", { count: "exact", head: true })
    .eq("status", "active");

  // 마켓플레이스 통계
  const { count: listingCount } = await supabase
    .from("fm_marketplace_listings")
    .select("id", { count: "exact", head: true })
    .eq("status", "published");

  const { data: purchases } = await supabase
    .from("fm_marketplace_purchases")
    .select("amount, platform_fee")
    .eq("status", "completed");

  const marketplaceRevenue = (purchases || []).reduce((sum, p) => sum + p.platform_fee, 0);

  // 최근 7일 일별 생성 수
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: recentGenerations } = await supabase
    .from("fm_generations")
    .select("created_at")
    .gte("created_at", sevenDaysAgo.toISOString())
    .order("created_at");

  const dailyGenerations: Record<string, number> = {};
  for (const g of recentGenerations || []) {
    const day = g.created_at.slice(0, 10);
    dailyGenerations[day] = (dailyGenerations[day] || 0) + 1;
  }

  // 전환율: 생성 대비 결제
  const conversionRate =
    generationCount && generationCount > 0
      ? ((paidCount / generationCount) * 100).toFixed(1)
      : "0";

  // 스타일별 인기도
  const { data: styleStats } = await supabase
    .from("fm_generations")
    .select("style")
    .eq("status", "completed");

  const styleCounts: Record<string, number> = {};
  for (const g of styleStats || []) {
    styleCounts[g.style] = (styleCounts[g.style] || 0) + 1;
  }

  return NextResponse.json({
    overview: {
      userCount: userCount || 0,
      generationCount: generationCount || 0,
      paidCount,
      totalRevenue,
      subscriberCount: subscriberCount || 0,
      conversionRate,
    },
    marketplace: {
      listingCount: listingCount || 0,
      purchaseCount: (purchases || []).length,
      platformRevenue: marketplaceRevenue,
    },
    dailyGenerations,
    styleCounts,
  });
}
