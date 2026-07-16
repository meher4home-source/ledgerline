"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink-900 px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-display text-xl italic text-parchment-100">
          LedgerLine
        </Link>
        <h1 className="mt-8 font-display text-2xl text-parchment-100">Sign in</h1>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block font-mono text-xs uppercase tracking-wide text-ink-300">
              Email
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
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <p className="mt-6 font-mono text-xs text-ink-400">
          No account yet?{" "}
          <Link href="/signup" className="text-brass-400 underline">
            Start a free trial
          </Link>
        </p>
      </div>
    </main>
  );
}
