"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, RefreshCw, Globe, MapPin, FileText, Users, Eye, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AggRow { value: string; count: number }

interface AnalyticsData {
  totalViews: number;
  todayViews: number;
  uniqueSessions: number;
  topPages: AggRow[];
  topCountries: AggRow[];
  topCities: AggRow[];
  recent: {
    path: string;
    country: string | null;
    city: string | null;
    session_id: string | null;
    referrer: string | null;
    created_at: string;
  }[];
}

type Tab = "countries" | "cities" | "pages";

function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: React.ElementType }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
      <div className="flex items-center gap-2 text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-3">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="text-3xl font-black text-white">{value.toLocaleString()}</p>
    </div>
  );
}

function AggTable({ rows, total }: { rows: AggRow[]; total: number }) {
  if (rows.length === 0) return <p className="text-zinc-600 text-sm py-6 text-center">No data yet</p>;
  return (
    <div className="divide-y divide-zinc-800">
      {rows.map((r) => {
        const pct = total > 0 ? Math.round((r.count / total) * 100) : 0;
        return (
          <div key={r.value} className="flex items-center gap-3 py-2.5">
            <span className="text-sm text-zinc-200 truncate flex-1">{r.value}</span>
            <div className="w-24 bg-zinc-800 rounded-full h-1.5 shrink-0">
              <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs text-zinc-400 w-8 text-right shrink-0">{r.count}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("countries");

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const TABS: { value: Tab; label: string; icon: React.ElementType }[] = [
    { value: "countries", label: "Countries",  icon: Globe },
    { value: "cities",    label: "Cities",     icon: MapPin },
    { value: "pages",     label: "Pages",      icon: FileText },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-white">Analytics</h1>
          <p className="text-sm text-zinc-500 mt-1">Visitor traffic overview</p>
        </div>
        <Button size="sm" variant="ghost" onClick={load} className="text-zinc-400 hover:text-white">
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-red-600" />
        </div>
      ) : !data ? (
        <p className="text-zinc-500 text-sm">Failed to load analytics.</p>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Total Views"       value={data.totalViews}     icon={Eye} />
            <StatCard label="Today's Views"     value={data.todayViews}     icon={TrendingUp} />
            <StatCard label="Unique Visitors"   value={data.uniqueSessions} icon={Users} />
          </div>

          {/* Breakdown tabs */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <div className="flex gap-2 mb-5">
              {TABS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setTab(value)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                    tab === value
                      ? "bg-red-600/20 text-red-400 border border-red-600/30"
                      : "bg-zinc-800 text-zinc-400 border border-zinc-700 hover:text-zinc-200"
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {label}
                </button>
              ))}
            </div>

            {tab === "countries" && <AggTable rows={data.topCountries} total={data.totalViews} />}
            {tab === "cities"    && <AggTable rows={data.topCities}    total={data.totalViews} />}
            {tab === "pages"     && <AggTable rows={data.topPages}     total={data.totalViews} />}
          </div>

          {/* Recent visits */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800">
              <h2 className="text-sm font-semibold text-zinc-300">Recent Visits</h2>
            </div>
            <div className="divide-y divide-zinc-800">
              {data.recent.length === 0 ? (
                <p className="text-zinc-600 text-sm py-8 text-center">No visits yet</p>
              ) : (
                data.recent.map((r, i) => (
                  <div key={i} className="px-5 py-3 flex items-center gap-4 flex-wrap">
                    <span className="text-xs text-zinc-500 shrink-0 w-32">
                      {new Date(r.created_at).toLocaleString()}
                    </span>
                    <span className="text-sm font-mono text-zinc-200 shrink-0">{r.path}</span>
                    {(r.city || r.country) && (
                      <span className="text-xs text-zinc-500">
                        {[r.city, r.country].filter(Boolean).join(", ")}
                      </span>
                    )}
                    {r.referrer && (
                      <span className="text-xs text-zinc-600 truncate max-w-xs">{r.referrer}</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
