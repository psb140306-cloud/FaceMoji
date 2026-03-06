// 커스텀 이벤트 트래킹 (Vercel Analytics 확장)

type EventName =
  | "page_view"
  | "upload_started"
  | "upload_completed"
  | "style_selected"
  | "generation_started"
  | "generation_completed"
  | "generation_failed"
  | "payment_started"
  | "payment_completed"
  | "payment_failed"
  | "download_started"
  | "editor_opened"
  | "editor_saved"
  | "marketplace_view"
  | "marketplace_purchase"
  | "listing_created"
  | "subscription_started"
  | "subscription_cancelled";

interface EventProperties {
  [key: string]: string | number | boolean | undefined;
}

export function trackEvent(name: EventName, properties?: EventProperties) {
  // Vercel Analytics custom events
  if (typeof window !== "undefined" && "va" in window) {
    (window as unknown as Record<string, unknown>).va?.("event", { name, ...properties });
  }

  // 내부 이벤트 로그 (Supabase에 저장)
  if (typeof window !== "undefined") {
    navigator.sendBeacon(
      "/api/analytics/event",
      JSON.stringify({ event: name, properties, timestamp: new Date().toISOString() }),
    );
  }
}

// 퍼널 단계별 트래킹
export function trackFunnel(step: string, metadata?: EventProperties) {
  trackEvent("page_view", { funnel_step: step, ...metadata });
}
