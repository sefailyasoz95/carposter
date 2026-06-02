export interface PosterStyle {
  id: string;
  name: string;
  description: string;
  prompt: string;
  example_image_url: string | null;
  price_cents: number;
  is_active: boolean;
  created_at: string;
  example_posters?: ExamplePoster[];
}

export interface ExamplePoster {
  id: string;
  style_id: string;
  image_url: string;
  title: string | null;
  created_at: string;
}

export type OrderStatus = "pending" | "paid" | "failed";
export type GenerationStatus = "pending" | "processing" | "completed" | "failed";

export interface Order {
  id: string;
  session_id: string;
  style_id: string;
  uploaded_image_url: string;
  payment_intent_id: string | null;
  payment_status: OrderStatus;
  generation_status: GenerationStatus;
  generated_poster_url: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  poster_styles?: PosterStyle;
}

export type CreationStep = "upload" | "style" | "payment" | "result";

export interface CreationState {
  step: CreationStep;
  uploadedImageUrl: string | null;
  uploadedImageFile: File | null;
  selectedStyle: PosterStyle | null;
  orderId: string | null;
  generatedPosterUrl: string | null;
}
