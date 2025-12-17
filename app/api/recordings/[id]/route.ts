import { NextResponse } from "next/server";
import { requireUser } from "../../../../lib/auth";
import { createServiceSupabase } from "../../../../lib/supabase";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const user = await requireUser();
  const supabase = createServiceSupabase();
  const { data: recording, error } = await supabase
    .from("recordings")
    .select("*, transcript:transcripts(*), evaluation:evaluations(*), feature_summary:feature_summaries(*)")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (error || !recording) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: signedUrlData } = await supabase.storage
    .from("recordings")
    .createSignedUrl(recording.storage_path, 3600);

  return NextResponse.json({
    recording: {
      id: recording.id,
      userId: recording.user_id,
      createdAt: recording.created_at,
      updatedAt: recording.updated_at,
      title: recording.title,
      durationSec: recording.duration_sec,
      storagePath: recording.storage_path,
      mimeType: recording.mime_type,
      status: recording.status,
      parentRecordingId: recording.parent_recording_id,
      genre: recording.genre,
      errorMessage: recording.error_message,
      transcript: recording.transcript
        ? {
            id: (recording.transcript as any).id,
            recordingId: (recording.transcript as any).recording_id,
            text: (recording.transcript as any).text,
            wordsJson: (recording.transcript as any).words_json
          }
        : null,
      evaluation: recording.evaluation
        ? {
            id: (recording.evaluation as any).id,
            recordingId: (recording.evaluation as any).recording_id,
            rubricVersion: (recording.evaluation as any).rubric_version,
            overallScore: (recording.evaluation as any).overall_score,
            scoresJson: (recording.evaluation as any).scores_json,
            highlights: (recording.evaluation as any).highlights,
            bottlenecks: (recording.evaluation as any).bottlenecks,
            timecodedNotesJson: (recording.evaluation as any).timecoded_notes_json,
            drillsJson: (recording.evaluation as any).drills_json,
            coachText: (recording.evaluation as any).coach_text
          }
        : null,
      featureSummary: recording.feature_summary
        ? {
            id: (recording.feature_summary as any).id,
            recordingId: (recording.feature_summary as any).recording_id,
            voicedPct: (recording.feature_summary as any).voiced_pct,
            medianF0Hz: (recording.feature_summary as any).median_f0_hz,
            pitchStdHz: (recording.feature_summary as any).pitch_std_hz,
            rmsAvg: (recording.feature_summary as any).rms_avg,
            rmsStd: (recording.feature_summary as any).rms_std,
            computedJson: (recording.feature_summary as any).computed_json
          }
        : null
    },
    signedReadUrl: signedUrlData?.signedUrl ?? null
  });
}
