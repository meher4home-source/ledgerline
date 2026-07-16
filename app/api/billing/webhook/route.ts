import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "standardwebhooks";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

// Uses the service role key so it can write to profiles regardless of who's
// logged in - this endpoint is only ever called server-to-server by Dodo Payments.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const webhookHeaders = {
    "webhook-id": request.headers.get("webhook-id") ?? "",
    "webhook-signature": request.headers.get("webhook-signature") ?? "",
    "webhook-timestamp": request.headers.get("webhook-timestamp") ?? "",
  };

  const webhook = new Webhook(process.env.DODO_PAYMENTS_WEBHOOK_SECRET!);

  let payload: any;
  try {
    payload = webhook.verify(body, webhookHeaders);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // Dodo's payload shape has been consistent as { type, data: {...} } in every
  // integration example, but keep a fallback in case a future event uses
  // `event_type` instead - cheap insurance, doesn't hurt.
  const eventType: string = payload.type ?? payload.event_type ?? "";
  const data = payload.data ?? {};

  const advisorId: string | undefined =
    data.metadata?.advisor_id ?? payload.metadata?.advisor_id ?? data.subscription?.metadata?.advisor_id;
  const customerEmail: string | undefined = data.customer?.email;
  const customerId: string | undefined = data.customer?.customer_id;
  const subscriptionId: string | undefined = data.subscription_id ?? data.id;

  let subscriptionStatus: string | null = null;
  if (/active|created|renewed|succeeded|resumed/i.test(eventType)) {
    subscriptionStatus = "active";
  } else if (/cancel|expired/i.test(eventType)) {
    subscriptionStatus = "canceled";
  } else if (/fail|past_due|on_hold/i.test(eventType)) {
    subscriptionStatus = "past_due";
  }

  if (subscriptionStatus) {
    const update = {
      subscription_status: subscriptionStatus,
      dodo_customer_id: customerId ?? null,
      dodo_subscription_id: subscriptionId ?? null,
    };

    if (advisorId) {
      await supabaseAdmin.from("profiles").update(update).eq("id", advisorId);
    } else if (customerEmail) {
      // Fallback for events that don't echo metadata back - match on email instead.
      await supabaseAdmin.from("profiles").update(update).eq("email", customerEmail);
    }
  }

  return NextResponse.json({ received: true });
}
