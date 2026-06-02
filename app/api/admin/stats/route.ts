import { requireAdminAuth } from "@/lib/admin-auth";
import { supabase } from "@/lib/supabase/server";

export async function GET() {
  const unauth = await requireAdminAuth();
  if (unauth) return unauth;

  const [ordersRes, stylesRes] = await Promise.all([
    supabase.from("orders").select("payment_status, generation_status"),
    supabase.from("poster_styles").select("id, is_active"),
  ]);

  const orders = ordersRes.data ?? [];
  const styles = stylesRes.data ?? [];

  return Response.json({
    totalOrders: orders.length,
    paidOrders: orders.filter((o) => o.payment_status === "paid").length,
    completedPosters: orders.filter((o) => o.generation_status === "completed").length,
    failedOrders: orders.filter((o) => o.generation_status === "failed").length,
    totalStyles: styles.length,
    activeStyles: styles.filter((s) => s.is_active).length,
  });
}
