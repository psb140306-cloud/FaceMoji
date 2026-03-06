"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Download, Edit3, Loader2, Receipt } from "lucide-react";
import Link from "next/link";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [confirming, setConfirming] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    generationId: string;
    receiptUrl: string | null;
  } | null>(null);

  useEffect(() => {
    async function confirmPayment() {
      const paymentKey = searchParams.get("paymentKey");
      const orderId = searchParams.get("orderId");
      const amount = searchParams.get("amount");

      if (!paymentKey || !orderId || !amount) {
        setError("결제 정보가 올바르지 않습니다");
        setConfirming(false);
        return;
      }

      try {
        const res = await fetch("/api/payments/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentKey,
            orderId,
            amount: Number(amount),
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error?.message || "결제 승인에 실패했습니다");
          setConfirming(false);
          return;
        }

        setResult({
          generationId: data.generationId,
          receiptUrl: data.receiptUrl,
        });
        setConfirming(false);
      } catch {
        setError("결제 승인 중 오류가 발생했습니다");
        setConfirming(false);
      }
    }

    confirmPayment();
  }, [searchParams]);

  if (confirming) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-24">
        <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
        <p className="text-lg font-medium">결제를 확인하고 있어요...</p>
        <p className="mt-1 text-sm text-muted-foreground">잠시만 기다려 주세요</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-24">
        <div className="mb-4 rounded-full bg-destructive/10 p-4">
          <span className="text-4xl">!</span>
        </div>
        <h1 className="text-xl font-bold">결제 승인 실패</h1>
        <p className="mt-2 text-muted-foreground">{error}</p>
        <Button variant="outline" className="mt-6" onClick={() => router.push("/my")}>
          마이페이지로
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center px-4 py-24">
      <CheckCircle2 className="mb-4 h-16 w-16 text-green-500" />
      <h1 className="text-2xl font-bold">결제 완료!</h1>
      <p className="mt-2 text-center text-muted-foreground">
        이모티콘 세트를 다운로드할 수 있어요.
        <br />
        마이페이지에서 언제든 다시 받을 수 있습니다.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button
          size="lg"
          onClick={() => router.push(`/my?download=${result?.generationId}`)}
        >
          <Download className="mr-2 h-4 w-4" />
          다운로드하기
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => router.push(`/edit/${result?.generationId}`)}
        >
          <Edit3 className="mr-2 h-4 w-4" />
          텍스트 편집하기
        </Button>
        {result?.receiptUrl && (
          <Button variant="outline" size="lg" asChild>
            <Link href={result.receiptUrl} target="_blank">
              <Receipt className="mr-2 h-4 w-4" />
              영수증 보기
            </Link>
          </Button>
        )}
      </div>

      <Button
        variant="link"
        className="mt-4 text-muted-foreground"
        onClick={() => router.push("/create")}
      >
        새 이모티콘 만들기
      </Button>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
