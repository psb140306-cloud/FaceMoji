export type StyleType = "cartoon" | "flat" | "anime" | "watercolor" | "3d" | "manga";
export type GenerationStatus = "pending" | "processing" | "completed" | "failed" | "expired";
export type PaymentStatus = "pending" | "completed" | "failed" | "cancelled" | "refunded";
export type PaymentMethod = "card" | "kakaopay" | "naverpay";
export type PaymentType = "generation" | "marketplace" | "subscription";
export type SubscriptionType = "free" | "basic" | "pro";

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  subscription_type: SubscriptionType;
  subscription_expires_at: string | null;
  generation_count: number;
  created_at: string;
  updated_at: string;
}

export interface Generation {
  id: string;
  user_id: string;
  style: StyleType;
  status: GenerationStatus;
  sticker_count: number;
  face_similarity_score: number | null;
  source_image_path: string | null;
  cost_usd: number | null;
  retry_count: number;
  error_message: string | null;
  is_paid: boolean;
  created_at: string;
  completed_at: string | null;
  expires_at: string;
}

export interface Sticker {
  id: string;
  generation_id: string;
  sort_order: number;
  expression: string;
  image_path: string;
  ogq_image_path: string | null;
  thumbnail_path: string | null;
  has_text: boolean;
  text_content: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  generation_id: string | null;
  payment_type: PaymentType;
  amount: number;
  payment_method: PaymentMethod | null;
  toss_payment_key: string | null;
  toss_order_id: string;
  status: PaymentStatus;
  receipt_url: string | null;
  created_at: string;
  completed_at: string | null;
}

export type ListingStatus = "draft" | "published" | "sold_out" | "hidden";
export type PurchaseStatus = "pending" | "completed" | "refunded";

export interface MarketplaceListing {
  id: string;
  seller_id: string;
  generation_id: string;
  title: string;
  description: string | null;
  price: number;
  category: string;
  tags: string[];
  thumbnail_url: string | null;
  status: ListingStatus;
  view_count: number;
  purchase_count: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface MarketplacePurchase {
  id: string;
  buyer_id: string;
  listing_id: string;
  payment_id: string | null;
  amount: number;
  seller_revenue: number;
  platform_fee: number;
  status: PurchaseStatus;
  created_at: string;
  completed_at: string | null;
}

export type SubscriptionPlan = "basic" | "pro";
export type SubscriptionStatus = "active" | "cancelled" | "expired" | "past_due";

export interface Subscription {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  billing_key: string | null;
  amount: number;
  credits_total: number;
  credits_used: number;
  current_period_start: string;
  current_period_end: string;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConsentLog {
  id: string;
  user_id: string;
  consent_type: string;
  consent_version: string;
  is_agreed: boolean;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  expires_at: string;
}
