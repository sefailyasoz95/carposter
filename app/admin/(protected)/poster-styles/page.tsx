"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Trash2, Pencil, Plus, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Style {
  id: string;
  name: string;
  description: string;
  price_cents: number;
  is_active: boolean;
  created_at: string;
  example_posters?: { id: string }[];
}

export default function PosterStylesPage() {
  const [styles, setStyles] = useState<Style[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  const load = () => {
    fetch("/api/admin/poster-styles")
      .then((r) => r.json())
      .then((d) => setStyles(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This will also delete its example posters.`)) return;
    setDeleting(id);
    await fetch(`/api/admin/poster-styles/${id}`, { method: "DELETE" });
    setStyles((prev) => prev.filter((s) => s.id !== id));
    setDeleting(null);
  };

  const handleToggle = async (id: string, current: boolean) => {
    setToggling(id);
    const res = await fetch(`/api/admin/poster-styles/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !current }),
    });
    if (res.ok) {
      setStyles((prev) => prev.map((s) => s.id === id ? { ...s, is_active: !current } : s));
    }
    setToggling(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Poster Styles</h1>
          <p className="text-sm text-zinc-500 mt-1">{styles.length} styles</p>
        </div>
        <Link href="/admin/poster-styles/new">
          <Button size="sm">
            <Plus className="h-4 w-4" /> New Style
          </Button>
        </Link>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-red-600" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  {["Name", "Price", "Examples", "Active", "Created", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {styles.map((s) => (
                  <tr key={s.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-white">{s.name}</p>
                      <p className="text-xs text-zinc-500 mt-0.5 max-w-48 truncate">{s.description}</p>
                    </td>
                    <td className="px-5 py-3 text-zinc-300">${(s.price_cents / 100).toFixed(2)}</td>
                    <td className="px-5 py-3 text-zinc-400">{s.example_posters?.length ?? 0}</td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => handleToggle(s.id, s.is_active)}
                        disabled={toggling === s.id}
                        className="text-zinc-400 hover:text-white transition-colors"
                      >
                        {toggling === s.id
                          ? <Loader2 className="h-4.5 w-4.5 animate-spin" />
                          : s.is_active
                            ? <ToggleRight className="h-5 w-5 text-emerald-400" />
                            : <ToggleLeft className="h-5 w-5 text-zinc-600" />}
                      </button>
                    </td>
                    <td className="px-5 py-3 text-zinc-500 text-xs whitespace-nowrap">
                      {new Date(s.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/poster-styles/${s.id}`}>
                          <Button size="sm" variant="outline" className="h-7 px-2 border-zinc-700 bg-transparent text-zinc-300 hover:text-white">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Button
                          size="sm" variant="ghost"
                          className="h-7 px-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
                          onClick={() => handleDelete(s.id, s.name)}
                          disabled={deleting === s.id}
                        >
                          {deleting === s.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {styles.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-zinc-600">No styles yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
