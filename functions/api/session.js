// GET /api/session?id=cs_... — returns a minimal, non-sensitive summary of a
// completed Checkout Session for the confirmation page.
import { formatGBP } from "../_lib/catalog.js";

export async function onRequestGet({ request, env }) {
  const id = new URL(request.url).searchParams.get("id") || "";
  const headers = { "content-type": "application/json", "cache-control": "no-store" };
  if (!env.STRIPE_SECRET_KEY || !/^cs_(test|live)_[A-Za-z0-9]+$/.test(id)) {
    return new Response(JSON.stringify({ paid: false }), { status: 400, headers });
  }
  const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${id}`, {
    headers: { authorization: `Bearer ${env.STRIPE_SECRET_KEY}` },
  });
  if (!res.ok) return new Response(JSON.stringify({ paid: false }), { status: 404, headers });
  const s = await res.json();
  const m = s.metadata || {};
  return new Response(
    JSON.stringify({
      paid: s.payment_status === "paid",
      firstName: (m.patient_name || "").split(" ")[0],
      service: m.service_name || "appointment",
      location: m.location || "",
      amount: formatGBP(s.amount_total || 0),
    }),
    { headers }
  );
}
