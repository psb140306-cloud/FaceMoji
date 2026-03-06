import type { Generation, Sticker, StyleType } from "./database";

// Generate API
export interface GenerateRequest {
  imageUrl: string;
  style: StyleType;
  pipaConsent: boolean;
}

export interface GenerateResponse {
  generationId: string;
  status: "pending";
}

export interface GenerationStatusResponse extends Generation {
  stickers: Sticker[];
}

// Payment API
export interface PaymentRequestBody {
  generationId: string;
  method: string;
}

export interface PaymentRequestResponse {
  paymentUrl: string;
  orderId: string;
}

// Error
export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  status: number;
}
