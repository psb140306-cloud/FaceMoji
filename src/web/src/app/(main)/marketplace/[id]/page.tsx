"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Eye, Loader2, ShoppingCart, User } from "lucide-react";

interface ListingDetail {
  id: string;
  title: string;
  description: string | null;
  price: number;
  category: string;
  tags: string[];
  view_count: number;
  purchase_count: number;
  created_at: string;
  fm_profiles: { display_name: string | null; avatar_url: string | null } | null;
  thumbnails: { expression: string; url: string | null }[];
}

export default function ListingDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/marketplace/listings/${params.id}`);
      if (res.ok) {
        setListing(await res.json());
      }
      setLoading(false);
    }
    load();
  }, [params.id]);

  const handlePurchase = async () => {
    setPurchasing(true);
    // TODO: Toss 결제 연동 (마켓플레이스용)
    // 지금은 간단히 직접 구매 처리
    try {
      const res = await fetch("/api/marketplace/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: params.id }),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/my?download=${data.generationId}`);
      }
    } catch {
      // 에러 처리
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="py-24 text-center">
        <p className="text-lg font-medium">상품을 찾을 수 없어요</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/marketplace")}>
          마켓플레이스로
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        마켓플레이스
      </button>

      <div className="grid gap-8 md:grid-cols-[1fr_320px]">
        {/* 미리보기 그리드 */}
        <div>
          <div className="grid grid-cols-4 gap-2 md:grid-cols-6">
            {listing.thumbnails.map((thumb) =>
              thumb.url ? (
                <div
                  key={thumb.expression}
                  className="aspect-[740/640] overflow-hidden rounded-lg bg-muted"
                >
                  <img
                    src={thumb.url}
                    alt={thumb.expression}
                    className="h-full w-full object-contain"
                  />
                </div>
              ) : (
                <div
                  key={thumb.expression}
                  className="flex aspect-[740/640] items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground"
                >
                  {thumb.expression}
                </div>
              ),
            )}
          </div>
        </div>

        {/* 상품 정보 */}
        <div className="space-y-4">
          <div>
            <h1 className="text-xl font-bold">{listing.title}</h1>
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              {listing.fm_profiles?.display_name || "작가"}
            </div>
          </div>

          {listing.description && (
            <p className="text-sm text-muted-foreground">{listing.description}</p>
          )}

          <div className="flex flex-wrap gap-1.5">
            <Badge variant="outline">{listing.category}</Badge>
            {listing.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {listing.view_count}
            </span>
            <span>{listing.purchase_count}건 판매</span>
          </div>

          <div className="rounded-xl border p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">가격</p>
              <p className="text-2xl font-bold text-primary">
                {listing.price.toLocaleString()}원
              </p>
            </div>
            <Button
              size="lg"
              className="mt-4 w-full font-semibold"
              onClick={handlePurchase}
              disabled={purchasing}
            >
              {purchasing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ShoppingCart className="mr-2 h-4 w-4" />
              )}
              구매하기
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            구매 후 24개 이모티콘 세트를 다운로드할 수 있어요
          </p>
        </div>
      </div>
    </div>
  );
}
