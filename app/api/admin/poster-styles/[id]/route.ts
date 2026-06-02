import { requireAdminAuth } from "@/lib/admin-auth";
import { supabase } from "@/lib/supabase/server";
import { type NextRequest } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const unauth = await requireAdminAuth();
  if (unauth) return unauth;

  const { id } = await params;
  const { data, error } = await supabase
    .from("poster_styles")
    .select("*, example_posters(*)")
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

  const allowed = ["name", "description", "prompt", "price_cents", "is_active", "example_image_url"];
  const update: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) update[key] = body[key];
  }

  const { data, error } = await supabase
    .from("poster_styles")
    .update(update)
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
  const { error } = await supabase.from("poster_styles").delete().eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true });
}
