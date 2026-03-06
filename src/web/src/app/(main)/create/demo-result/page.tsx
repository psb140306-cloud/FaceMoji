"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EXPRESSIONS } from "@/lib/utils/constants";
import { Download, ShoppingCart } from "lucide-react";
import { useCreateStore } from "@/stores/create-store";

export default function DemoResultPage() {
  const router = useRouter();
  const { generationId, reset } = useCreateStore();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold">이모티콘이 완성되었어요!</h1>
        <p className="mt-2 text-muted-foreground">
          미리보기입니다. 결제 후 고해상도 파일을 다운로드할 수 있어요.
        </p>
      </div>

      {/* 이모티콘 그리드 */}
      <div className="grid grid-cols-4 gap-3 md:grid-cols-6">
        {EXPRESSIONS.map((expr) => (
          <div
            key={expr.key}
            className="group relative flex aspect-[740/640] cursor-pointer flex-col items-center justify-center rounded-xl bg-muted/50 transition-all hover:bg-muted hover:shadow-sm"
          >
            {/* 워터마크 오버레이 표시 */}
            <span className="text-3xl md:text-4xl">{expr.emoji}</span>
            <span className="mt-1 text-xs text-muted-foreground">{expr.label}</span>
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/5 opacity-0 transition-opacity group-hover:opacity-100">
              <span className="text-xs font-medium text-muted-foreground">미리보기</span>
            </div>
          </div>
        ))}
      </div>

      {/* Sticky Bottom CTA */}
      <div className="sticky bottom-0 mt-8 border-t bg-white/90 px-4 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-lg flex-col gap-3 sm:flex-row">
          <Button
            size="lg"
            className="flex-1 text-base font-semibold"
            onClick={() => {
              if (generationId) {
                router.push(`/payment/${generationId}`);
              }
            }}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            다운로드 3,000원
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              reset();
              router.push("/create");
            }}
          >
            새로 만들기
          </Button>
        </div>
      </div>
    </div>
  );
}
