import { requireAdminAuth } from "@/lib/admin-auth";
import { supabase } from "@/lib/supabase/server";

export async function GET() {
  const unauth = await requireAdminAuth();
  if (unauth) return unauth;

  const { data, error } = await supabase
    .from("page_views")
    .select("path, country, city, session_id, referrer, created_at")
    .order("created_at", { ascending: false })
    .limit(2000);

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const rows = data ?? [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayViews = rows.filter((r) => new Date(r.created_at) >= today).length;
  const uniqueSessions = new Set(rows.map((r) => r.session_id).filter(Boolean)).size;

  const topPages = aggregate(rows, "path");
  const topCountries = aggregate(rows, "country");
  const topCities = aggregate(rows, "city");

  return Response.json({
    totalViews: rows.length,
    todayViews,
    uniqueSessions,
    topPages,
    topCountries,
    topCities,
    recent: rows.slice(0, 100),
  });
}

function aggregate(rows: { [key: string]: unknown }[], key: string) {
  const counts: Record<string, number> = {};
  for (const row of rows) {
    const val = (row[key] as string) ?? "Unknown";
    counts[val] = (counts[val] ?? 0) + 1;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([value, count]) => ({ value, count }));
}
