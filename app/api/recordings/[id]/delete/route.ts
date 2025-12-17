import { NextResponse } from "next/server";
import { requireUser } from "../../../../../lib/auth";
import { createServiceSupabase } from "../../../../../lib/supabase";

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const user = await requireUser();
  const supabase = createServiceSupabase();
  const { data: recording, error } = await supabase
    .from("recordings")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();
  if (error || !recording) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await supabase.storage.from("recordings").remove([recording.storage_path]);
  await supabase
    .from("recordings")
    .update({ status: "DELETED" })
    .eq("id", recording.id);

  return NextResponse.json({ ok: true });
}
