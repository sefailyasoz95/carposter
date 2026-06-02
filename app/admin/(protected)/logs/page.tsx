"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Trash2, RefreshCw, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LogRow {
  id: number;
  created_at: string;
  json: Record<string, unknown>;
  is_payment_succ: boolean | null;
}

type Filter = "all" | "payment_success" | "payment_failed" | "error";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all",             label: "All" },
  { value: "payment_success", label: "Payment OK" },
  { value: "payment_failed",  label: "Payment Failed" },
  { value: "error",           label: "Errors" },
];

function rowIcon(row: LogRow) {
  if (row.is_payment_succ === true)  return <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />;
  if (row.is_payment_succ === false) return <XCircle      className="h-4 w-4 text-red-400 shrink-0" />;
  const level = String(row.json?.level ?? "");
  if (level === "error") return <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />;
  return <AlertTriangle className="h-4 w-4 text-zinc-500 shrink-0" />;
}

function rowBg(row: LogRow) {
  if (row.is_payment_succ === true)  return "border-l-2 border-l-emerald-500/40";
  if (row.is_payment_succ === false) return "border-l-2 border-l-red-500/40";
  const level = String(row.json?.level ?? "");
  if (level === "error") return "border-l-2 border-l-amber-500/40";
  return "";
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [clearing, setClearing] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    const params = filter !== "all" ? `?filter=${filter}` : "";
    fetch(`/api/admin/logs${params}`)
      .then((r) => r.json())
      .then((d) => setLogs(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const handleClear = async () => {
    if (!confirm("Delete all logs? This cannot be undone.")) return;
    setClearing(true);
    await fetch("/api/admin/logs", { method: "DELETE" });
    setLogs([]);
    setClearing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-white">Logs</h1>
          <p className="text-sm text-zinc-500 mt-1">{logs.length} entries</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={load} className="text-zinc-400 hover:text-white">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm" variant="ghost"
            onClick={handleClear}
            disabled={clearing || logs.length === 0}
            className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
          >
            {clearing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            Clear All
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
              filter === f.value
                ? "bg-red-600/20 text-red-400 border border-red-600/30"
                : "bg-zinc-800 text-zinc-400 border border-zinc-700 hover:text-zinc-200"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-red-600" />
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center text-zinc-600 text-sm">No logs found</div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {logs.map((row) => (
              <div key={row.id} className={cn("px-5 py-3 hover:bg-zinc-800/40 transition-colors cursor-pointer", rowBg(row))} onClick={() => setExpanded(expanded === row.id ? null : row.id)}>
                <div className="flex items-start gap-3">
                  {rowIcon(row)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs text-zinc-500 shrink-0">
                        {new Date(row.created_at).toLocaleString()}
                      </span>
                      {row.is_payment_succ === true  && <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">payment ✓</span>}
                      {row.is_payment_succ === false && <span className="text-xs font-semibold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">payment ✗</span>}
                      <span className="text-sm text-zinc-200 font-mono truncate">
                        {String(row.json?.message ?? "")}
                      </span>
                    </div>

                    {/* Expanded JSON */}
                    {expanded === row.id && (
                      <pre className="mt-3 text-xs text-zinc-300 bg-zinc-950 rounded-xl p-4 overflow-x-auto whitespace-pre-wrap break-all">
                        {JSON.stringify(row.json, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
