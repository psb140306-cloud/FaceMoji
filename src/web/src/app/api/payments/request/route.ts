import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PRICING } from "@/lib/utils/constants";

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

  const { generationId } = await request.json();

  if (!generationId) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "generation ID가 필요합니다" } },
      { status: 400 },
    );
  }

  // generation 소유권 & 상태 확인
  const { data: generation, error: genError } = await supabase
    .from("fm_generations")
    .select("id, user_id, status, is_paid, style")
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

  if (generation.is_paid) {
    return NextResponse.json(
      { error: { code: "ALREADY_PAID", message: "이미 결제된 이모티콘이에요" } },
      { status: 400 },
    );
  }

  if (generation.status !== "completed") {
    return NextResponse.json(
      { error: { code: "NOT_COMPLETED", message: "이모티콘 생성이 완료되지 않았어요" } },
      { status: 400 },
    );
  }

  // 주문 ID 생성 (Toss 규격: 영문+숫자+하이픈, 6~64자)
  const orderId = `FM-${generationId.slice(0, 8)}-${Date.now()}`;
  const amount = PRICING.basic;

  try {
    // fm_payments에 pending 레코드 생성
    const { data: payment, error: payError } = await supabase
      .from("fm_payments")
      .insert({
        user_id: user.id,
        generation_id: generationId,
        payment_type: "generation",
        amount,
        toss_order_id: orderId,
        status: "pending",
      })
      .select()
      .single();

    if (payError) throw payError;

    return NextResponse.json({
      orderId,
      amount,
      orderName: "FaceMoji 이모티콘 세트",
      paymentId: payment.id,
    });
  } catch (error) {
    console.error("Payment request error:", error);
    return NextResponse.json(
      { error: { code: "PAYMENT_FAILED", message: "결제 준비에 실패했습니다" } },
      { status: 500 },
    );
  }
}
