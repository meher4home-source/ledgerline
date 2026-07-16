import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, firm_name")
    .eq("id", user.id)
    .single();

  const isLive = process.env.DODO_PAYMENTS_ENVIRONMENT === "live_mode";
  const baseUrl = isLive ? "https://live.dodopayments.com" : "https://test.dodopayments.com";

  try {
    const res = await fetch(`${baseUrl}/checkouts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DODO_PAYMENTS_API_KEY}`,
      },
      body: JSON.stringify({
        product_cart: [{ product_id: process.env.DODO_PAYMENTS_PRODUCT_ID, quantity: 1 }],
        customer: {
          email: profile?.email ?? user.email,
          name: profile?.firm_name ?? "Advisor",
        },
        // We already run our own 14-day trial before this page is ever reached,
        // so the Dodo subscription itself starts billing immediately.
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
        // Dodo echoes this back on subscription/payment webhook events, which is
        // how the webhook handler knows which advisor to update.
        metadata: { advisor_id: user.id },
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      return NextResponse.json(
        { error: "Could not start checkout. Check your Dodo Payments env vars.", detail },
        { status: 500 }
      );
    }

    const session = await res.json();
    return NextResponse.redirect(session.checkout_url);
  } catch (err) {
    return NextResponse.json({ error: "Checkout request failed", detail: String(err) }, { status: 500 });
  }
}
