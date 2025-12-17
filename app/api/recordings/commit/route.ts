import { NextResponse } from "next/server";
import { requireUser } from "../../../../lib/auth";
import { Client } from "@upstash/qstash";
import { createServiceSupabase } from "../../../../lib/supabase";

const qstash = new Client({ token: process.env.QSTASH_TOKEN ?? "" });

export async function POST(request: Request) {
  const user = await requireUser();
  const body = await request.json();
  const { recordingId, durationSec } = body as { recordingId: string; durationSec: number };

  if (!recordingId || typeof durationSec !== "number") {
    return NextResponse.json({ error: "recordingId and durationSec are required" }, { status: 400 });
  }

  if (durationSec > 60) {
    return NextResponse.json({ error: "Max recording duration is 60 seconds" }, { status: 400 });
  }

  const supabase = createServiceSupabase();
  const { data: recording, error } = await supabase
    .from("recordings")
    .update({ duration_sec: durationSec, status: "UPLOADED" })
    .eq("id", recordingId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error || !recording) {
    return NextResponse.json({ error: error?.message ?? "Recording not found" }, { status: 404 });
  }

  await qstash.publishJSON({
    url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/jobs/scoreRecording`,
    body: { recordingId },
    retries: 3
  });

  return NextResponse.json({ ok: true, recording });
}
