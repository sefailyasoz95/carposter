import { requireAdminAuth } from "@/lib/admin-auth";
import { supabase } from "@/lib/supabase/server";

export async function GET() {
  const unauth = await requireAdminAuth();
  if (unauth) return unauth;

  const { data, error } = await supabase
    .from("poster_styles")
    .select("*, example_posters(id)")
    .order("created_at", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function POST(request: Request) {
  const unauth = await requireAdminAuth();
  if (unauth) return unauth;

  const body = await request.json();
  const { name, description, prompt, price_cents, is_active, example_image_url } = body;

  if (!name || !prompt) {
    return Response.json({ error: "name and prompt are required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("poster_styles")
    .insert({ name, description, prompt, price_cents: price_cents ?? 499, is_active: is_active ?? true, example_image_url })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data, { status: 201 });
}
