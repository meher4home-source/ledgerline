import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardHome() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  const { data: clients } = await supabase
    .from("clients")
    .select("id, name, email, created_at")
    .order("created_at", { ascending: false });

  const daysLeft =
    profile && profile.subscription_status === "trial"
      ? Math.max(
          0,
          Math.ceil(
            (new Date(profile.trial_ends_at).getTime() - Date.now()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : null;

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      {daysLeft !== null && (
        <div className="mb-8 flex items-center justify-between rounded-sm border border-brass-500 bg-brass-500/10 px-4 py-3">
          <p className="font-mono text-xs text-ink-700">
            Trial — {daysLeft} {daysLeft === 1 ? "day" : "days"} remaining
          </p>
          <Link href="/dashboard/billing" className="font-mono text-xs text-brass-600 underline">
            Add payment method
          </Link>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Clients</h1>
        <Link
          href="/dashboard/clients/new"
          className="rounded-sm bg-ink-900 px-4 py-2 font-mono text-sm text-parchment-100 hover:bg-ink-800"
        >
          + Add client
        </Link>
      </div>

      {!clients || clients.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="font-display text-xl text-ink-400">No clients yet</p>
          <p className="mt-2 text-sm text-ink-400">
            Add your first client to start building their ledger.
          </p>
        </div>
      ) : (
        <div className="mt-8 divide-y divide-ink-200 border-t border-ink-200">
          {clients.map((c) => (
            <Link
              key={c.id}
              href={`/dashboard/clients/${c.id}`}
              className="flex items-center justify-between px-2 py-4 hover:bg-parchment-100"
            >
              <div>
                <p className="font-display text-lg">{c.name}</p>
                {c.email && <p className="font-mono text-xs text-ink-400">{c.email}</p>}
              </div>
              <span className="font-mono text-xs text-ink-400">View ledger →</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
