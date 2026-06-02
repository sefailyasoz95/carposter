import { requireAdminAuth } from "@/lib/admin-auth";
import { supabase } from "@/lib/supabase/server";

export async function GET() {
  const unauth = await requireAdminAuth();
  if (unauth) return unauth;

  const { data, error } = await supabase
    .from("example_posters")
    .select("*, poster_styles(name)")
    .order("created_at", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function POST(request: Request) {
  const unauth = await requireAdminAuth();
  if (unauth) return unauth;

  const body = await request.json();
  const { style_id, image_url, title } = body;

  if (!style_id || !image_url) {
    return Response.json({ error: "style_id and image_url are required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("example_posters")
    .insert({ style_id, image_url, title })
    .select("*, poster_styles(name)")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data, { status: 201 });
}
