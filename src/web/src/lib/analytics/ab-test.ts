// A/B 테스트 프레임워크

export interface Experiment {
  id: string;
  name: string;
  variants: string[];
  weights?: number[]; // 가중치 (기본 균등)
}

// 실험 정의
export const EXPERIMENTS: Record<string, Experiment> = {
  pricing_display: {
    id: "pricing_display",
    name: "가격 표시 방식",
    variants: ["default", "monthly_highlight"],
  },
  cta_text: {
    id: "cta_text",
    name: "CTA 버튼 텍스트",
    variants: ["시작하기", "무료로 만들기", "이모티콘 만들기"],
  },
  style_order: {
    id: "style_order",
    name: "스타일 정렬 순서",
    variants: ["default", "popular_first"],
  },
};

// 유저별 일관된 variant 할당 (해시 기반)
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getVariant(experimentId: string, userId?: string): string {
  const experiment = EXPERIMENTS[experimentId];
  if (!experiment) return "default";

  // 로컬 스토리지에서 이미 할당된 variant 확인
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(`ab_${experimentId}`);
    if (stored && experiment.variants.includes(stored)) {
      return stored;
    }
  }

  // 유저 ID 또는 랜덤으로 variant 할당
  const seed = userId || (typeof window !== "undefined" ? getAnonymousId() : "default");
  const hash = hashString(`${experimentId}:${seed}`);
  const index = hash % experiment.variants.length;
  const variant = experiment.variants[index];

  // 로컬 스토리지에 저장
  if (typeof window !== "undefined") {
    localStorage.setItem(`ab_${experimentId}`, variant);
  }

  return variant;
}

function getAnonymousId(): string {
  if (typeof window === "undefined") return "server";

  let id = localStorage.getItem("anonymous_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("anonymous_id", id);
  }
  return id;
}

// React hook
import { useState, useEffect } from "react";

export function useExperiment(experimentId: string, userId?: string) {
  const [variant, setVariant] = useState("default");

  useEffect(() => {
    setVariant(getVariant(experimentId, userId));
  }, [experimentId, userId]);

  return variant;
}
