import { requireAdminAuth } from "@/lib/admin-auth";
import { supabase } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const unauth = await requireAdminAuth();
  if (unauth) return unauth;

  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? "200"), 500);
  const filter = searchParams.get("filter"); // "payment_success" | "payment_failed" | "error"

  let query = supabase
    .from("Logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (filter === "payment_success") query = query.eq("is_payment_succ", true);
  else if (filter === "payment_failed") query = query.eq("is_payment_succ", false);
  else if (filter === "error") query = query.is("is_payment_succ", null);

  const { data, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function DELETE() {
  const unauth = await requireAdminAuth();
  if (unauth) return unauth;

  const { error } = await supabase.from("Logs").delete().not("id", "is", null);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true });
}
