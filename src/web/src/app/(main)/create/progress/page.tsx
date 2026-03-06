"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { useCreateStore } from "@/stores/create-store";
import { EXPRESSIONS } from "@/lib/utils/constants";

const FUN_FACTS = [
  "OGQ 마켓에서 이모티콘을 판매하면 수익을 얻을 수 있어요!",
  "24개 표정 이모티콘이 한 세트로 구성됩니다.",
  "AI가 당신의 얼굴 특징을 분석하고 있어요.",
  "이모티콘 하나당 평균 2~3초면 생성돼요.",
  "완성된 이모티콘은 740x640px OGQ 규격에 맞춰져요.",
];

export default function ProgressPage() {
  const router = useRouter();
  const { uploadedImage, selectedStyle } = useCreateStore();
  const [progress, setProgress] = useState(0);
  const [factIndex, setFactIndex] = useState(0);
  const [completedEmojis, setCompletedEmojis] = useState<number[]>([]);

  // 사진/스타일 없이 직접 접근 방지
  useEffect(() => {
    if (!uploadedImage || !selectedStyle) {
      router.push("/create");
    }
  }, [uploadedImage, selectedStyle, router]);

  // 시뮬레이션 (실제 API 연결 전)
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          // 실제로는 generationId로 이동
          setTimeout(() => router.push("/create/demo-result"), 500);
          return 100;
        }
        const next = prev + Math.random() * 5 + 1;
        const completed = Math.floor((Math.min(next, 100) / 100) * 24);
        setCompletedEmojis(Array.from({ length: completed }, (_, i) => i));
        return Math.min(next, 100);
      });
    }, 800);

    const factInterval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % FUN_FACTS.length);
    }, 5000);

    return () => {
      clearInterval(interval);
      clearInterval(factInterval);
    };
  }, [router]);

  if (!uploadedImage || !selectedStyle) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="flex flex-col items-center gap-8 text-center">
        {/* 애니메이션 영역 */}
        <div className="flex h-32 w-32 items-center justify-center rounded-full bg-primary/10 text-6xl">
          {EXPRESSIONS[completedEmojis.length % EXPRESSIONS.length]?.emoji ?? "🎨"}
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">이모티콘을 만들고 있어요</h1>
          <p className="text-muted-foreground">잠시만 기다려 주세요. 약 1~3분 소요됩니다.</p>
        </div>

        {/* 프로그레스 */}
        <div className="w-full max-w-sm space-y-2">
          <Progress value={progress} className="h-3" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{completedEmojis.length}/24개 완성</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        {/* 미니 그리드 */}
        <div className="grid grid-cols-8 gap-1.5">
          {EXPRESSIONS.map((expr, i) => (
            <div
              key={expr.key}
              className={`flex h-10 w-10 items-center justify-center rounded-lg text-lg transition-all ${
                completedEmojis.includes(i)
                  ? "scale-100 bg-primary/10 opacity-100"
                  : "scale-90 bg-muted opacity-30"
              }`}
            >
              {expr.emoji}
            </div>
          ))}
        </div>

        {/* 재미 요소 */}
        <div className="rounded-xl bg-muted/50 px-6 py-3">
          <p className="text-sm text-muted-foreground">{FUN_FACTS[factIndex]}</p>
        </div>
      </div>
    </div>
  );
}
