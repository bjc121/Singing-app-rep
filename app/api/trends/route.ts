import { NextResponse } from "next/server";
import { requireUser } from "../../../lib/auth";
import { createServiceSupabase } from "../../../lib/supabase";

const rangeToDays: Record<string, number> = { "7": 7, "30": 30, "90": 90, all: 365 };

export async function GET(request: Request) {
  const user = await requireUser();
  const { searchParams } = new URL(request.url);
  const range = searchParams.get("dateRange") ?? "30";
  const days = rangeToDays[range] ?? 30;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const supabase = createServiceSupabase();
  const { data, error } = await supabase
    .from("evaluations")
    .select("*, recording:recordings(created_at,status,user_id)")
    .eq("recording.user_id", user.id)
    .gte("recording.created_at", since.toISOString())
    .neq("recording.status", "DELETED")
    .order("recording.created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const points = (data ?? []).map((e: any) => ({
    date: e.recording?.created_at,
    overall: e.overall_score,
    pitch: e.scores_json?.pitch_accuracy ?? null,
    breath: e.scores_json?.breath_control ?? null,
    intonation: e.scores_json?.intonation_stability ?? null
  }));

  return NextResponse.json({ points });
}
