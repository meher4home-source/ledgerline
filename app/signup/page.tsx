"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [firmName, setFirmName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setLoading(false);
      setError(error.message);
      return;
    }

    // The DB trigger (handle_new_user) creates the profiles row automatically.
    // We just add the firm name on top of it, if the session is already active
    // (i.e. email confirmation is disabled in Supabase Auth settings).
    if (data.user) {
      await supabase.from("profiles").update({ firm_name: firmName }).eq("id", data.user.id);
    }

    setLoading(false);

    if (data.session) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setDone(true);
    }
  }

  if (done) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ink-900 px-6 text-center">
        <div>
          <h1 className="font-display text-2xl text-parchment-100">Check your email</h1>
          <p className="mt-3 max-w-sm font-mono text-sm text-ink-300">
            We sent a confirmation link. Click it, then come back and sign in.
          </p>
          <Link href="/login" className="mt-6 inline-block text-brass-400 underline">
            Go to sign in
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink-900 px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-display text-xl italic text-parchment-100">
          LedgerLine
        </Link>
        <h1 className="mt-8 font-display text-2xl text-parchment-100">Start your trial</h1>
        <p className="mt-2 font-mono text-xs text-ink-400">
          14 days free. No card required.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block font-mono text-xs uppercase tracking-wide text-ink-300">
              Firm name
            </label>
            <input
              type="text"
              required
              value={firmName}
              onChange={(e) => setFirmName(e.target.value)}
              className="mt-1 w-full rounded-sm border border-ink-600 bg-ink-800 px-3 py-2 text-parchment-100 outline-none focus:border-brass-500"
            />
          </div>
          <div>
            <label className="block font-mono text-xs uppercase tracking-wide text-ink-300">
              Work email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-sm border border-ink-600 bg-ink-800 px-3 py-2 text-parchment-100 outline-none focus:border-brass-500"
            />
          </div>
          <div>
            <label className="block font-mono text-xs uppercase tracking-wide text-ink-300">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-sm border border-ink-600 bg-ink-800 px-3 py-2 text-parchment-100 outline-none focus:border-brass-500"
            />
          </div>
          {error && <p className="text-sm text-oxblood-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-sm bg-brass-500 px-4 py-2 font-medium text-ink-900 hover:bg-brass-400 disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Start free trial"}
          </button>
        </form>
        <p className="mt-6 font-mono text-xs text-ink-400">
          Already have an account?{" "}
          <Link href="/login" className="text-brass-400 underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
