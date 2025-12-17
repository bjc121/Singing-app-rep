import { NextResponse } from "next/server";
import { createServiceSupabase } from "../../../../lib/supabase";
import { openai, singingEvaluationSchema } from "../../../../lib/openai";
import { computeFeatures } from "../../../../lib/dsp";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json();
  const { recordingId } = body as { recordingId: string };
  if (!recordingId) return NextResponse.json({ error: "recordingId required" }, { status: 400 });

  const supabase = createServiceSupabase();
  const { data: recording, error: fetchError } = await supabase
    .from("recordings")
    .select("*")
    .eq("id", recordingId)
    .single();
  if (fetchError || !recording || recording.status !== "UPLOADED") {
    return NextResponse.json({ ok: false, reason: "invalid state" }, { status: 400 });
  }

  try {
    await supabase.from("recordings").update({ status: "PROCESSING" }).eq("id", recordingId);
    const { data: download } = await supabase.storage.from("recordings").download(recording.storage_path);
    const arrayBuffer = await download?.arrayBuffer();

    if (!arrayBuffer) throw new Error("Unable to download audio");

    const transcript = await openai.audio.transcriptions.create({
      file: new File([Buffer.from(arrayBuffer)], "audio.webm", { type: recording.mime_type }),
      model: "gpt-4o-mini-transcribe",
      response_format: "verbose_json",
      timestamp_granularities: ["word", "segment"]
    });

    const features = await computeFeatures(arrayBuffer);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_schema", json_schema: singingEvaluationSchema },
      messages: [
        {
          role: "system",
          content:
            "You are an expert vocal coach. Provide structured scoring, notes, and drills based on transcript, audio features, and metadata."
        },
        {
          role: "user",
            content: JSON.stringify({
              transcript: transcript.text,
              words: (transcript as any).words,
            durationSec: recording.duration_sec,
            genre: recording.genre,
            features
          })
        }
      ]
    });

    const evaluation = completion.choices[0]?.message?.parsed as any;

    await supabase.from("transcripts").upsert(
      {
        recording_id: recordingId,
        text: transcript.text,
        words_json: transcript
      },
      { onConflict: "recording_id" }
    );

    await supabase.from("feature_summaries").upsert(
      {
        recording_id: recordingId,
        voiced_pct: (features as any).voicedPct ?? null,
        median_f0_hz: (features as any).medianF0Hz ?? null,
        pitch_std_hz: (features as any).pitchStdHz ?? null,
        rms_avg: (features as any).rmsAvg ?? null,
        rms_std: (features as any).rmsStd ?? null,
        computed_json: (features as any).computedJson ?? null
      },
      { onConflict: "recording_id" }
    );

    await supabase.from("evaluations").upsert(
      {
        recording_id: recordingId,
        rubric_version: "v1",
        overall_score: evaluation?.overall_score ?? 0,
        scores_json: evaluation?.scores ?? {},
        highlights: evaluation?.highlights ?? [],
        bottlenecks: evaluation?.bottlenecks ?? [],
        timecoded_notes_json: evaluation?.timecoded_notes ?? [],
        drills_json: evaluation?.drills ?? [],
        coach_text: evaluation?.next_take_prompt ?? ""
      },
      { onConflict: "recording_id" }
    );

    await supabase.from("recordings").update({ status: "DONE" }).eq("id", recordingId);

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    await supabase
      .from("recordings")
      .update({ status: "FAILED", error_message: error.message })
      .eq("id", recordingId);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
