// Starter status page: proves the frontend can reach the FastAPI backend and sees the Supabase env vars.
// nextjs-developer replaces this with the real landing page.
export const dynamic = "force-dynamic";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function getHealth(): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(`${API_URL}/api/v1/health`, { cache: "no-store" });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

export default async function Home() {
  const health = await getHealth();
  const supabaseEnv = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const rows: [string, boolean][] = [
    ["Backend reachable", health !== null],
    ["Backend has Supabase keys", health?.supabase_configured === true],
    ["Backend has Anthropic key", health?.anthropic_configured === true],
    ["Frontend has Supabase keys", supabaseEnv],
  ];

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold">Hackathon Starter</h1>
      <ul className="flex flex-col gap-2">
        {rows.map(([label, ok]) => (
          <li key={label} className="flex items-center justify-between rounded-lg border border-black/10 px-4 py-3 text-sm dark:border-white/15">
            <span>{label}</span>
            <span className={ok ? "text-green-600" : "opacity-50"}>{ok ? "ready" : "not set"}</span>
          </li>
        ))}
      </ul>
      <p className="text-sm opacity-60">Run /kickoff in Claude Code to start building.</p>
    </main>
  );
}
