"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowLeft, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Style {
  id: string;
  name: string;
  description: string;
  prompt: string;
  price_cents: number;
  is_active: boolean;
  example_image_url: string | null;
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

export default function EditStylePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", prompt: "", price_cents: 499, is_active: true, example_image_url: "" });

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    fetch(`/api/admin/poster-styles/${id}`)
      .then((r) => r.json())
      .then((d: Style) => {
        setForm({
          name: d.name,
          description: d.description ?? "",
          prompt: d.prompt,
          price_cents: d.price_cents,
          is_active: d.is_active,
          example_image_url: d.example_image_url ?? "",
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/admin/poster-styles/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, example_image_url: form.example_image_url || null }),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "Failed to save");
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${form.name}"?`)) return;
    setDeleting(true);
    await fetch(`/api/admin/poster-styles/${id}`, { method: "DELETE" });
    router.replace("/admin/poster-styles");
  };

  if (loading) return <div className="flex items-center justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-red-600" /></div>;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/poster-styles">
          <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white gap-1.5">
            <ArrowLeft className="h-4 w-4" /> Styles
          </Button>
        </Link>
        <span className="text-zinc-700">/</span>
        <span className="text-sm text-zinc-400 truncate max-w-xs">{form.name}</span>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h1 className="text-xl font-black text-white mb-6">Edit Style</h1>
        <form onSubmit={handleSave} className="space-y-5">
          <Field label="Name" required>
            <input value={form.name} onChange={(e) => set("name", e.target.value)} required className={INPUT} />
          </Field>
          <Field label="Description">
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={2} className={INPUT} />
          </Field>
          <Field label="AI Prompt" required>
            <textarea value={form.prompt} onChange={(e) => set("prompt", e.target.value)} required rows={6} className={INPUT} />
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
          <div className="flex items-center gap-3 pt-1">
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </Button>
            <Button type="button" onClick={handleDelete} disabled={deleting} variant="ghost" className="text-red-500 hover:text-red-400 hover:bg-red-500/10">
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Delete Style
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
