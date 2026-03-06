"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SUBSCRIPTION_PLANS, PRICING } from "@/lib/utils/constants";
import { Check, Crown, Loader2, Sparkles, Zap } from "lucide-react";
import type { Subscription } from "@/types/database";

export default function PricingPage() {
  const router = useRouter();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/subscriptions");
        if (res.ok) {
          const data = await res.json();
          setSubscription(data.subscription);
        }
      } catch {
        // 비로그인 상태
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleSubscribe = async (plan: string) => {
    setSubscribing(plan);
    // TODO: Toss 빌링키 발급 플로우
    // 현재는 바로 구독 생성 (테스트용)
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      if (res.ok) {
        const data = await res.json();
        setSubscription(data);
      }
    } catch {
      // 에러 처리
    }
    setSubscribing(null);
  };

  const handleCancel = async () => {
    if (!confirm("정말 구독을 해지하시겠어요? 현재 구독 기간이 끝날 때까지 이용할 수 있습니다.")) return;

    const res = await fetch("/api/subscriptions", { method: "DELETE" });
    if (res.ok) {
      setSubscription(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold">요금제</h1>
        <p className="mt-2 text-muted-foreground">
          건당 결제 또는 구독으로 더 저렴하게 이용하세요
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* 건당 결제 */}
        <div className="rounded-2xl border p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">건당 결제</h3>
            <p className="mt-1 text-sm text-muted-foreground">구독 없이 필요할 때만</p>
          </div>
          <div className="mb-6">
            <span className="text-3xl font-bold">{PRICING.basic.toLocaleString()}</span>
            <span className="text-muted-foreground">원/세트</span>
          </div>
          <ul className="mb-6 space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              기본 스타일 2종
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              24개 이모티콘 세트
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              OGQ 규격 변환
            </li>
          </ul>
          <Button variant="outline" className="w-full" onClick={() => router.push("/create")}>
            바로 만들기
          </Button>
        </div>

        {/* 구독 플랜 */}
        {SUBSCRIPTION_PLANS.map((plan) => {
          const isCurrentPlan = subscription?.plan === plan.key && subscription?.status === "active";
          const isPopular = plan.key === "pro";

          return (
            <div
              key={plan.key}
              className={`relative rounded-2xl border p-6 ${
                isPopular ? "border-primary shadow-lg" : ""
              }`}
            >
              {isPopular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Sparkles className="mr-1 h-3 w-3" />
                  인기
                </Badge>
              )}
              <div className="mb-4">
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  {plan.key === "pro" && <Crown className="h-5 w-5 text-yellow-500" />}
                  {plan.label}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {plan.key === "basic" ? "가벼운 사용자를 위한" : "무제한 크리에이터를 위한"}
                </p>
              </div>
              <div className="mb-6">
                <span className="text-3xl font-bold">{plan.price.toLocaleString()}</span>
                <span className="text-muted-foreground">원/월</span>
              </div>
              <ul className="mb-6 space-y-2 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>

              {isCurrentPlan ? (
                <div className="space-y-2">
                  <Button variant="outline" className="w-full" disabled>
                    현재 플랜
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs text-muted-foreground"
                    onClick={handleCancel}
                  >
                    구독 해지
                  </Button>
                </div>
              ) : (
                <Button
                  className="w-full"
                  variant={isPopular ? "default" : "outline"}
                  onClick={() => handleSubscribe(plan.key)}
                  disabled={!!subscribing}
                >
                  {subscribing === plan.key ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Zap className="mr-2 h-4 w-4" />
                  )}
                  구독하기
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {/* 크레딧 잔량 표시 */}
      {subscription && subscription.status === "active" && subscription.plan === "basic" && (
        <div className="mt-8 rounded-xl border bg-muted/30 p-4 text-center">
          <p className="text-sm text-muted-foreground">이번 달 잔여 크레딧</p>
          <p className="text-2xl font-bold">
            {subscription.credits_total - subscription.credits_used}
            <span className="text-sm font-normal text-muted-foreground">
              /{subscription.credits_total}세트
            </span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            구독 갱신일: {new Date(subscription.current_period_end).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
}
