"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Store } from "lucide-react";

interface GenerationOption {
  id: string;
  style: string;
  sticker_count: number;
  created_at: string;
}

const CATEGORIES = [
  { key: "general", label: "일반" },
  { key: "cute", label: "귀여운" },
  { key: "funny", label: "웃긴" },
  { key: "cool", label: "멋진" },
  { key: "office", label: "직장인" },
];

export default function SellPage() {
  const router = useRouter();
  const [generations, setGenerations] = useState<GenerationOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedGeneration, setSelectedGeneration] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(2000);
  const [category, setCategory] = useState("general");
  const [tags, setTags] = useState("");

  useEffect(() => {
    async function loadGenerations() {
      // 결제 완료된 generation 목록 조회
      const res = await fetch("/api/generate?paid=true");
      if (res.ok) {
        const data = await res.json();
        setGenerations(data.generations || []);
      }
      setLoading(false);
    }
    loadGenerations();
  }, []);

  const handleSubmit = async () => {
    if (!selectedGeneration || !title) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/marketplace/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          generationId: selectedGeneration,
          title,
          description: description || null,
          price: Math.max(1000, price),
          category,
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });

      if (res.ok) {
        const listing = await res.json();
        router.push(`/marketplace/${listing.id}`);
      }
    } catch {
      // 에러 처리
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        마켓플레이스
      </button>

      <h1 className="mb-2 flex items-center gap-2 text-2xl font-bold">
        <Store className="h-6 w-6" />
        이모티콘 판매 등록
      </h1>
      <p className="mb-8 text-muted-foreground">
        만든 이모티콘을 다른 사용자에게 판매하세요. 판매 수수료 25%
      </p>

      <div className="space-y-5">
        {/* 세트 선택 */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">이모티콘 세트</label>
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : generations.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              결제 완료된 이모티콘이 없어요. 먼저 이모티콘을 만들어 주세요.
            </p>
          ) : (
            <select
              value={selectedGeneration}
              onChange={(e) => setSelectedGeneration(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            >
              <option value="">세트를 선택하세요</option>
              {generations.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.style} 스타일 - {g.sticker_count}개 ({new Date(g.created_at).toLocaleDateString()})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* 제목 */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 귀여운 카툰 이모티콘 세트"
            maxLength={50}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
          />
        </div>

        {/* 설명 */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">설명 (선택)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="이모티콘에 대한 설명을 입력하세요"
            maxLength={200}
            rows={3}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
          />
        </div>

        {/* 가격 */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">가격 (원)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            min={1000}
            step={100}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            최소 1,000원 | 수수료 25% 차감 후 {Math.round(price * 0.75).toLocaleString()}원 수령
          </p>
        </div>

        {/* 카테고리 */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">카테고리</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setCategory(cat.key)}
                className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                  category === cat.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* 태그 */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">태그 (선택)</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="쉼표로 구분 (예: 귀여운, 일상, 카카오톡)"
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
          />
        </div>

        <Button
          size="lg"
          className="w-full font-semibold"
          onClick={handleSubmit}
          disabled={!selectedGeneration || !title || submitting}
        >
          {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          판매 등록하기
        </Button>
      </div>
    </div>
  );
}
