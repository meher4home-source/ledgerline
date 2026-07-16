"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Sidebar({ firmName }: { firmName: string }) {
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="no-print flex h-screen w-56 flex-col justify-between border-r border-ink-200 bg-ink-900 px-4 py-6">
      <div>
        <Link href="/dashboard" className="font-display text-lg italic text-parchment-100">
          LedgerLine
        </Link>
        <p className="mt-1 truncate font-mono text-xs text-ink-400">{firmName}</p>
        <nav className="mt-10 space-y-1 font-mono text-sm">
          <Link
            href="/dashboard"
            className="block rounded-sm px-3 py-2 text-ink-200 hover:bg-ink-800 hover:text-parchment-100"
          >
            Clients
          </Link>
          <Link
            href="/dashboard/billing"
            className="block rounded-sm px-3 py-2 text-ink-200 hover:bg-ink-800 hover:text-parchment-100"
          >
            Billing
          </Link>
        </nav>
      </div>
      <button
        onClick={handleSignOut}
        className="text-left font-mono text-xs text-ink-400 hover:text-parchment-100"
      >
        Sign out
      </button>
    </aside>
  );
}
