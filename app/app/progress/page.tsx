import dynamic from "next/dynamic";
import { Suspense } from "react";

const Chart = dynamic(() => import("../../../components/trend-chart"), { ssr: false });

export default function ProgressPage() {
  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Progress</h1>
        <p className="text-sm text-muted-foreground">Trendlines for your recent evaluations.</p>
      </div>
      <Suspense fallback={<div className="card p-6">Loading charts...</div>}>
        <Chart />
      </Suspense>
    </main>
  );
}
