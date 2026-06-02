import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { styleId, uploadedImageUrl, sessionId } = await request.json();

  if (!styleId || !uploadedImageUrl || !sessionId) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Fetch style to get price
  const { data: style, error: styleError } = await supabase
    .from("poster_styles")
    .select("id, name, price_cents, is_active")
    .eq("id", styleId)
    .eq("is_active", true)
    .single();

  if (styleError || !style) {
    return Response.json({ error: "Style not found" }, { status: 404 });
  }

  // Create order record
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      session_id: sessionId,
      style_id: styleId,
      uploaded_image_url: uploadedImageUrl,
      payment_status: "pending",
      generation_status: "pending",
    })
    .select("id")
    .single();

  if (orderError || !order) {
    return Response.json({ error: "Failed to create order" }, { status: 500 });
  }

  // Create Stripe PaymentIntent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: style.price_cents,
    currency: "usd",
    automatic_payment_methods: { enabled: true },
    metadata: {
      orderId: order.id,
      styleId,
      sessionId,
    },
    description: `AutoPoster: ${style.name}`,
  });

  // Save payment intent ID to order
  await supabase
    .from("orders")
    .update({ payment_intent_id: paymentIntent.id })
    .eq("id", order.id);

  return Response.json({
    clientSecret: paymentIntent.client_secret,
    orderId: order.id,
  });
}
