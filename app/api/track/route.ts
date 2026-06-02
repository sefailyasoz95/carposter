import { supabase } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const secret = request.headers.get("x-internal-secret");
  if (secret !== (process.env.INTERNAL_SECRET ?? "dev")) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { path, country, city, session_id, referrer, user_agent } = await request.json();

  if (!path) {
    return Response.json({ error: "Missing path" }, { status: 400 });
  }

  const { error } = await supabase.from("page_views").insert({
    path,
    country: country ?? null,
    city: city ?? null,
    session_id: session_id ?? null,
    referrer: referrer ?? null,
    user_agent: user_agent ?? null,
  });

  if (error) {
    console.error("[track] insert failed:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
