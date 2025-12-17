import { NextResponse } from "next/server";
import { requireUser } from "../../../../lib/auth";
import { createServiceSupabase } from "../../../../lib/supabase";

export async function POST(request: Request) {
  const user = await requireUser();
  const body = await request.json();
  const { mimeType, extension, genre } = body;

  if (!mimeType || !extension) {
    return NextResponse.json({ error: "mimeType and extension are required" }, { status: 400 });
  }

  const recordingId = crypto.randomUUID();
  const storagePath = `recordings/${user.id}/${recordingId}.${extension}`;

  const supabase = createServiceSupabase();
  const { data: recording, error: insertError } = await supabase
    .from("recordings")
    .insert({
      id: recordingId,
      user_id: user.id,
      duration_sec: 0,
      storage_path: storagePath,
      mime_type: mimeType,
      status: "CREATED",
      genre,
      parent_recording_id: null
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  const { data: signedUploadUrl, error } = await supabase.storage
    .from("recordings")
    .createSignedUploadUrl(recording.storage_path, 600, { contentType: mimeType });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    recordingId: recording.id,
    storagePath: recording.storage_path,
    signedUploadUrl,
    maxSeconds: 60
  });
}
