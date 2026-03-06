import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendReceiptEmail } from "@/lib/email/send-receipt";

const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY || "";

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

  const { paymentKey, orderId, amount } = await request.json();

  if (!paymentKey || !orderId || !amount) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "결제 정보가 올바르지 않습니다" } },
      { status: 400 },
    );
  }

  // DB에서 해당 주문 확인
  const { data: payment, error: payError } = await supabase
    .from("fm_payments")
    .select("id, user_id, amount, generation_id, status")
    .eq("toss_order_id", orderId)
    .single();

  if (payError || !payment) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "결제 정보를 찾을 수 없어요" } },
      { status: 404 },
    );
  }

  if (payment.user_id !== user.id) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "권한이 없습니다" } },
      { status: 403 },
    );
  }

  if (payment.status !== "pending") {
    return NextResponse.json(
      { error: { code: "ALREADY_PROCESSED", message: "이미 처리된 결제입니다" } },
      { status: 400 },
    );
  }

  // 금액 검증
  if (payment.amount !== amount) {
    return NextResponse.json(
      { error: { code: "AMOUNT_MISMATCH", message: "결제 금액이 일치하지 않습니다" } },
      { status: 400 },
    );
  }

  try {
    // Toss Payments 승인 API 호출
    const tossResponse = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(TOSS_SECRET_KEY + ":").toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    });

    const tossResult = await tossResponse.json();

    if (!tossResponse.ok) {
      // Toss 승인 실패 → DB 상태 업데이트
      await supabase
        .from("fm_payments")
        .update({ status: "failed" })
        .eq("id", payment.id);

      return NextResponse.json(
        {
          error: {
            code: tossResult.code || "TOSS_ERROR",
            message: tossResult.message || "결제 승인에 실패했습니다",
          },
        },
        { status: 400 },
      );
    }

    // 결제 성공 → DB 업데이트
    const now = new Date().toISOString();
    await supabase
      .from("fm_payments")
      .update({
        status: "completed",
        toss_payment_key: paymentKey,
        payment_method: mapPaymentMethod(tossResult.method),
        receipt_url: tossResult.receipt?.url || null,
        completed_at: now,
      })
      .eq("id", payment.id);

    // generation is_paid 플래그 활성화
    // (DB trigger fm_handle_payment_completed 에서도 처리하지만 안전하게 직접도 실행)
    await supabase
      .from("fm_generations")
      .update({ is_paid: true })
      .eq("id", payment.generation_id);

    // 영수증 이메일 발송 (비동기, 실패해도 결제는 성공)
    sendReceiptEmail({
      to: user.email || "",
      orderId,
      amount,
      itemName: "이모티콘 세트",
      paymentMethod: tossResult.method || "카드",
      paidAt: now,
      receiptUrl: tossResult.receipt?.url,
    }).catch((err) => console.error("Receipt email error:", err));

    return NextResponse.json({
      success: true,
      generationId: payment.generation_id,
      receiptUrl: tossResult.receipt?.url || null,
    });
  } catch (error) {
    console.error("Payment confirm error:", error);
    await supabase
      .from("fm_payments")
      .update({ status: "failed" })
      .eq("id", payment.id);

    return NextResponse.json(
      { error: { code: "CONFIRM_FAILED", message: "결제 승인 처리 중 오류가 발생했습니다" } },
      { status: 500 },
    );
  }
}

function mapPaymentMethod(tossMethod: string): string {
  const methodMap: Record<string, string> = {
    카드: "card",
    가상계좌: "card",
    간편결제: "card",
    휴대폰: "card",
  };
  return methodMap[tossMethod] || "card";
}
