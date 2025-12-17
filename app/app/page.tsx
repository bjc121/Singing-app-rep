import Link from "next/link";

const cards = [
  {
    title: "New recording",
    description: "Capture up to 60 seconds and submit for scoring.",
    href: "/app/record"
  },
  {
    title: "Progress",
    description: "View trendlines for your vocal metrics.",
    href: "/app/progress"
  }
];

export default function DashboardPage() {
  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Recent recordings and coaching at a glance.</p>
        </div>
        <Link className="btn-primary" href="/app/record">
          New recording
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.title} href={card.href} className="card p-6 hover:shadow-md">
            <p className="text-lg font-semibold">{card.title}</p>
            <p className="text-sm text-muted-foreground">{card.description}</p>
          </Link>
        ))}
      </div>
      <div className="card p-6">
        <p className="font-semibold">Recent recordings</p>
        <p className="text-sm text-muted-foreground">
          API endpoints are wired for Supabase persistence. Connect your keys to begin storing data.
        </p>
      </div>
    </main>
  );
}
