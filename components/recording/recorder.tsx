"use client";

import { useEffect, useRef, useState } from "react";
import { createBrowserSupabase } from "../../lib/supabase";

export default function Recorder() {
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [chunks, setChunks] = useState<BlobPart[]>([]);
  const [status, setStatus] = useState<"idle" | "recording" | "stopped">("idle");
  const [duration, setDuration] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const timer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  const start = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    const localChunks: BlobPart[] = [];
    recorder.ondataavailable = (e) => localChunks.push(e.data);
    recorder.onstop = () => {
      setChunks(localChunks);
      const blob = new Blob(localChunks, { type: recorder.mimeType });
      setPreviewUrl(URL.createObjectURL(blob));
    };
    recorder.start();
    setStatus("recording");
    setDuration(0);
    timer.current = setInterval(() => {
      setDuration((d) => {
        if (d >= 60) {
          recorder.stop();
          setStatus("stopped");
          timer.current && clearInterval(timer.current);
          return 60;
        }
        return d + 1;
      });
    }, 1000);
    setMediaRecorder(recorder);
  };

  const stop = () => {
    mediaRecorder?.stop();
    setStatus("stopped");
    timer.current && clearInterval(timer.current);
  };

  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Max 60 seconds</p>
          <p className="text-2xl font-semibold">{duration}s</p>
        </div>
        {status === "recording" ? (
          <button onClick={stop} className="btn-primary">Stop</button>
        ) : (
          <button onClick={start} className="btn-primary">Start recording</button>
        )}
      </div>
      {previewUrl && (
        <audio controls src={previewUrl} className="w-full" />
      )}
      <p className="text-sm text-muted-foreground">
        After you save, the upload + scoring flow will call the API routes defined in this repo
        (create → upload to signed URL → commit → QStash job → OpenAI + DSP → DONE/FAILED).
      </p>
    </div>
  );
}
