import { NextRequest, NextResponse } from "next/server";

// Fetches live prices for one or more tickers via Twelve Data's free tier.
// Called as /api/stocks/quote?symbols=AAPL,MSFT,TSLA
export async function GET(request: NextRequest) {
  const symbols = request.nextUrl.searchParams.get("symbols");
  const apiKey = process.env.TWELVE_DATA_API_KEY;

  if (!symbols) {
    return NextResponse.json({ error: "symbols query param required" }, { status: 400 });
  }
  if (!apiKey) {
    // No key configured yet - fail quietly so the UI falls back to cost basis.
    return NextResponse.json({}, { status: 200 });
  }

  try {
    const res = await fetch(
      `https://api.twelvedata.com/price?symbol=${encodeURIComponent(symbols)}&apikey=${apiKey}`,
      { next: { revalidate: 60 } } // cache for 60s to stay well within the free rate limit
    );
    const data = await res.json();

    const tickers = symbols.split(",");
    const prices: Record<string, number> = {};

    if (tickers.length === 1) {
      // Single-symbol response shape: { price: "123.45" }
      if (data?.price) prices[tickers[0].toUpperCase()] = parseFloat(data.price);
    } else {
      // Multi-symbol response shape: { AAPL: { price: "..." }, MSFT: { price: "..." } }
      for (const t of tickers) {
        const entry = data?.[t.toUpperCase()];
        if (entry?.price) prices[t.toUpperCase()] = parseFloat(entry.price);
      }
    }

    return NextResponse.json(prices);
  } catch {
    return NextResponse.json({}, { status: 200 });
  }
}
