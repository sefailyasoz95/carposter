import { requireAdminAuth } from "@/lib/admin-auth";
import { supabase } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { type NextRequest } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Ctx) {
  const unauth = await requireAdminAuth();
  if (unauth) return unauth;

  const { id: orderId } = await params;

  const { data: order, error } = await supabase
    .from("orders")
    .select("id, payment_status, generation_status")
    .eq("id", orderId)
    .single();

  if (error || !order) {
    return Response.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.payment_status !== "paid") {
    return Response.json({ error: "Order has not been paid — cannot retry generation" }, { status: 400 });
  }

  if (order.generation_status === "processing") {
    return Response.json({ error: "Generation already in progress" }, { status: 409 });
  }

  if (order.generation_status === "completed") {
    return Response.json({ error: "Generation already completed" }, { status: 409 });
  }

  // Reset to pending so the generate route can claim it
  const { error: resetError } = await supabase
    .from("orders")
    .update({
      generation_status: "pending",
      error_message: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (resetError) {
    logger.error("admin:retry_reset_failed", { orderId, error: resetError.message });
    return Response.json({ error: "Failed to reset order status" }, { status: 500 });
  }

  logger.info("admin:retry_triggered", { orderId });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  fetch(`${baseUrl}/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-internal-secret": process.env.INTERNAL_SECRET ?? "dev",
    },
    body: JSON.stringify({ orderId }),
  }).catch((err) => logger.error("admin:retry_generate_failed", { orderId, error: String(err) }));

  return Response.json({ success: true, message: "Generation retry triggered" });
}
