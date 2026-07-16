import { createClient } from "@/lib/supabase/server";

export default async function BillingPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  return (
    <div className="mx-auto max-w-2xl px-8 py-10">
      <h1 className="font-display text-3xl">Billing</h1>

      <div className="mt-8 rounded-sm border border-ink-200 bg-parchment-100 p-6">
        <p className="font-mono text-xs uppercase tracking-wide text-ink-400">Status</p>
        <p className="mt-1 font-display text-xl capitalize">{profile?.subscription_status}</p>
        {profile?.subscription_status === "trial" && (
          <p className="mt-2 font-mono text-xs text-ink-400">
            Trial ends {new Date(profile.trial_ends_at).toLocaleDateString()}
          </p>
        )}
      </div>

      {profile?.subscription_status !== "active" && (
        <a
          href="/api/billing/checkout"
          className="mt-6 inline-block rounded-sm bg-brass-500 px-6 py-3 font-mono text-sm font-medium text-ink-900 hover:bg-brass-400"
        >
          Add payment method →
        </a>
      )}

      <p className="mt-4 font-mono text-xs text-ink-400">
        Billing is handled by Dodo Payments. You can manage or cancel your
        subscription any time from the confirmation email they send you
        after checkout.
      </p>
    </div>
  );
}
