import { NextResponse } from "next/server";
import { requireUser } from "../../../../../lib/auth";
import { createServiceSupabase } from "../../../../../lib/supabase";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const user = await requireUser();
  const supabase = createServiceSupabase();
  const { data: parent, error } = await supabase
    .from("recordings")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (error || !parent) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const mimeType = parent.mime_type || "audio/webm";
  const extension = mimeType.split("/")[1] ?? "webm";
  const recordingId = crypto.randomUUID();
  const storagePath = `recordings/${user.id}/${recordingId}.${extension}`;

  const { data: recording, error: insertError } = await supabase
    .from("recordings")
    .insert({
      id: recordingId,
      user_id: user.id,
      duration_sec: 0,
      storage_path: storagePath,
      mime_type: mimeType,
      status: "CREATED",
      genre: parent.genre,
      parent_recording_id: parent.id
    })
    .select()
    .single();

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

  const { data: signedUploadUrl, error: storageError } = await supabase.storage
    .from("recordings")
    .createSignedUploadUrl(recording.storage_path, 600, { contentType: mimeType });
  if (storageError) return NextResponse.json({ error: storageError.message }, { status: 500 });

  return NextResponse.json({
    recordingId: recording.id,
    storagePath: recording.storage_path,
    signedUploadUrl,
    maxSeconds: 60
  });
}
