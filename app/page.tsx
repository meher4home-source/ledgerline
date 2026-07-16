import Link from "next/link";

function LedgerBar() {
  // Signature visual: a composition bar styled like a ledger tally,
  // showing how a client's net worth breaks down across asset classes.
  const segments = [
    { label: "Equities", pct: 38, color: "#B08D3F" },
    { label: "Real estate equity", pct: 41, color: "#3D6650" },
    { label: "Cash & other", pct: 13, color: "#6B7295" },
    { label: "Less: debt", pct: 8, color: "#7A3B34" },
  ];
  return (
    <div className="w-full max-w-xl">
      <div className="flex items-baseline justify-between mb-3 font-mono text-xs uppercase tracking-[0.2em] text-ink-300">
        <span>Sample client — composed net worth</span>
        <span>$4,180,000</span>
      </div>
      <div className="flex h-10 w-full overflow-hidden rounded-sm border border-ink-700">
        {segments.map((s) => (
          <div
            key={s.label}
            style={{ width: `${s.pct}%`, backgroundColor: s.color }}
            className="h-full"
          />
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 font-mono text-xs text-ink-300">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            <span>{s.label}</span>
            <span className="ml-auto text-ink-400">{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <main>
      {/* Header */}
      <header className="border-b border-ink-700 bg-ink-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <span className="font-display text-xl italic text-parchment-100">
            LedgerLine
          </span>
          <nav className="flex items-center gap-6 font-mono text-sm text-ink-200">
            <a href="#pricing" className="hover:text-parchment-100">
              Pricing
            </a>
            <Link href="/login" className="hover:text-parchment-100">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-sm bg-brass-500 px-4 py-2 text-ink-900 font-medium hover:bg-brass-400"
            >
              Start free trial
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-ink-900 text-parchment-100">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-24 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-brass-400">
              Built for RIAs with real-estate-heavy clients
            </p>
            <h1 className="font-display text-4xl leading-tight italic sm:text-5xl">
              One ledger. Every asset your client owns.
            </h1>
            <p className="mt-6 max-w-md text-ink-200">
              Your highest-net-worth clients don&apos;t hold just equities.
              LedgerLine puts their stocks, their rental properties, and their
              debt on a single line — so you stop rebuilding the same net
              worth statement in three different spreadsheets.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <Link
                href="/signup"
                className="rounded-sm bg-brass-500 px-6 py-3 font-medium text-ink-900 hover:bg-brass-400"
              >
                Start your 14-day trial
              </Link>
              <span className="font-mono text-xs text-ink-400">
                No card required
              </span>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <LedgerBar />
          </div>
        </div>
      </section>

      {/* Problem / solution */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-10 sm:grid-cols-3">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-brass-600">
              01 — Portfolio
            </p>
            <h3 className="mt-3 font-display text-2xl">Equities, live</h3>
            <p className="mt-2 text-sm text-ink-500">
              Add each client&apos;s holdings once. Prices refresh from the
              market, no manual re-pricing before every meeting.
            </p>
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-brass-600">
              02 — Real estate
            </p>
            <h3 className="mt-3 font-display text-2xl">Deal-grade analysis</h3>
            <p className="mt-2 text-sm text-ink-500">
              Cap rate, cash-on-cash return, and equity are calculated
              automatically from purchase price, rent, and loan terms.
            </p>
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-brass-600">
              03 — Debt
            </p>
            <h3 className="mt-3 font-display text-2xl">Nothing hidden</h3>
            <p className="mt-2 text-sm text-ink-500">
              Mortgages, credit lines, and personal loans net against the
              assets they&apos;re tied to — a true net worth, not a gross one.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-parchment-300 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-display text-3xl italic">How a firm gets started</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-4">
            {[
              ["Add a client", "Name and a few notes. Takes ten seconds."],
              ["Enter holdings", "Stocks, properties, and debts — pulled from what you already track."],
              ["Review the ledger", "One net worth number, broken into what makes it up."],
              ["Send the report", "A clean, printable statement, branded to your firm."],
            ].map(([title, body], i) => (
              <div key={title as string} className="border-t-2 border-ink-800 pt-4">
                <p className="font-mono text-xs text-ink-400">{`0${i + 1}`}</p>
                <h4 className="mt-2 font-display text-lg">{title}</h4>
                <p className="mt-1 text-sm text-ink-500">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-display text-3xl italic">Priced per firm, not per client</h2>
        <p className="mt-2 max-w-lg text-sm text-ink-500">
          Every plan includes unlimited clients. A 14-day trial, no card
          required, so your team can run it against real accounts first.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {[
            {
              name: "Solo",
              price: "$249",
              blurb: "One advisor, unlimited clients.",
              features: ["Unlimited clients", "Live equity pricing", "Printable reports"],
            },
            {
              name: "Team",
              price: "$899",
              blurb: "Up to 10 advisor seats.",
              features: ["Everything in Solo", "10 advisor seats", "Firm branding on reports"],
              featured: true,
            },
            {
              name: "Family Office",
              price: "$2,400",
              blurb: "Unlimited seats, priority support.",
              features: ["Everything in Team", "Unlimited seats", "Priority onboarding call"],
            },
          ].map((tier) => (
            <div
              key={tier.name}
              className={`rounded-sm border p-6 ${
                tier.featured
                  ? "border-brass-500 bg-ink-900 text-parchment-100"
                  : "border-ink-200 bg-parchment-100"
              }`}
            >
              <h3 className="font-display text-xl">{tier.name}</h3>
              <p
                className={`mt-1 text-sm ${
                  tier.featured ? "text-ink-300" : "text-ink-500"
                }`}
              >
                {tier.blurb}
              </p>
              <p className="mt-4 font-mono text-3xl">
                {tier.price}
                <span className="text-sm font-normal">/mo</span>
              </p>
              <ul className="mt-6 space-y-2 font-mono text-xs">
                {tier.features.map((f) => (
                  <li key={f}>— {f}</li>
                ))}
              </ul>
              <Link
                href="/signup"
                className={`mt-8 block rounded-sm px-4 py-2 text-center text-sm font-medium ${
                  tier.featured
                    ? "bg-brass-500 text-ink-900 hover:bg-brass-400"
                    : "bg-ink-900 text-parchment-100 hover:bg-ink-800"
                }`}
              >
                Start trial
              </Link>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-ink-200 py-10">
        <div className="mx-auto max-w-6xl px-6 font-mono text-xs text-ink-400">
          LedgerLine — a net worth ledger for advisors.
        </div>
      </footer>
    </main>
  );
}
