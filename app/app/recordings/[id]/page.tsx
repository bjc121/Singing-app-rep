import Link from "next/link";

export default function RecordingDetail({ params }: { params: { id: string } }) {
  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Recording detail</h1>
          <p className="text-sm text-muted-foreground">Recording ID: {params.id}</p>
        </div>
        <Link href="/app/record" className="btn-secondary">
          Redo attempt
        </Link>
      </div>
      <div className="card p-6">
        <p className="font-semibold">Playback + scorecard</p>
        <p className="text-sm text-muted-foreground">
          Wire this view to /api/recordings/[id] for full transcript, evaluation, and feature data.
        </p>
      </div>
    </main>
  );
}
