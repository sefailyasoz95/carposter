"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Loader2, Lock, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import { getOrCreateSessionId } from "@/lib/utils";
import type { PosterStyle } from "@/types";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface PaymentStepProps {
  style: PosterStyle;
  uploadedImageUrl: string;
  onSuccess: (orderId: string) => void;
}

function CheckoutForm({
  style,
  uploadedImageUrl,
  clientSecret,
  onSuccess,
}: PaymentStepProps & { clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (stripeError) {
      setError(stripeError.message ?? "Payment failed");
      setProcessing(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      try {
        const res = await fetch("/api/payment/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentIntentId: paymentIntent.id }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Confirmation failed");
        onSuccess(data.orderId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
        setProcessing(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Order summary */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="flex items-center gap-4 p-4">
          <div className="relative h-16 w-24 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0">
            {style.example_image_url && (
              <Image src={style.example_image_url} alt={style.name} fill className="object-cover" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{style.name}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">{style.description}</p>
          </div>
          <span className="font-black text-red-600 text-lg shrink-0">{formatPrice(style.price_cents)}</span>
        </div>

        <Separator />

        <div className="flex items-center justify-between px-4 py-3 bg-zinc-50 dark:bg-zinc-900/50">
          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Total</span>
          <span className="text-sm font-black text-zinc-900 dark:text-zinc-100">{formatPrice(style.price_cents)}</span>
        </div>
      </div>

      {/* Stripe Payment Element */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="h-4 w-4 text-zinc-400" />
          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Secure Payment</span>
        </div>
        <PaymentElement
          options={{
            layout: "tabs",
          }}
        />
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-500/10 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={!stripe || !elements || processing}
        size="lg"
        className="w-full"
      >
        {processing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing Payment…
          </>
        ) : (
          <>
            <Lock className="h-4 w-4" />
            Pay {formatPrice(style.price_cents)} & Generate Poster
          </>
        )}
      </Button>

      <div className="flex items-center justify-center gap-2 text-xs text-zinc-400">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
        <span>Secured by Stripe · 256-bit SSL</span>
      </div>
    </form>
  );
}

export function PaymentStep({ style, uploadedImageUrl, onSuccess }: PaymentStepProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = getOrCreateSessionId();

    fetch("/api/payment/create-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ styleId: style.id, uploadedImageUrl, sessionId }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setClientSecret(data.clientSecret);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [style.id, uploadedImageUrl]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
        <p className="text-sm text-zinc-500">Preparing secure checkout…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-6 text-center">
        <p className="text-red-500 font-medium">{error}</p>
      </div>
    );
  }

  if (!clientSecret) return null;

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "night",
          variables: {
            colorPrimary: "#dc2626",
            colorBackground: "#111113",
            colorText: "#fafafa",
            colorDanger: "#ef4444",
            borderRadius: "12px",
            fontFamily: "system-ui, sans-serif",
          },
        },
      }}
    >
      <CheckoutForm
        style={style}
        uploadedImageUrl={uploadedImageUrl}
        clientSecret={clientSecret}
        onSuccess={onSuccess}
      />
    </Elements>
  );
}
