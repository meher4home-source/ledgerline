"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function NewClientPage() {
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("clients")
      .insert({ advisor_id: user!.id, name, email: email || null, notes: notes || null })
      .select()
      .single();

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push(`/dashboard/clients/${data.id}`);
  }

  return (
    <div className="mx-auto max-w-lg px-8 py-10">
      <Link href="/dashboard" className="font-mono text-xs text-ink-400">
        ← Back to clients
      </Link>
      <h1 className="mt-4 font-display text-3xl">Add a client</h1>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="block font-mono text-xs uppercase tracking-wide text-ink-500">
            Client name
          </label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-sm border border-ink-200 bg-parchment-100 px-3 py-2 outline-none focus:border-brass-500"
          />
        </div>
        <div>
          <label className="block font-mono text-xs uppercase tracking-wide text-ink-500">
            Email (optional)
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-sm border border-ink-200 bg-parchment-100 px-3 py-2 outline-none focus:border-brass-500"
          />
        </div>
        <div>
          <label className="block font-mono text-xs uppercase tracking-wide text-ink-500">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-sm border border-ink-200 bg-parchment-100 px-3 py-2 outline-none focus:border-brass-500"
          />
        </div>
        {error && <p className="text-sm text-oxblood-500">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded-sm bg-ink-900 px-5 py-2.5 font-mono text-sm text-parchment-100 hover:bg-ink-800 disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create client"}
        </button>
      </form>
    </div>
  );
}
