import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// 내 구독 조회
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

  const { data: subscription } = await supabase
    .from("fm_subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .in("status", ["active", "past_due"])
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  return NextResponse.json({ subscription: subscription || null });
}

// 구독 생성 (빌링키 발급 후)
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

  const { plan, billingKey } = await request.json();

  if (!plan || !["basic", "pro"].includes(plan)) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "올바른 플랜을 선택해 주세요" } },
      { status: 400 },
    );
  }

  // 기존 활성 구독 확인
  const { data: existing } = await supabase
    .from("fm_subscriptions")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .single();

  if (existing) {
    return NextResponse.json(
      { error: { code: "ALREADY_SUBSCRIBED", message: "이미 구독 중이에요" } },
      { status: 400 },
    );
  }

  const amount = plan === "basic" ? 9900 : 19900;
  const credits = plan === "basic" ? 10 : 0; // pro는 무제한 (0으로 표시)
  const periodEnd = new Date();
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  const { data: subscription, error } = await supabase
    .from("fm_subscriptions")
    .insert({
      user_id: user.id,
      plan,
      status: "active",
      billing_key: billingKey || null,
      amount,
      credits_total: credits,
      credits_used: 0,
      current_period_start: new Date().toISOString(),
      current_period_end: periodEnd.toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Subscription create error:", error);
    return NextResponse.json(
      { error: { code: "CREATE_FAILED", message: "구독 생성에 실패했습니다" } },
      { status: 500 },
    );
  }

  // 프로필 구독 타입 업데이트
  await supabase
    .from("fm_profiles")
    .update({ subscription_type: plan })
    .eq("id", user.id);

  // 이벤트 기록
  await supabase.from("fm_subscription_events").insert({
    subscription_id: subscription.id,
    event_type: "created",
    plan,
    amount,
  });

  return NextResponse.json(subscription);
}

// 구독 해지
export async function DELETE() {
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

  const { data: subscription } = await supabase
    .from("fm_subscriptions")
    .select("id, plan")
    .eq("user_id", user.id)
    .eq("status", "active")
    .single();

  if (!subscription) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "활성 구독이 없어요" } },
      { status: 404 },
    );
  }

  // 즉시 해지가 아닌 기간 만료 해지
  await supabase
    .from("fm_subscriptions")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
    })
    .eq("id", subscription.id);

  await supabase
    .from("fm_profiles")
    .update({ subscription_type: "free" })
    .eq("id", user.id);

  await supabase.from("fm_subscription_events").insert({
    subscription_id: subscription.id,
    event_type: "cancelled",
    plan: subscription.plan,
  });

  return NextResponse.json({ success: true });
}
