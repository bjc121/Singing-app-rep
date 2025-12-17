import { NextResponse } from "next/server";
import { requireUser } from "../../../lib/auth";
import { createServiceSupabase } from "../../../lib/supabase";

export async function GET(request: Request) {
  const user = await requireUser();
  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") ?? 10);
  const cursor = searchParams.get("cursor");

  const supabase = createServiceSupabase();
  const query = supabase
    .from("recordings")
    .select("*, evaluation:evaluations(*)")
    .eq("user_id", user.id)
    .neq("status", "DELETED")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (cursor) {
    query.lt("created_at", cursor);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const normalized = (data ?? []).map((r) => ({
    id: r.id,
    userId: r.user_id,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    title: r.title,
    durationSec: r.duration_sec,
    storagePath: r.storage_path,
    mimeType: r.mime_type,
    status: r.status,
    parentRecordingId: r.parent_recording_id,
    genre: r.genre,
    errorMessage: r.error_message,
    evaluation: r.evaluation
      ? {
          id: (r.evaluation as any).id,
          recordingId: (r.evaluation as any).recording_id,
          rubricVersion: (r.evaluation as any).rubric_version,
          overallScore: (r.evaluation as any).overall_score,
          scoresJson: (r.evaluation as any).scores_json,
          highlights: (r.evaluation as any).highlights,
          bottlenecks: (r.evaluation as any).bottlenecks,
          timecodedNotesJson: (r.evaluation as any).timecoded_notes_json,
          drillsJson: (r.evaluation as any).drills_json,
          coachText: (r.evaluation as any).coach_text
        }
      : null
  }));

  const nextCursor = normalized.length === limit ? normalized[normalized.length - 1].createdAt : null;

  return NextResponse.json({ recordings: normalized, nextCursor });
}
