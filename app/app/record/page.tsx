import Recorder from "../../../components/recording/recorder";

export default function RecordPage() {
  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Record</h1>
        <p className="text-sm text-muted-foreground">Capture your take and submit for AI scoring.</p>
      </div>
      <Recorder />
    </main>
  );
}
