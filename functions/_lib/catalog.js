// Single source of truth for bookable services and deposit amounts.
// Imported by the static site build (build.mjs) AND the Stripe checkout
// function, so the price a patient sees is always the price they are charged.
//
// TODO (clinic to confirm): deposit amounts below are placeholders.
// Amounts are in pence.

export const LOCATIONS = {
  birmingham: { name: "Birmingham" },
  london: { name: "London" },
};

export const SERVICES = {
  "anti-wrinkle-consultation": {
    name: "Anti-wrinkle consultation",
    deposit: 3000,
    // Prescription-only treatment: we only ever promote the consultation.
    prescription: true,
  },
  "dermal-fillers": {
    name: "Dermal filler appointment",
    deposit: 5000,
    prescription: false,
  },
  "skin-boosters": {
    name: "Skin booster appointment",
    deposit: 5000,
    prescription: false,
  },
  "vitamin-injection-consultation": {
    name: "Vitamin injection consultation",
    deposit: 2000,
    prescription: true,
  },
};

export const CURRENCY = "gbp";

export const formatGBP = (pence) =>
  "£" + (pence / 100).toFixed(pence % 100 === 0 ? 0 : 2);
