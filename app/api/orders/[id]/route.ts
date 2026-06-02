import { supabase } from "@/lib/supabase/server";
import { type NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data, error } = await supabase
    .from("orders")
    .select("id, generation_status, generated_poster_url, error_message, payment_status")
    .eq("id", id)
    .single();

  if (error || !data) {
    return Response.json({ error: "Order not found" }, { status: 404 });
  }

  return Response.json(data);
}
