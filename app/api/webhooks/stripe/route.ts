import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  const body = await request.text();
  const sig = (await headers()).get("stripe-signature");

  if (!sig) {
    return Response.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return Response.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  let event: ReturnType<typeof stripe.webhooks.constructEvent>;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const orderId = paymentIntent.metadata?.orderId;

    if (!orderId) {
      return Response.json({ error: "No orderId in metadata" }, { status: 400 });
    }

    const { data: claimed, error: updateError } = await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        payment_intent_id: paymentIntent.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .eq("payment_status", "pending")
      .select("id");

    if (updateError) {
      await logger.error("webhook:update_failed", { orderId, error: updateError.message });
      return Response.json({ error: "Failed to update order" }, { status: 500 });
    }

    if (!claimed || claimed.length === 0) {
      logger.info("webhook:already_claimed_by_confirm", { orderId });
      return Response.json({ received: true });
    }

    await logger.payment(true, "webhook:payment_claimed", { orderId, paymentIntentId: paymentIntent.id });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    fetch(`${baseUrl}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": process.env.INTERNAL_SECRET ?? "dev",
      },
      body: JSON.stringify({ orderId }),
    }).catch((err) => logger.error("webhook:generate_trigger_failed", { orderId, error: String(err) }));
  }

  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object;
    const orderId = paymentIntent.metadata?.orderId;

    if (orderId) {
      await logger.payment(false, "webhook:payment_failed", { orderId, paymentIntentId: paymentIntent.id });
      await supabase
        .from("orders")
        .update({
          payment_status: "failed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);
    }
  }

  return Response.json({ received: true });
}
