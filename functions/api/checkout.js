// POST /api/checkout — validates a booking request and creates a Stripe
// Checkout Session for the deposit. The amount always comes from the
// server-side catalogue, never from the browser.
//
// Required environment variable (Cloudflare Pages > Settings > Variables):
//   STRIPE_SECRET_KEY  (encrypted)  sk_test_... while testing, sk_live_... for launch
// Optional:
//   SITE_URL           e.g. https://innovamedicalaesthetics.co.uk (defaults to request origin)

import { SERVICES, LOCATIONS, CURRENCY } from "../_lib/catalog.js";

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

const clean = (v, max) => String(v ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max);

export async function onRequestPost({ request, env }) {
  if (!env.STRIPE_SECRET_KEY) {
    return json({ error: "Online booking isn't switched on yet. Please message us on Instagram to book." }, 503);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "We couldn't read your booking. Please try again." }, 400);
  }

  const service = SERVICES[body.service];
  const location = LOCATIONS[body.location];
  const name = clean(body.name, 80);
  const email = clean(body.email, 120);
  const phone = clean(body.phone, 30);
  const date = clean(body.date, 10);
  const time = clean(body.time, 12);
  const notes = clean(body.notes, 450);

  if (!service) return json({ error: "Choose a treatment." }, 400);
  if (!location) return json({ error: "Choose a clinic." }, 400);
  if (name.length < 2) return json({ error: "Enter your full name." }, 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "Enter a valid email address." }, 400);
  if (phone.replace(/\D/g, "").length < 10) return json({ error: "Enter a valid mobile number." }, 400);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || new Date(date + "T23:59:59Z") < new Date()) {
    return json({ error: "Choose a preferred date from tomorrow onwards." }, 400);
  }
  if (!["Morning", "Afternoon", "Evening"].includes(time)) return json({ error: "Choose a time of day." }, 400);
  if (body.adult !== true) return json({ error: "Treatments are for adults aged 18 and over." }, 400);
  if (body.terms !== true) return json({ error: "Please agree to the booking terms." }, 400);

  const origin = (env.SITE_URL || new URL(request.url).origin).replace(/\/$/, "");
  const prettyDate = new Date(date + "T12:00:00Z").toLocaleDateString("en-GB", {
    weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
  });

  const meta = {
    service: body.service,
    service_name: service.name,
    location: location.name,
    preferred_date: date,
    preferred_time: time,
    patient_name: name,
    patient_phone: phone,
    notes: notes || "-",
  };

  const p = new URLSearchParams();
  p.set("mode", "payment");
  p.set("customer_email", email);
  p.set("customer_creation", "always");
  p.set("line_items[0][quantity]", "1");
  p.set("line_items[0][price_data][currency]", CURRENCY);
  p.set("line_items[0][price_data][unit_amount]", String(service.deposit));
  p.set("line_items[0][price_data][product_data][name]", `Deposit: ${service.name}, ${location.name}`);
  p.set(
    "line_items[0][price_data][product_data][description]",
    `Preferred ${prettyDate}, ${time.toLowerCase()}. Taken off your treatment on the day.`
  );
  p.set("payment_intent_data[description]", `Innova deposit: ${service.name} (${location.name}) for ${name}`);
  for (const [k, v] of Object.entries(meta)) {
    p.set(`metadata[${k}]`, v);
    p.set(`payment_intent_data[metadata][${k}]`, v);
  }
  p.set("custom_text[submit][message]", "We'll message you to confirm your exact appointment time. Changes need 48 hours' notice.");
  p.set("success_url", `${origin}/booking-confirmed/?session_id={CHECKOUT_SESSION_ID}`);
  p.set("cancel_url", `${origin}/book/?cancelled=1&service=${body.service}&location=${body.location}`);

  let res, session;
  try {
    res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
        "content-type": "application/x-www-form-urlencoded",
      },
      body: p,
    });
    session = await res.json();
  } catch (e) {
    console.error("Stripe unreachable", e);
    return json({ error: "Payment couldn't be started. Please try again in a moment." }, 502);
  }
  if (!res.ok) {
    console.error("Stripe error", session?.error?.message);
    return json({ error: "Payment couldn't be started. Please try again in a moment." }, 502);
  }
  return json({ url: session.url });
}

export const onRequest = () => json({ error: "Method not allowed" }, 405);
