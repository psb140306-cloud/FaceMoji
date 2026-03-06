"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";

const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || "";

export default function PaymentPage() {
  const params = useParams<{ generationId: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const paymentWidgetRef = useRef<Awaited<
    ReturnType<Awaited<ReturnType<typeof loadTossPayments>>["widgets"]>
  > | null>(null);
  const [orderInfo, setOrderInfo] = useState<{
    orderId: string;
    amount: number;
    orderName: string;
  } | null>(null);

  useEffect(() => {
    async function init() {
      try {
        // 1. 결제 요청 (주문 생성)
        const res = await fetch("/api/payments/request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ generationId: params.generationId }),
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.error?.message || "결제 준비에 실패했습니다");
          setLoading(false);
          return;
        }

        const order = await res.json();
        setOrderInfo(order);

        // 2. Toss Payments 위젯 초기화
        const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY);
        const widgets = tossPayments.widgets({ customerKey: "ANONYMOUS" });

        await widgets.setAmount({
          currency: "KRW",
          value: order.amount,
        });

        await Promise.all([
          widgets.renderPaymentMethods({
            selector: "#payment-method",
            variantKey: "DEFAULT",
          }),
          widgets.renderAgreement({
            selector: "#payment-agreement",
            variantKey: "AGREEMENT",
          }),
        ]);

        paymentWidgetRef.current = widgets;
        setLoading(false);
      } catch (err) {
        console.error("Payment init error:", err);
        setError("결제 위젯을 불러오는데 실패했습니다");
        setLoading(false);
      }
    }

    init();
  }, [params.generationId]);

  const handlePayment = async () => {
    if (!paymentWidgetRef.current || !orderInfo) return;

    try {
      await paymentWidgetRef.current.requestPayment({
        orderId: orderInfo.orderId,
        orderName: orderInfo.orderName,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
      });
    } catch (err) {
      // 사용자가 결제 취소한 경우
      console.log("Payment cancelled or failed:", err);
    }
  };

  if (error) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-lg font-medium text-destructive">{error}</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          돌아가기
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          aria-label="이전 페이지로"
          className="flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          이전으로
        </button>
      </div>

      <h1 className="mb-2 text-2xl font-bold">결제하기</h1>
      <p className="mb-6 text-muted-foreground">
        결제 완료 후 고해상도 이모티콘 파일을 다운로드할 수 있어요.
      </p>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* 좌: 주문 요약 */}
        <div className="lg:w-[360px] lg:shrink-0">
          {orderInfo && (
            <div className="rounded-xl border bg-muted/30 p-4 lg:sticky lg:top-20">
              <h2 className="mb-3 text-sm font-bold">주문 요약</h2>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">상품</span>
                <span className="font-medium">{orderInfo.orderName}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">구성</span>
                <span className="font-medium">24개 이모티콘 세트</span>
              </div>
              <div className="mt-3 border-t pt-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">결제 금액</span>
                  <span className="text-xl font-bold text-primary">
                    {orderInfo.amount.toLocaleString()}원
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 우: 결제 위젯 */}
        <div className="min-w-0 flex-1">
          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          <div id="payment-method" className="mb-4" />
          <div id="payment-agreement" className="mb-6" />

          {!loading && (
            <>
              <Button size="lg" className="w-full text-base font-semibold" onClick={handlePayment}>
                {orderInfo?.amount.toLocaleString()}원 결제하기
              </Button>

              <div className="mt-4 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>토스페이먼츠 안전결제</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
