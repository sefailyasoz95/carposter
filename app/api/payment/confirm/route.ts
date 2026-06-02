import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  const { paymentIntentId } = await request.json();

  if (!paymentIntentId) {
    return Response.json({ error: "Missing paymentIntentId" }, { status: 400 });
  }

  // Verify payment with Stripe
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status !== "succeeded") {
    return Response.json({ error: "Payment not completed" }, { status: 402 });
  }

  const orderId = paymentIntent.metadata.orderId;
  if (!orderId) {
    return Response.json({ error: "Order not found in payment metadata" }, { status: 400 });
  }

  // Update order payment status only — generation_status stays "pending"
  // so the generate route can atomically claim it and prevent duplicate runs.
  const { data: order, error: updateError } = await supabase
    .from("orders")
    .update({
      payment_status: "paid",
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .select("*, poster_styles(prompt, name)")
    .single();

  if (updateError || !order) {
    await logger.error("confirm:update_failed", { orderId, error: updateError?.message });
    return Response.json({ error: "Failed to update order" }, { status: 500 });
  }

  await logger.payment(true, "confirm:payment_verified", { orderId, paymentIntentId });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  fetch(`${baseUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-internal-secret": process.env.INTERNAL_SECRET ?? "dev" },
    body: JSON.stringify({ orderId }),
  }).catch((err) => logger.error("confirm:generate_trigger_failed", { orderId, error: String(err) }));

  return Response.json({ orderId, status: "processing" });
}
