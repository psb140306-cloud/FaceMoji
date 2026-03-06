"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StepIndicator } from "@/components/create/step-indicator";
import { useCreateStore } from "@/stores/create-store";
import { STYLES, PRICING } from "@/lib/utils/constants";
import { cn } from "@/lib/utils";
import type { StyleType } from "@/types/database";

const STEPS = [{ label: "사진 업로드" }, { label: "스타일 선택" }, { label: "생성" }];

export default function StylePage() {
  const router = useRouter();
  const { selectedStyle, setSelectedStyle, uploadedImage } = useCreateStore();

  // 사진 없이 직접 접근 시
  if (!uploadedImage) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">먼저 사진을 업로드해 주세요</h1>
        <Button className="mt-4" onClick={() => router.push("/create")}>
          사진 업로드하기
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <StepIndicator steps={STEPS} currentStep={1} />

      <div className="mt-10 flex flex-col items-center gap-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">스타일을 선택하세요</h1>
          <p className="mt-2 text-muted-foreground">원하는 이모티콘 스타일을 골라주세요</p>
        </div>

        <div className="grid w-full gap-4 sm:grid-cols-2 md:grid-cols-3">
          {STYLES.map((style) => (
            <Card
              key={style.key}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                selectedStyle === style.key && "ring-2 ring-primary shadow-md",
              )}
              onClick={() => setSelectedStyle(style.key as StyleType)}
            >
              <CardContent className="flex flex-col items-center gap-3 pt-6 text-center">
                {/* 샘플 이모지 그리드 */}
                <div className="grid grid-cols-2 gap-2">
                  {["😄", "😍", "😢", "😡"].map((emoji) => (
                    <div
                      key={emoji}
                      className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted text-2xl"
                    >
                      {emoji}
                    </div>
                  ))}
                </div>
                <h3 className="text-lg font-bold">{style.label}</h3>
                <p className="text-sm text-muted-foreground">{style.description}</p>
                <Badge variant={style.premium ? "default" : "secondary"}>
                  {style.premium
                    ? `${PRICING.premium.toLocaleString()}원`
                    : `${PRICING.basic.toLocaleString()}원`}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex w-full max-w-sm gap-3">
          <Button variant="outline" className="flex-1" onClick={() => router.push("/create")}>
            이전
          </Button>
          <Button
            className="flex-1 text-base font-semibold"
            disabled={!selectedStyle}
            onClick={() => router.push("/create/progress")}
          >
            이모티콘 만들기
          </Button>
        </div>
      </div>
    </div>
  );
}
