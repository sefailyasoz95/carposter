import { requireAdminAuth } from "@/lib/admin-auth";
import { supabase } from "@/lib/supabase/server";
import { type NextRequest } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const unauth = await requireAdminAuth();
  if (unauth) return unauth;

  const { id } = await params;
  const { data, error } = await supabase
    .from("orders")
    .select("*, poster_styles(name, description)")
    .eq("id", id)
    .single();

  if (error || !data) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(data);
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const unauth = await requireAdminAuth();
  if (unauth) return unauth;

  const { id } = await params;
  const body = await req.json();

  const allowed = ["payment_status", "generation_status", "error_message", "generated_poster_url"];
  const update: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) update[key] = body[key];
  }

  const { data, error } = await supabase
    .from("orders")
    .update({ ...update, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const unauth = await requireAdminAuth();
  if (unauth) return unauth;

  const { id } = await params;
  const { error } = await supabase.from("orders").delete().eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true });
}
