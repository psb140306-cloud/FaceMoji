"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  DollarSign,
  Eye,
  Package,
  ShoppingCart,
  TrendingUp,
  ArrowLeft,
  Loader2,
} from "lucide-react";

interface SellerDashboardData {
  profile: { displayName: string | null; avatarUrl: string | null };
  stats: {
    totalRevenue: number;
    totalSales: number;
    totalViews: number;
    listingCount: number;
    conversionRate: string;
  };
  listings: Array<{
    id: string;
    title: string;
    price: number;
    status: string;
    view_count: number;
    purchase_count: number;
    created_at: string;
    thumbnail_url: string | null;
  }>;
  recentSales: Array<{
    id: string;
    amount: number;
    seller_revenue: number;
    platform_fee: number;
    created_at: string;
    listing_id: string;
  }>;
  monthlyRevenue: Record<string, number>;
}

export default function SellerDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<SellerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/marketplace/seller");
        if (!res.ok) {
          const err = await res.json();
          setError(err.error?.message || "데이터를 불러올 수 없습니다");
          return;
        }
        setData(await res.json());
      } catch {
        setError("네트워크 오류가 발생했습니다");
      } finally {
        setLoading(false);
      }
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

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">{error}</h1>
        <p className="mt-2 text-muted-foreground">
          마켓플레이스에 상품을 등록하면 작가 대시보드를 이용할 수 있어요.
        </p>
        <Button className="mt-4" onClick={() => router.push("/marketplace/sell")}>
          판매 등록하기
        </Button>
      </div>
    );
  }

  if (!data) return null;

  const { stats, listings, recentSales, monthlyRevenue } = data;

  // 월별 수익 차트 데이터 (최근 6개월)
  const months = Object.keys(monthlyRevenue).sort().slice(-6);
  const maxRevenue = Math.max(...Object.values(monthlyRevenue), 1);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/marketplace")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">작가 대시보드</h1>
            <p className="text-sm text-muted-foreground">
              {data.profile.displayName || "작가"}님의 판매 현황
            </p>
          </div>
        </div>
        <Button onClick={() => router.push("/marketplace/sell")}>새 상품 등록</Button>
      </div>

      {/* 통계 카드 */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900/30">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">총 수익</p>
              <p className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()}원</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/30">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">총 판매</p>
              <p className="text-2xl font-bold">{stats.totalSales}건</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/30">
              <Eye className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">총 조회수</p>
              <p className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-lg bg-orange-100 p-3 dark:bg-orange-900/30">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">전환율</p>
              <p className="text-2xl font-bold">{stats.conversionRate}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 월별 수익 차트 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5" />
              월별 수익
            </CardTitle>
          </CardHeader>
          <CardContent>
            {months.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">아직 판매 내역이 없어요</p>
            ) : (
              <div className="flex items-end gap-2" style={{ height: 160 }}>
                {months.map((month) => {
                  const revenue = monthlyRevenue[month] || 0;
                  const height = Math.max((revenue / maxRevenue) * 140, 4);
                  return (
                    <div key={month} className="flex flex-1 flex-col items-center gap-1">
                      <span className="text-xs font-medium">
                        {revenue > 0 ? `${(revenue / 1000).toFixed(0)}k` : "0"}
                      </span>
                      <div
                        className="w-full rounded-t bg-primary transition-all"
                        style={{ height }}
                      />
                      <span className="text-xs text-muted-foreground">{month.slice(5)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 최근 판매 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShoppingCart className="h-5 w-5" />
              최근 판매
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentSales.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">아직 판매 내역이 없어요</p>
            ) : (
              <div className="space-y-3">
                {recentSales.slice(0, 10).map((sale) => {
                  const listing = listings.find((l) => l.id === sale.listing_id);
                  return (
                    <div key={sale.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="text-sm font-medium">{listing?.title || "삭제된 상품"}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(sale.created_at).toLocaleDateString("ko-KR")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-600">
                          +{sale.seller_revenue.toLocaleString()}원
                        </p>
                        <p className="text-xs text-muted-foreground">
                          수수료 {sale.platform_fee.toLocaleString()}원
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 내 상품 목록 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Package className="h-5 w-5" />
            내 상품 ({listings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {listings.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">등록된 상품이 없습니다</p>
              <Button className="mt-3" variant="outline" onClick={() => router.push("/marketplace/sell")}>
                첫 상품 등록하기
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  className="flex items-center gap-4 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  {listing.thumbnail_url ? (
                    <img
                      src={listing.thumbnail_url}
                      alt={listing.title}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-xl">
                      🎨
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{listing.title}</p>
                      <Badge variant={listing.status === "published" ? "default" : "secondary"}>
                        {listing.status === "published" ? "판매중" : listing.status === "hidden" ? "숨김" : listing.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {listing.price.toLocaleString()}원 · 조회 {listing.view_count} · 판매 {listing.purchase_count}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/marketplace/${listing.id}`)}
                  >
                    보기
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
