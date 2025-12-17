import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="space-y-10">
      <section className="card p-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Singing Coach</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Record up to 60 seconds, get AI-powered feedback, and track your vocal progress.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href="/login" className="btn-primary min-w-[160px]">Sign in</Link>
          <Link href="/signup" className="btn-secondary min-w-[160px]">Create account</Link>
        </div>
      </section>
      <section className="grid gap-4 sm:grid-cols-3">
        {[
          "Lightning-fast scoring and coaching",
          "Structured scorecards and drills",
          "Privacy-first storage with Supabase"
        ].map((item) => (
          <div key={item} className="card p-6 text-left">
            <p className="font-semibold">{item}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Delivering a production-ready MVP with modern, minimal UI and rock-solid backend pipelines.
            </p>
          </div>
        ))}
      </section>
    </main>
  );
}
