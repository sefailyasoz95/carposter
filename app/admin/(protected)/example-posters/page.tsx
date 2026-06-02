"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExamplePoster {
  id: string;
  image_url: string;
  title: string | null;
  created_at: string;
  poster_styles?: { name: string };
}

interface Style { id: string; name: string }

const INPUT = "w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-red-600";

export default function ExamplePostersPage() {
  const [posters, setPosters] = useState<ExamplePoster[]>([]);
  const [styles, setStyles] = useState<Style[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ style_id: "", image_url: "", title: "" });
  const [formError, setFormError] = useState<string | null>(null);

  const load = () => {
    Promise.all([
      fetch("/api/admin/example-posters").then((r) => r.json()),
      fetch("/api/admin/poster-styles").then((r) => r.json()),
    ]).then(([p, s]) => {
      setPosters(Array.isArray(p) ? p : []);
      setStyles(Array.isArray(s) ? s : []);
      if (Array.isArray(s) && s.length > 0) setForm((f) => ({ ...f, style_id: s[0].id }));
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this example poster?")) return;
    setDeleting(id);
    await fetch(`/api/admin/example-posters/${id}`, { method: "DELETE" });
    setPosters((prev) => prev.filter((p) => p.id !== id));
    setDeleting(null);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setFormError(null);
    const res = await fetch("/api/admin/example-posters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, title: form.title || null }),
    });
    if (res.ok) {
      const created = await res.json();
      setPosters((prev) => [created, ...prev]);
      setForm((f) => ({ ...f, image_url: "", title: "" }));
    } else {
      const d = await res.json();
      setFormError(d.error ?? "Failed to add");
    }
    setAdding(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Example Posters</h1>
        <p className="text-sm text-zinc-500 mt-1">{posters.length} example images</p>
      </div>

      {/* Add form */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="font-bold text-white mb-4">Add Example Poster</h2>
        <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div>
            <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-1.5">Style <span className="text-red-500">*</span></label>
            <select value={form.style_id} onChange={(e) => setForm((f) => ({ ...f, style_id: e.target.value }))} required className={INPUT}>
              {styles.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-1.5">Image URL <span className="text-red-500">*</span></label>
            <input value={form.image_url} onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))} required placeholder="https://…" className={INPUT} />
          </div>
          <div>
            <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-1.5">Title</label>
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Optional" className={INPUT} />
          </div>
          {formError && <p className="sm:col-span-4 text-sm text-red-400">{formError}</p>}
          <div className="sm:col-span-4">
            <Button type="submit" disabled={adding} size="sm">
              {adding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              Add Poster
            </Button>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-red-600" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  {["Preview", "Style", "Title", "Date", ""].map((h, i) => (
                    <th key={i} className="px-5 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {posters.map((p) => (
                  <tr key={p.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="relative h-12 w-16 rounded-lg overflow-hidden bg-zinc-800">
                        <Image src={p.image_url} alt={p.title ?? ""} fill className="object-cover" />
                      </div>
                    </td>
                    <td className="px-5 py-3 text-zinc-300">{p.poster_styles?.name ?? "—"}</td>
                    <td className="px-5 py-3 text-zinc-400">{p.title ?? <span className="text-zinc-600">—</span>}</td>
                    <td className="px-5 py-3 text-zinc-500 text-xs">{new Date(p.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-3">
                      <Button
                        size="sm" variant="ghost"
                        className="h-7 px-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
                        onClick={() => handleDelete(p.id)}
                        disabled={deleting === p.id}
                      >
                        {deleting === p.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                      </Button>
                    </td>
                  </tr>
                ))}
                {posters.length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-10 text-center text-zinc-600">No example posters yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
