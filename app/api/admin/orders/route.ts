import { requireAdminAuth } from "@/lib/admin-auth";
import { supabase } from "@/lib/supabase/server";

export async function GET() {
  const unauth = await requireAdminAuth();
  if (unauth) return unauth;

  const { data, error } = await supabase
    .from("orders")
    .select("*, poster_styles(name)")
    .order("created_at", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}
