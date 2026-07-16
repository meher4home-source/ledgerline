import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const trialExpired =
    profile &&
    profile.subscription_status === "trial" &&
    new Date(profile.trial_ends_at) < new Date();

  const locked = trialExpired || profile?.subscription_status === "past_due" || profile?.subscription_status === "canceled";

  return (
    <div className="flex min-h-screen bg-parchment-200">
      <Sidebar firmName={profile?.firm_name ?? "My Firm"} />
      <div className="flex-1">
        {locked ? (
          <div className="mx-auto max-w-lg px-6 py-24 text-center">
            <h1 className="font-display text-2xl">Your trial has ended</h1>
            <p className="mt-3 text-sm text-ink-500">
              Add a payment method to keep client ledgers, live pricing, and
              reports active.
            </p>
            <a
              href="/dashboard/billing"
              className="mt-6 inline-block rounded-sm bg-brass-500 px-5 py-2.5 font-medium text-ink-900 hover:bg-brass-400"
            >
              Go to billing
            </a>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
