import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PrintButton from "@/components/PrintButton";
import {
  type Property,
  type StockHolding,
  capRate,
  cashOnCashReturn,
  propertyEquity,
  totalStockValue,
  totalRealEstateEquity,
  totalOtherDebt,
  netWorth,
  formatCurrency,
  formatPercent,
} from "@/lib/calculations";

async function fetchLivePrices(tickers: string[]): Promise<Record<string, number>> {
  const apiKey = process.env.TWELVE_DATA_API_KEY;
  if (!apiKey || tickers.length === 0) return {};
  try {
    const symbols = tickers.join(",");
    const res = await fetch(
      `https://api.twelvedata.com/price?symbol=${encodeURIComponent(symbols)}&apikey=${apiKey}`,
      { cache: "no-store" }
    );
    const data = await res.json();
    const prices: Record<string, number> = {};
    if (tickers.length === 1) {
      if (data?.price) prices[tickers[0].toUpperCase()] = parseFloat(data.price);
    } else {
      for (const t of tickers) {
        const entry = data?.[t.toUpperCase()];
        if (entry?.price) prices[t.toUpperCase()] = parseFloat(entry.price);
      }
    }
    return prices;
  } catch {
    return {};
  }
}

export default async function ReportPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: client }] = await Promise.all([
    supabase.from("clients").select("*").eq("id", params.id).single(),
  ]);

  const { data: profile } = await supabase
    .from("profiles")
    .select("firm_name")
    .eq("id", user.id)
    .single();

  const [{ data: stocks }, { data: properties }, { data: debts }] = await Promise.all([
    supabase.from("stock_holdings").select("*").eq("client_id", params.id),
    supabase.from("properties").select("*").eq("client_id", params.id),
    supabase.from("debts").select("*").eq("client_id", params.id),
  ]);

  const stockList: StockHolding[] = stocks ?? [];
  const propertyList: Property[] = properties ?? [];
  const debtList = debts ?? [];

  const livePrices = await fetchLivePrices(stockList.map((s) => s.ticker));

  const stockValue = totalStockValue(stockList, livePrices);
  const reEquity = totalRealEstateEquity(propertyList);
  const otherDebt = totalOtherDebt(debtList);
  const nw = netWorth(stockValue, reEquity, otherDebt);

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="print-page mx-auto max-w-3xl px-10 py-12">
      <div className="no-print mb-8 flex justify-end">
        <PrintButton />
      </div>

      <div className="border-b-2 border-ink-900 pb-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-400">
          {profile?.firm_name ?? "LedgerLine"}
        </p>
        <h1 className="mt-2 font-display text-3xl italic">Net Worth Statement</h1>
        <p className="mt-1 font-mono text-xs text-ink-400">
          {client?.name} — prepared {today}
        </p>
      </div>

      <div className="mt-8">
        <p className="font-mono text-xs uppercase tracking-wide text-ink-400">Total net worth</p>
        <p className="mt-1 font-display text-5xl">{formatCurrency(nw)}</p>
      </div>

      <div className="mt-10">
        <h2 className="font-display text-xl border-b border-ink-200 pb-2">Equities</h2>
        {stockList.length === 0 ? (
          <p className="mt-3 font-mono text-xs text-ink-400">None on file.</p>
        ) : (
          <table className="mt-3 w-full font-mono text-sm">
            <thead>
              <tr className="text-left text-xs text-ink-400">
                <th className="py-1 font-normal">Ticker</th>
                <th className="py-1 font-normal">Shares</th>
                <th className="py-1 font-normal">Price</th>
                <th className="py-1 font-normal">Value</th>
              </tr>
            </thead>
            <tbody>
              {stockList.map((s) => {
                const price = livePrices[s.ticker.toUpperCase()] ?? s.avg_cost;
                return (
                  <tr key={s.id} className="border-t border-ink-100">
                    <td className="py-1.5">{s.ticker}</td>
                    <td className="py-1.5">{s.shares}</td>
                    <td className="py-1.5">{formatCurrency(price)}</td>
                    <td className="py-1.5">{formatCurrency(s.shares * price)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        <p className="mt-2 text-right font-mono text-sm">
          Subtotal: {formatCurrency(stockValue)}
        </p>
      </div>

      <div className="mt-10">
        <h2 className="font-display text-xl border-b border-ink-200 pb-2">Real estate</h2>
        {propertyList.length === 0 ? (
          <p className="mt-3 font-mono text-xs text-ink-400">None on file.</p>
        ) : (
          <table className="mt-3 w-full font-mono text-sm">
            <thead>
              <tr className="text-left text-xs text-ink-400">
                <th className="py-1 font-normal">Property</th>
                <th className="py-1 font-normal">Value</th>
                <th className="py-1 font-normal">Loan</th>
                <th className="py-1 font-normal">Equity</th>
                <th className="py-1 font-normal">Cap rate</th>
                <th className="py-1 font-normal">CoC return</th>
              </tr>
            </thead>
            <tbody>
              {propertyList.map((p) => (
                <tr key={p.id} className="border-t border-ink-100">
                  <td className="py-1.5">{p.address}</td>
                  <td className="py-1.5">{formatCurrency(p.current_value)}</td>
                  <td className="py-1.5">{formatCurrency(p.loan_balance)}</td>
                  <td className="py-1.5">{formatCurrency(propertyEquity(p))}</td>
                  <td className="py-1.5">{formatPercent(capRate(p))}</td>
                  <td className="py-1.5">{formatPercent(cashOnCashReturn(p))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p className="mt-2 text-right font-mono text-sm">
          Subtotal (equity): {formatCurrency(reEquity)}
        </p>
      </div>

      <div className="mt-10">
        <h2 className="font-display text-xl border-b border-ink-200 pb-2">Other debt</h2>
        {debtList.length === 0 ? (
          <p className="mt-3 font-mono text-xs text-ink-400">None on file.</p>
        ) : (
          <table className="mt-3 w-full font-mono text-sm">
            <thead>
              <tr className="text-left text-xs text-ink-400">
                <th className="py-1 font-normal">Name</th>
                <th className="py-1 font-normal">Lender</th>
                <th className="py-1 font-normal">Balance</th>
              </tr>
            </thead>
            <tbody>
              {debtList.map((d) => (
                <tr key={d.id} className="border-t border-ink-100">
                  <td className="py-1.5">{d.name}</td>
                  <td className="py-1.5">{d.lender ?? "—"}</td>
                  <td className="py-1.5">{formatCurrency(d.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p className="mt-2 text-right font-mono text-sm">
          Subtotal: -{formatCurrency(otherDebt)}
        </p>
      </div>

      <p className="mt-14 border-t border-ink-200 pt-4 font-mono text-[10px] text-ink-400">
        Prepared for informational purposes only. Market prices are delayed
        and may not reflect real-time values. This statement is not a
        substitute for official custodian or brokerage statements.
      </p>
    </div>
  );
}
