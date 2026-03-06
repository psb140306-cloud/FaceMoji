"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Store, TrendingUp, Clock, Loader2 } from "lucide-react";
import Link from "next/link";

interface ListingItem {
  id: string;
  title: string;
  price: number;
  category: string;
  thumbnail_url: string | null;
  purchase_count: number;
  view_count: number;
  created_at: string;
  fm_profiles: { display_name: string | null; avatar_url: string | null } | null;
}

const CATEGORIES = [
  { key: "all", label: "전체" },
  { key: "general", label: "일반" },
  { key: "cute", label: "귀여운" },
  { key: "funny", label: "웃긴" },
  { key: "cool", label: "멋진" },
  { key: "office", label: "직장인" },
];

function MarketplaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const category = searchParams.get("category") || "all";
  const sort = searchParams.get("sort") || "latest";

  useEffect(() => {
    async function load() {
      setLoading(true);
      const params = new URLSearchParams({ category, sort, page: String(page) });
      const res = await fetch(`/api/marketplace/listings?${params}`);
      if (res.ok) {
        const data = await res.json();
        setListings(data.listings);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
      setLoading(false);
    }
    load();
  }, [category, sort, page]);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    params.delete("page");
    router.push(`/marketplace?${params}`);
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Store className="h-6 w-6" />
            마켓플레이스
          </h1>
          <p className="mt-1 text-muted-foreground">
            다른 사용자가 만든 이모티콘을 구매하세요
          </p>
        </div>
        <Button asChild>
          <Link href="/marketplace/sell">내 이모티콘 판매하기</Link>
        </Button>
      </div>

      {/* 필터 */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex gap-2 overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => updateFilter("category", cat.key)}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm transition-colors ${
                category === cat.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => updateFilter("sort", "latest")}
            className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm ${
              sort === "latest" ? "bg-muted font-medium" : "hover:bg-muted/50"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            최신
          </button>
          <button
            onClick={() => updateFilter("sort", "popular")}
            className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm ${
              sort === "popular" ? "bg-muted font-medium" : "hover:bg-muted/50"
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            인기
          </button>
        </div>
      </div>

      {/* 리스팅 그리드 */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : listings.length === 0 ? (
        <div className="py-16 text-center">
          <Store className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-lg font-medium">아직 등록된 상품이 없어요</p>
          <p className="mt-1 text-sm text-muted-foreground">
            첫 번째 이모티콘을 판매해 보세요!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {listings.map((listing) => (
            <Link
              key={listing.id}
              href={`/marketplace/${listing.id}`}
              className="group overflow-hidden rounded-xl border transition-shadow hover:shadow-md"
            >
              <div className="aspect-square bg-muted">
                {listing.thumbnail_url ? (
                  <img
                    src={listing.thumbnail_url}
                    alt={listing.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-4xl">
                    <span>&#x1F600;</span>
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="truncate text-sm font-medium">{listing.title}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {listing.fm_profiles?.display_name || "작가"}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-bold text-primary">
                    {listing.price.toLocaleString()}원
                  </span>
                  {listing.purchase_count > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {listing.purchase_count}건 판매
                    </Badge>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`h-8 w-8 rounded-lg text-sm ${
                p === page ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <MarketplaceContent />
    </Suspense>
  );
}
