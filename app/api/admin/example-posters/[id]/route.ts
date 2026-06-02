import { requireAdminAuth } from "@/lib/admin-auth";
import { supabase } from "@/lib/supabase/server";
import { type NextRequest } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const unauth = await requireAdminAuth();
  if (unauth) return unauth;

  const { id } = await params;
  const { error } = await supabase.from("example_posters").delete().eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true });
}
