"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NewStylePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    prompt: "",
    price_cents: 499,
    is_active: true,
    example_image_url: "",
  });

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch("/api/admin/poster-styles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, example_image_url: form.example_image_url || null }),
    });
    if (res.ok) {
      router.replace("/admin/poster-styles");
    } else {
      const d = await res.json();
      setError(d.error ?? "Failed to create");
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/poster-styles">
          <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white gap-1.5">
            <ArrowLeft className="h-4 w-4" /> Styles
          </Button>
        </Link>
        <span className="text-zinc-700">/</span>
        <span className="text-sm text-zinc-400">New Style</span>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h1 className="text-xl font-black text-white mb-6">New Poster Style</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label="Name" required>
            <input value={form.name} onChange={(e) => set("name", e.target.value)} required className={INPUT} placeholder="e.g. Cinematic Drift" />
          </Field>
          <Field label="Description">
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={2} className={INPUT} placeholder="Short description shown to users" />
          </Field>
          <Field label="AI Prompt" required>
            <textarea value={form.prompt} onChange={(e) => set("prompt", e.target.value)} required rows={6} className={INPUT} placeholder="Full OpenAI image generation prompt…" />
          </Field>
          <Field label="Example Image URL">
            <input value={form.example_image_url} onChange={(e) => set("example_image_url", e.target.value)} className={INPUT} placeholder="https://…" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Price (cents)">
              <input type="number" value={form.price_cents} onChange={(e) => set("price_cents", Number(e.target.value))} min={0} className={INPUT} />
            </Field>
            <Field label="Active">
              <label className="flex items-center gap-2.5 mt-1 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={(e) => set("is_active", e.target.checked)} className="w-4 h-4 accent-red-600" />
                <span className="text-sm text-zinc-300">Visible to users</span>
              </label>
            </Field>
          </div>
          {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>}
          <div className="pt-1">
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Create Style
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

const INPUT = "w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-red-600 resize-none";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-zinc-500 font-semibold uppercase tracking-wider block mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
