"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  DollarSign,
  Loader2,
  Palette,
  ShoppingCart,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

interface DashboardData {
  overview: {
    userCount: number;
    generationCount: number;
    paidCount: number;
    totalRevenue: number;
    subscriberCount: number;
    conversionRate: string;
  };
  marketplace: {
    listingCount: number;
    purchaseCount: number;
    platformRevenue: number;
  };
  dailyGenerations: Record<string, number>;
  styleCounts: Record<string, number>;
}

const STYLE_LABELS: Record<string, string> = {
  cartoon: "카툰",
  flat: "플랫",
  anime: "애니메",
  watercolor: "수채화",
  "3d": "3D",
  manga: "만화",
};

export default function AnalyticsDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/analytics/dashboard");
        if (res.ok) setData(await res.json());
      } catch {
        // ignore
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-16 text-center text-muted-foreground">데이터를 불러올 수 없습니다</div>
    );
  }

  const { overview, marketplace, dailyGenerations, styleCounts } = data;
  const days = Object.keys(dailyGenerations).sort();
  const maxDaily = Math.max(...Object.values(dailyGenerations), 1);

  const styleEntries = Object.entries(styleCounts).sort((a, b) => b[1] - a[1]);
  const maxStyle = Math.max(...Object.values(styleCounts), 1);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">분석 대시보드</h1>

      {/* 핵심 지표 */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/30">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">총 사용자</p>
              <p className="text-2xl font-bold">{overview.userCount.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/30">
              <Zap className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">총 생성</p>
              <p className="text-2xl font-bold">{overview.generationCount.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900/30">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">총 매출</p>
              <p className="text-2xl font-bold">{overview.totalRevenue.toLocaleString()}원</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-lg bg-orange-100 p-3 dark:bg-orange-900/30">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">전환율 (생성→결제)</p>
              <p className="text-2xl font-bold">{overview.conversionRate}%</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-lg bg-pink-100 p-3 dark:bg-pink-900/30">
              <ShoppingCart className="h-6 w-6 text-pink-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">활성 구독자</p>
              <p className="text-2xl font-bold">{overview.subscriberCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-lg bg-yellow-100 p-3 dark:bg-yellow-900/30">
              <ShoppingCart className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">마켓플레이스 수수료</p>
              <p className="text-2xl font-bold">{marketplace.platformRevenue.toLocaleString()}원</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 일별 생성 추이 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5" />
              일별 생성 추이 (최근 7일)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {days.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">아직 데이터가 없어요</p>
            ) : (
              <div className="flex items-end gap-2" style={{ height: 160 }}>
                {days.map((day) => {
                  const count = dailyGenerations[day] || 0;
                  const height = Math.max((count / maxDaily) * 140, 4);
                  return (
                    <div key={day} className="flex flex-1 flex-col items-center gap-1">
                      <span className="text-xs font-medium">{count}</span>
                      <div
                        className="w-full rounded-t bg-primary transition-all"
                        style={{ height }}
                      />
                      <span className="text-xs text-muted-foreground">{day.slice(5)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 스타일별 인기도 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Palette className="h-5 w-5" />
              스타일별 인기도
            </CardTitle>
          </CardHeader>
          <CardContent>
            {styleEntries.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">아직 데이터가 없어요</p>
            ) : (
              <div className="space-y-3">
                {styleEntries.map(([style, count]) => (
                  <div key={style} className="flex items-center gap-3">
                    <span className="w-16 text-sm font-medium">
                      {STYLE_LABELS[style] || style}
                    </span>
                    <div className="flex-1">
                      <div
                        className="h-6 rounded bg-primary/80 transition-all"
                        style={{ width: `${(count / maxStyle) * 100}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-sm text-muted-foreground">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* MVP 성공 기준 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">MVP 성공 기준 달성 현황</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <MetricRow
              label="유료 결제 50건 이상"
              current={overview.paidCount}
              target={50}
              unit="건"
            />
            <MetricRow
              label="결제 전환율 20% 이상"
              current={parseFloat(overview.conversionRate)}
              target={20}
              unit="%"
            />
            <MetricRow
              label="마켓플레이스 거래 발생"
              current={marketplace.purchaseCount}
              target={1}
              unit="건"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricRow({
  label,
  current,
  target,
  unit,
}: {
  label: string;
  current: number;
  target: number;
  unit: string;
}) {
  const achieved = current >= target;
  const progress = Math.min((current / target) * 100, 100);

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-sm">{label}</span>
        <span className={`text-sm font-bold ${achieved ? "text-green-600" : "text-muted-foreground"}`}>
          {current.toLocaleString()}/{target.toLocaleString()}
          {unit} {achieved ? "달성" : ""}
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted">
        <div
          className={`h-2 rounded-full transition-all ${achieved ? "bg-green-500" : "bg-primary"}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
