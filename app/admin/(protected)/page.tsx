"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart, CheckCircle2, Palette, XCircle, Loader2, ArrowRight } from "lucide-react";

interface Stats {
  totalOrders: number;
  paidOrders: number;
  completedPosters: number;
  failedOrders: number;
  totalStyles: number;
  activeStyles: number;
}

interface Order {
  id: string;
  payment_status: string;
  generation_status: string;
  created_at: string;
  poster_styles?: { name: string };
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
      <div className={`h-9 w-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon className="h-4.5 w-4.5" />
      </div>
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="text-sm text-zinc-500 mt-0.5">{label}</p>
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-zinc-700 text-zinc-300",
  processing: "bg-blue-500/20 text-blue-400",
  completed: "bg-emerald-500/20 text-emerald-400",
  failed: "bg-red-500/20 text-red-400",
  paid: "bg-emerald-500/20 text-emerald-400",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/stats").then((r) => r.json()),
      fetch("/api/admin/orders").then((r) => r.json()),
    ]).then(([s, o]) => {
      setStats(s);
      setOrders(Array.isArray(o) ? o.slice(0, 8) : []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white">Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-1">Overview of your CarPoster platform</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Orders" value={stats.totalOrders} icon={ShoppingCart} color="bg-blue-500/10 text-blue-400" />
          <StatCard label="Paid Orders" value={stats.paidOrders} icon={CheckCircle2} color="bg-emerald-500/10 text-emerald-400" />
          <StatCard label="Completed Posters" value={stats.completedPosters} icon={CheckCircle2} color="bg-red-500/10 text-red-400" />
          <StatCard label="Poster Styles" value={stats.totalStyles} icon={Palette} color="bg-purple-500/10 text-purple-400" />
        </div>
      )}

      {/* Recent orders */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <h2 className="font-bold text-white text-sm">Recent Orders</h2>
          <Link href="/admin/orders" className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                {["Order ID", "Style", "Payment", "Generation", "Date"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/40 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-zinc-400">{o.id.slice(0, 8)}…</td>
                  <td className="px-5 py-3 text-zinc-300">{o.poster_styles?.name ?? "—"}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[o.payment_status] ?? "bg-zinc-700 text-zinc-300"}`}>
                      {o.payment_status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[o.generation_status] ?? "bg-zinc-700 text-zinc-300"}`}>
                      {o.generation_status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-zinc-500 text-xs">{new Date(o.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-zinc-600">No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
