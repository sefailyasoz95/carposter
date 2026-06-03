import { supabase } from "@/lib/supabase/server";

export async function GET() {
  const { data, error } = await supabase
    .from("poster_styles")
    .select(`
      *,
      example_posters (id, image_url, title)
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data, {
    headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=60" },
  });
}
