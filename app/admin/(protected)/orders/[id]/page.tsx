"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Loader2, ArrowLeft, Save, Trash2, ExternalLink, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Order {
  id: string;
  session_id: string;
  style_id: string;
  uploaded_image_url: string;
  payment_intent_id: string | null;
  payment_status: string;
  generation_status: string;
  generated_poster_url: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  poster_styles?: { name: string; description: string };
}

const PAYMENT_STATUSES = ["pending", "paid", "failed"];
const GENERATION_STATUSES = ["pending", "processing", "completed", "failed"];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [retryMsg, setRetryMsg] = useState<string | null>(null);
  const [form, setForm] = useState({ payment_status: "", generation_status: "", error_message: "" });

  useEffect(() => {
    fetch(`/api/admin/orders/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setOrder(d);
        setForm({ payment_status: d.payment_status, generation_status: d.generation_status, error_message: d.error_message ?? "" });
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) setOrder(data);
    setSaving(false);
  };

  const handleRetry = async () => {
    setRetrying(true);
    setRetryMsg(null);
    const res = await fetch(`/api/admin/orders/${id}/retry`, { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      setRetryMsg("Retry triggered — generation has been queued.");
      setOrder((o) => o ? { ...o, generation_status: "pending", error_message: null } : o);
      setForm((f) => ({ ...f, generation_status: "pending", error_message: "" }));
    } else {
      setRetryMsg(data.error ?? "Retry failed");
    }
    setRetrying(false);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this order permanently?")) return;
    setDeleting(true);
    await fetch(`/api/admin/orders/${id}`, { method: "DELETE" });
    router.replace("/admin/orders");
  };

  if (loading) return <div className="flex items-center justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-red-600" /></div>;
  if (!order) return <div className="text-zinc-500 py-16 text-center">Order not found</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/orders">
          <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white gap-1.5">
            <ArrowLeft className="h-4 w-4" /> Orders
          </Button>
        </Link>
        <span className="text-zinc-700">/</span>
        <span className="text-sm text-zinc-400 font-mono">{order.id.slice(0, 16)}…</span>
      </div>

      {/* Info grid */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <h2 className="font-bold text-white">Order Info</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            ["ID", order.id],
            ["Style", order.poster_styles?.name ?? order.style_id],
            ["Session", order.session_id.slice(0, 16) + "…"],
            ["Payment Intent", order.payment_intent_id ?? "—"],
            ["Created", new Date(order.created_at).toLocaleString()],
            ["Updated", new Date(order.updated_at).toLocaleString()],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="text-zinc-500 text-xs mb-0.5">{k}</p>
              <p className="text-zinc-200 font-mono text-xs break-all">{v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recovery banner — paid but generation failed */}
      {order.payment_status === "paid" && order.generation_status === "failed" && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-300">Payment succeeded but generation failed</p>
            {order.error_message && (
              <p className="text-xs text-amber-400/70 mt-1 font-mono break-all">{order.error_message}</p>
            )}
            {retryMsg && (
              <p className="text-xs mt-2 text-zinc-300">{retryMsg}</p>
            )}
          </div>
          <Button
            size="sm"
            onClick={handleRetry}
            disabled={retrying}
            className="shrink-0 bg-amber-500 hover:bg-amber-400 text-black shadow-none"
          >
            {retrying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            Retry Generation
          </Button>
        </div>
      )}

      {/* Images */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-3">Uploaded Photo</p>
          <div className="relative aspect-square rounded-xl overflow-hidden bg-zinc-800">
            <Image src={order.uploaded_image_url} alt="Uploaded" fill className="object-cover" />
          </div>
          <a href={order.uploaded_image_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 mt-2">
            Open <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-3">Generated Poster</p>
          <div className="relative aspect-square rounded-xl overflow-hidden bg-zinc-800">
            {order.generated_poster_url ? (
              <Image src={order.generated_poster_url} alt="Generated" fill className="object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-zinc-600 text-xs">Not generated</div>
            )}
          </div>
          {order.generated_poster_url && (
            <a href={order.generated_poster_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 mt-2">
              Open <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>

      {/* Edit */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <h2 className="font-bold text-white">Edit Status</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-zinc-500 font-semibold uppercase tracking-wider block mb-1.5">Payment Status</label>
            <select
              value={form.payment_status}
              onChange={(e) => setForm((f) => ({ ...f, payment_status: e.target.value }))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-600"
            >
              {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-zinc-500 font-semibold uppercase tracking-wider block mb-1.5">Generation Status</label>
            <select
              value={form.generation_status}
              onChange={(e) => setForm((f) => ({ ...f, generation_status: e.target.value }))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-600"
            >
              {GENERATION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs text-zinc-500 font-semibold uppercase tracking-wider block mb-1.5">Error Message</label>
          <input
            value={form.error_message}
            onChange={(e) => setForm((f) => ({ ...f, error_message: e.target.value }))}
            placeholder="—"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-red-600"
          />
        </div>
        <div className="flex items-center gap-3 pt-1">
          <Button onClick={handleSave} disabled={saving} size="sm">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save Changes
          </Button>
          <Button onClick={handleDelete} disabled={deleting} variant="ghost" size="sm" className="text-red-500 hover:text-red-400 hover:bg-red-500/10">
            {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            Delete Order
          </Button>
        </div>
      </div>
    </div>
  );
}
