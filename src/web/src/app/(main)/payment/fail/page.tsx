"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";

export default function PaymentFailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("code") || "UNKNOWN";
  const errorMessage = searchParams.get("message") || "결제에 실패했습니다";
  const orderId = searchParams.get("orderId");

  // orderId에서 generationId 추출 (FM-{genId8}-{timestamp})
  const generationId = orderId?.split("-")[1] || null;

  return (
    <div className="flex flex-col items-center justify-center px-4 py-24">
      <XCircle className="mb-4 h-16 w-16 text-destructive" />
      <h1 className="text-2xl font-bold">결제 실패</h1>
      <p className="mt-2 text-center text-muted-foreground">{errorMessage}</p>
      <p className="mt-1 text-xs text-muted-foreground">오류 코드: {errorCode}</p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        {generationId && (
          <Button
            size="lg"
            onClick={() => router.push(`/payment/${generationId}`)}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            다시 결제하기
          </Button>
        )}
        <Button variant="outline" size="lg" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          돌아가기
        </Button>
      </div>
    </div>
  );
}
