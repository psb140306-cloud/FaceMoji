import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const PLATFORM_FEE_RATE = 0.25;

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

  const { listingId, paymentKey, orderId, amount } = await request.json();

  if (!listingId) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "리스팅 ID가 필요합니다" } },
      { status: 400 },
    );
  }

  // 리스팅 확인
  const { data: listing } = await supabase
    .from("fm_marketplace_listings")
    .select("id, seller_id, price, status, generation_id, purchase_count")
    .eq("id", listingId)
    .single();

  if (!listing || listing.status !== "published") {
    return NextResponse.json(
      { error: { code: "NOT_AVAILABLE", message: "구매할 수 없는 상품입니다" } },
      { status: 400 },
    );
  }

  if (listing.seller_id === user.id) {
    return NextResponse.json(
      { error: { code: "SELF_PURCHASE", message: "본인 상품은 구매할 수 없어요" } },
      { status: 400 },
    );
  }

  // 이미 구매했는지 확인
  const { data: existingPurchase } = await supabase
    .from("fm_marketplace_purchases")
    .select("id")
    .eq("buyer_id", user.id)
    .eq("listing_id", listingId)
    .eq("status", "completed")
    .single();

  if (existingPurchase) {
    return NextResponse.json(
      { error: { code: "ALREADY_PURCHASED", message: "이미 구매한 상품이에요" } },
      { status: 400 },
    );
  }

  const platformFee = Math.round(listing.price * PLATFORM_FEE_RATE);
  const sellerRevenue = listing.price - platformFee;

  // 결제 처리 (Toss 승인)
  if (paymentKey && orderId && amount) {
    const tossResponse = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(process.env.TOSS_SECRET_KEY + ":").toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    });

    if (!tossResponse.ok) {
      return NextResponse.json(
        { error: { code: "PAYMENT_FAILED", message: "결제 승인에 실패했습니다" } },
        { status: 400 },
      );
    }
  }

  // 구매 레코드 생성
  const { data: purchase, error } = await supabase
    .from("fm_marketplace_purchases")
    .insert({
      buyer_id: user.id,
      listing_id: listingId,
      amount: listing.price,
      seller_revenue: sellerRevenue,
      platform_fee: platformFee,
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Purchase error:", error);
    return NextResponse.json(
      { error: { code: "PURCHASE_FAILED", message: "구매 처리에 실패했습니다" } },
      { status: 500 },
    );
  }

  // 판매 카운트 증가 + 작가 수익 업데이트
  await supabase.rpc("increment_listing_purchases", { listing_id: listingId });

  // 작가 수익 업데이트 (직접 쿼리)
  await supabase
    .from("fm_profiles")
    .update({
      total_sales: listing.purchase_count + 1,
      total_revenue: sellerRevenue,
    })
    .eq("id", listing.seller_id);

  return NextResponse.json({
    purchaseId: purchase.id,
    generationId: listing.generation_id,
  });
}
