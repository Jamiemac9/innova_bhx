// Static site generator for Innova Medical Aesthetics.
// `node build.mjs` writes the site to ./dist (Cloudflare Pages output dir).
import { mkdir, writeFile, cp, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { SITE, IMAGES, TREATMENTS, LOCATION_PAGES, GENERAL_FAQS, JOURNEY } from "./src/data.mjs";
import { SERVICES, LOCATIONS, formatGBP } from "./functions/_lib/catalog.js";

const OUT = "dist";
const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const abs = (p) => SITE.url.replace(/\/$/, "") + p;
const pages = [];

/* ---------- structured data ---------- */
const orgId = abs("/#organization");
const ldOrganization = () => ({
  "@type": ["MedicalBusiness", "MedicalClinic"],
  "@id": orgId,
  name: SITE.name,
  alternateName: SITE.shortName,
  url: abs("/"),
  logo: abs("/assets/img/logo.svg"),
  image: IMAGES.hero.src(1200),
  description: SITE.description,
  sameAs: [SITE.instagram],
  medicalSpecialty: "Dermatology",
  areaServed: [
    { "@type": "City", name: "Birmingham" },
    { "@type": "City", name: "London" },
  ],
  department: LOCATION_PAGES.map((l) => ({ "@id": abs(`/locations/${l.slug}/#clinic`) })),
  availableService: TREATMENTS.map((t) => ({ "@id": abs(`/treatments/${t.slug}/#service`) })),
  ...(SITE.email && { email: SITE.email }),
  ...(SITE.phone && { telephone: SITE.phone }),
});
const ldLocation = (l) => ({
  "@type": "MedicalClinic",
  "@id": abs(`/locations/${l.slug}/#clinic`),
  name: `${SITE.name} ${l.name}`,
  url: abs(`/locations/${l.slug}/`),
  image: IMAGES[l.image].src(1200),
  parentOrganization: { "@id": orgId },
  address: {
    "@type": "PostalAddress",
    ...(l.address.street && { streetAddress: l.address.street }),
    addressLocality: l.address.locality,
    addressRegion: l.address.region,
    ...(l.address.postcode && { postalCode: l.address.postcode }),
    addressCountry: l.address.country,
  },
  geo: { "@type": "GeoCoordinates", latitude: l.geo.lat, longitude: l.geo.lng },
  areaServed: l.areas.map((a) => ({ "@type": "Place", name: a })),
  sameAs: [SITE.instagram],
});
const ldService = (t) => ({
  "@type": "MedicalProcedure",
  "@id": abs(`/treatments/${t.slug}/#service`),
  name: t.title,
  description: t.answer,
  url: abs(`/treatments/${t.slug}/`),
  procedureType: "https://schema.org/NoninvasiveProcedure",
  provider: { "@id": orgId },
});
const ldFaq = (faqs) => ({
  "@type": "FAQPage",
  mainEntity: faqs.map(([q, a]) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
});
const ldCrumbs = (trail) => ({
  "@type": "BreadcrumbList",
  itemListElement: trail.map(([name, path], i) => ({
    "@type": "ListItem",
    position: i + 1,
    name,
    item: abs(path),
  })),
});
const ldWebPage = (path, title, desc, type = "WebPage") => ({
  "@type": type,
  "@id": abs(path) + "#webpage",
  url: abs(path),
  name: title,
  description: desc,
  isPartOf: { "@id": abs("/#website") },
  about: { "@id": orgId },
  inLanguage: "en-GB",
  lastReviewed: SITE.lastReviewed,
  dateModified: SITE.lastReviewed,
  ...(SITE.practitioner.name && {
    reviewedBy: { "@type": "Person", name: SITE.practitioner.name, jobTitle: SITE.practitioner.role },
  }),
});
const ldWebsite = () => ({
  "@type": "WebSite",
  "@id": abs("/#website"),
  url: abs("/"),
  name: SITE.name,
  publisher: { "@id": orgId },
  inLanguage: "en-GB",
});

/* ---------- layout ---------- */
const nav = [
  ["Treatments", "/#treatments"],
  ["Your journey", "/#journey"],
  ["Clinics", "/#clinics"],
  ["Questions", "/#questions"],
];

function head({ path, title, description, image = IMAGES.hero.src(1200), ld = [], preload }) {
  const graph = { "@context": "https://schema.org", "@graph": [ldWebsite(), ldOrganization(), ...ld] };
  return `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${abs(path)}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="#2B1D28">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(SITE.name)}">
<meta property="og:locale" content="en_GB">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${abs(path)}">
<meta property="og:image" content="${esc(image)}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/assets/fonts/bodoni-moda-latin-standard-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/hanken-grotesk-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preconnect" href="https://images.unsplash.com" crossorigin>
${preload ? `<link rel="preload" as="image" imagesrcset="${esc(preload.srcset)}" imagesizes="100vw" fetchpriority="high">` : ""}
<link rel="stylesheet" href="/assets/vendor/lenis.css">
<link rel="stylesheet" href="/assets/css/site.css">
<noscript><style>.hero{height:auto}.hero-stage{position:relative;min-height:100svh}.hero-mask,.hero-hint{display:none}.hero-copy{opacity:1}.hero-stage::after{opacity:1}.hero-img{transform:none}.manifesto-text .w{opacity:1}</style></noscript>
<script type="application/ld+json">${JSON.stringify(graph)}</script>
</head>`;
}

const logo = `<svg class="logo" viewBox="0 0 132 32" aria-hidden="true"><text x="0" y="25">innova</text></svg>`;

function header(current = "") {
  return `<a class="skip" href="#main">Skip to content</a>
<header class="site-header" data-header>
  <a class="brand" href="/" aria-label="${esc(SITE.name)} home">${logo}<span class="brand-sub">Medical Aesthetics</span></a>
  <nav class="nav" aria-label="Main">
    <ul>${nav.map(([l, h]) => `<li><a href="${h}">${l}</a></li>`).join("")}</ul>
  </nav>
  <a class="btn btn-small" href="/book/">Book</a>
  <button class="menu-toggle" aria-expanded="false" aria-controls="menu" data-menu-toggle><span class="sr">Menu</span><i></i><i></i></button>
</header>
<div class="menu" id="menu" hidden data-menu>
  <ul>
    ${nav.map(([l, h]) => `<li><a href="${h}">${l}</a></li>`).join("")}
    ${TREATMENTS.map((t) => `<li class="menu-sub"><a href="/treatments/${t.slug}/">${t.title}</a></li>`).join("")}
  </ul>
  <a class="btn" href="/book/">Book with a deposit</a>
</div>`;
}

function footer() {
  return `<footer class="site-footer">
  <div class="footer-mark" aria-hidden="true">innova</div>
  <div class="footer-grid">
    <div>
      <p class="footer-lead">Medically led aesthetics in Birmingham and London.</p>
      <a class="btn btn-light" href="/book/">Book a consultation</a>
    </div>
    <nav aria-label="Treatments"><h2>Treatments</h2><ul>${TREATMENTS.map((t) => `<li><a href="/treatments/${t.slug}/">${t.title}</a></li>`).join("")}</ul></nav>
    <nav aria-label="Clinics"><h2>Clinics</h2><ul>${LOCATION_PAGES.map((l) => `<li><a href="/locations/${l.slug}/">${l.name}</a></li>`).join("")}</ul></nav>
    <div><h2>Follow</h2><ul><li><a href="${SITE.instagram}" rel="noopener" target="_blank">Instagram ${SITE.instagramHandle}</a></li>${SITE.email ? `<li><a href="mailto:${SITE.email}">${SITE.email}</a></li>` : ""}${SITE.phone ? `<li><a href="tel:${SITE.phone.replace(/\s/g, "")}">${SITE.phone}</a></li>` : ""}</ul></div>
  </div>
  <div class="footer-legal">
    <p>Treatments are for adults aged 18 and over and are subject to a consultation. Results vary between individuals.</p>
    <p>© ${new Date().getFullYear()} ${SITE.name} · <a href="/terms/">Booking terms</a> · <a href="/privacy/">Privacy</a></p>
  </div>
</footer>
<a class="mobile-book" href="/book/" data-mobile-book>Book a consultation</a>
<script src="/assets/vendor/gsap.min.js" defer></script>
<script src="/assets/vendor/ScrollTrigger.min.js" defer></script>
<script src="/assets/vendor/lenis.min.js" defer></script>
<script src="/assets/js/site.js" defer></script>
</body>
</html>`;
}

const picture = (key, { sizes = "100vw", alt = "", cls = "", eager = false } = {}) => {
  const im = IMAGES[key];
  return `<img class="${cls}" src="${im.src(1200)}" srcset="${im.srcset}" sizes="${sizes}" alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
};

const faqList = (faqs) =>
  `<div class="faq">${faqs
    .map(([q, a]) => `<details><summary><h3>${esc(q)}</h3><span class="plus" aria-hidden="true"></span></summary><p>${esc(a)}</p></details>`)
    .join("")}</div>`;

const crumbsHtml = (trail) =>
  `<nav class="crumbs" aria-label="Breadcrumb"><ol>${trail
    .map(([n, p], i) => (i === trail.length - 1 ? `<li aria-current="page">${esc(n)}</li>` : `<li><a href="${p}">${esc(n)}</a></li>`))
    .join("")}</ol></nav>`;

const reviewed = () =>
  `<p class="reviewed">Medically reviewed${SITE.practitioner.name ? ` by ${esc(SITE.practitioner.name)}, ${esc(SITE.practitioner.role)}` : ""} · Updated ${new Date(SITE.lastReviewed).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>`;

function page(path, html) {
  pages.push({ path, html });
}

/* ---------- home ---------- */
const manifesto =
  "Good aesthetics should be quiet. You look rested, not altered. That takes a medical eye, a steady hand and the honesty to say when less is better. It's how every Innova appointment works, in Birmingham and in London.";

const treatmentCard = (t) => `
  <li class="t-card">
    <a href="/treatments/${t.slug}/">
      <figure>${picture(t.image, { sizes: "(min-width: 900px) 30vw, 80vw", alt: "" })}</figure>
      <h3>${t.title}</h3>
      <p>${t.card}</p>
      <span class="t-link">Read more<span class="sr"> about ${t.title.toLowerCase()}</span></span>
    </a>
  </li>`;

page(
  "/",
  head({
    path: "/",
    title: "Innova Medical Aesthetics | Birmingham & London Aesthetics Clinic",
    description: SITE.description,
    preload: IMAGES.hero,
    ld: [ldWebPage("/", "Innova Medical Aesthetics", SITE.description), ...LOCATION_PAGES.map(ldLocation), ldFaq(GENERAL_FAQS)],
  }) +
    `<body class="home">` +
    header() +
    `<main id="main">
<section class="hero" data-hero>
  <div class="hero-stage">
    ${picture("hero", { cls: "hero-img", eager: true, alt: "Woman with natural, glowing skin in warm evening light" })}
    <svg class="hero-mask" aria-hidden="true" data-hero-mask>
      <defs>
        <mask id="word-mask" maskUnits="userSpaceOnUse">
          <rect width="100%" height="100%" fill="#fff"/>
          <text class="mask-word" x="50%" y="50%" text-anchor="middle" dominant-baseline="central" fill="#000">innova</text>
        </mask>
      </defs>
      <rect width="100%" height="100%" fill="currentColor" mask="url(#word-mask)"/>
      <text class="mask-word mask-measure" x="50%" y="50%" text-anchor="middle" dominant-baseline="central" data-measure>innova</text>
    </svg>
    <p class="hero-hint" data-hero-hint aria-hidden="true">Scroll</p>
    <div class="hero-copy" data-hero-copy>
      <h1>Subtle work, medically led.</h1>
      <p>Anti-wrinkle consultations, fillers, skin boosters and vitamin injection consultations with a registered medical practitioner in Birmingham and London.</p>
      <div class="hero-ctas">
        <a class="btn btn-light" href="/book/">Book a consultation</a>
        <a class="btn btn-ghost" href="#treatments">See treatments</a>
      </div>
    </div>
  </div>
</section>

<section class="manifesto" aria-label="Our approach">
  <p class="manifesto-text" data-words>${manifesto}</p>
  <ul class="credentials">
    <li><strong>Registered medical practitioner</strong><span>Every appointment, start to finish</span></li>
    <li><strong>Birmingham and London</strong><span>Two clinics, one standard</span></li>
    <li><strong>Consultation first</strong><span>Clear plans, no pressure</span></li>
  </ul>
</section>

<section class="treatments" id="treatments" aria-labelledby="treatments-h">
  <div class="section-head">
    <h2 id="treatments-h">Treatments</h2>
    <p>Prescription treatments start with a consultation. Fillers and skin boosters can be booked as appointments.</p>
  </div>
  <h3 class="group-h">Fillers and skin boosters</h3>
  <ul class="t-rail" data-rail>${TREATMENTS.filter((t) => t.group === "treatment").map(treatmentCard).join("")}</ul>
  <h3 class="group-h">By consultation</h3>
  <ul class="t-rail" data-rail>${TREATMENTS.filter((t) => t.group === "consultation").map(treatmentCard).join("")}</ul>
</section>

<section class="journey" id="journey" aria-labelledby="journey-h" data-journey>
  <div class="journey-pin">
    <div class="journey-intro">
      <h2 id="journey-h">What happens when you book</h2>
      <p>Four steps, the same every time.</p>
    </div>
    <ol class="journey-track" data-journey-track>
      ${JOURNEY.map(
        ([h, p], i) => `<li class="j-step">
        <span class="j-num" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span>
        <h3>${h}</h3><p>${p}</p>
      </li>`
      ).join("")}
      <li class="j-step j-image" aria-hidden="true">${picture("clinician", { sizes: "(min-width: 900px) 40vw, 90vw" })}</li>
    </ol>
  </div>
</section>

<section class="practitioner" aria-labelledby="prac-h">
  <figure class="prac-img" data-parallax>${picture("portrait", { sizes: "(min-width: 900px) 45vw, 100vw", alt: "" })}</figure>
  <div class="prac-copy">
    <h2 id="prac-h">Medical first. Aesthetic always.</h2>
    <p>Innova is led by a ${SITE.practitioner.name ? `${esc(SITE.practitioner.name)}, a ` : ""}registered medical practitioner. That means a full medical history before any treatment, an honest view on what will and won't help, and the training to recognise and manage complications properly.</p>
    <p>It also means saying no when a treatment isn't right for you. Most people leave their first consultation with less planned than they expected, and happier for it.</p>
    ${SITE.practitioner.registration ? `<p class="reg">${esc(SITE.practitioner.registration)}</p>` : ""}
  </div>
</section>

<section class="clinics" id="clinics" aria-labelledby="clinics-h">
  <h2 id="clinics-h" class="sr">Our clinics</h2>
  ${LOCATION_PAGES.map(
    (l) => `<a class="clinic" href="/locations/${l.slug}/">
      <figure>${picture(l.image, { sizes: "(min-width: 900px) 50vw, 100vw", alt: "" })}</figure>
      <span class="clinic-name">${l.name}</span>
      <span class="clinic-cta">Visit the ${l.name} clinic</span>
    </a>`
  ).join("")}
</section>

<section class="questions" id="questions" aria-labelledby="faq-h">
  <div class="section-head"><h2 id="faq-h">Questions, answered</h2></div>
  ${faqList(GENERAL_FAQS)}
</section>

<section class="closing">
  <h2>Start with a conversation.</h2>
  <p>Pay a small deposit to secure your appointment. It comes off your treatment on the day.</p>
  <a class="btn" href="/book/">Book a consultation</a>
</section>
</main>` +
    footer()
);

/* ---------- treatment pages ---------- */
for (const t of TREATMENTS) {
  const path = `/treatments/${t.slug}/`;
  const svc = SERVICES[t.service];
  const trail = [["Home", "/"], ["Treatments", "/#treatments"], [t.title, path]];
  const faqs = [...t.faqs, ...GENERAL_FAQS.slice(0, 2)];
  page(
    path,
    head({
      path,
      title: t.metaTitle,
      description: t.metaDescription,
      image: IMAGES[t.image].src(1200),
      preload: IMAGES[t.image],
      ld: [ldWebPage(path, t.metaTitle, t.metaDescription, "MedicalWebPage"), ldService(t), ldFaq(faqs), ldCrumbs(trail)],
    }) +
      `<body class="inner">` +
      header() +
      `<main id="main">
<section class="page-hero">
  ${picture(t.image, { cls: "page-hero-img", eager: true, alt: "" })}
  <div class="page-hero-copy">
    ${crumbsHtml(trail)}
    <h1>${t.h1}</h1>
  </div>
</section>
<article class="article">
  <div class="answer" id="summary">
    <h2>In short</h2>
    <p>${t.answer}</p>
  </div>
  ${t.sections.map((s) => `<section><h2>${s.h}</h2>${s.p.map((p) => `<p>${p}</p>`).join("")}</section>`).join("")}
  <aside class="book-box">
    <h2>Book ${svc.prescription ? "your consultation" : "your appointment"}</h2>
    <p>Secure a slot in Birmingham or London with a ${formatGBP(svc.deposit)} deposit, taken off your treatment on the day.</p>
    <a class="btn" href="/book/?service=${t.service}">Book with a deposit</a>
  </aside>
  <section><h2>Common questions</h2>${faqList(faqs)}</section>
  ${reviewed()}
  <nav class="related" aria-label="Other treatments"><h2>Other treatments</h2><ul>${TREATMENTS.filter((x) => x !== t)
    .map((x) => `<li><a href="/treatments/${x.slug}/">${x.title}</a></li>`)
    .join("")}</ul></nav>
</article>
</main>` +
      footer()
  );
}

/* ---------- location pages ---------- */
for (const l of LOCATION_PAGES) {
  const path = `/locations/${l.slug}/`;
  const trail = [["Home", "/"], ["Clinics", "/#clinics"], [l.name, path]];
  const faqs = [
    [`Where is Innova's ${l.name} clinic?`, l.address.street ? `${l.address.street}, ${l.address.locality} ${l.address.postcode}.` : `Innova sees patients in ${l.name}. The full clinic address is sent with your booking confirmation.`],
    [`What treatments are available in ${l.name}?`, `Anti-wrinkle consultations, dermal fillers, skin boosters and vitamin injection consultations, all with a registered medical practitioner.`],
    ...GENERAL_FAQS.slice(2, 4),
  ];
  page(
    path,
    head({
      path,
      title: l.metaTitle,
      description: l.metaDescription,
      image: IMAGES[l.image].src(1200),
      preload: IMAGES[l.image],
      ld: [ldWebPage(path, l.metaTitle, l.metaDescription), ldLocation(l), ldFaq(faqs), ldCrumbs(trail)],
    }) +
      `<body class="inner">` +
      header() +
      `<main id="main">
<section class="page-hero">
  ${picture(l.image, { cls: "page-hero-img", eager: true, alt: `${l.name} skyline` })}
  <div class="page-hero-copy">${crumbsHtml(trail)}<h1>${l.h1}</h1></div>
</section>
<article class="article">
  <div class="answer"><h2>In short</h2><p>${l.intro}</p></div>
  <section><h2>Treatments in ${l.name}</h2><ul class="link-list">${TREATMENTS.map((t) => `<li><a href="/treatments/${t.slug}/">${t.title}</a><span>${t.card}</span></li>`).join("")}</ul></section>
  <section><h2>Visiting</h2>
    <p>${l.address.street ? `${esc(l.address.street)}, ${esc(l.address.locality)} ${esc(l.address.postcode)}` : `The full address is sent with your booking confirmation.`}</p>
    ${l.hours ? `<p>Opening hours: ${esc(l.hours)}</p>` : ""}
    <p>Patients visit us from ${l.areas.join(", ")}.</p>
  </section>
  <aside class="book-box"><h2>Book in ${l.name}</h2><p>Choose your treatment and pay a deposit to secure your appointment.</p><a class="btn" href="/book/?location=${l.slug}">Book in ${l.name}</a></aside>
  <section><h2>Common questions</h2>${faqList(faqs)}</section>
  ${reviewed()}
</article>
</main>` +
      footer()
  );
}

/* ---------- booking ---------- */
const serviceOptions = Object.entries(SERVICES)
  .map(([k, s]) => `<label class="choice"><input type="radio" name="service" value="${k}" required><span><b>${s.name}</b><em>${formatGBP(s.deposit)} deposit</em></span></label>`)
  .join("");
page(
  "/book/",
  head({
    path: "/book/",
    title: "Book a Consultation | Innova Medical Aesthetics",
    description: "Book a consultation or appointment at Innova Medical Aesthetics in Birmingham or London. Secure your slot with a deposit, taken off your treatment on the day.",
    ld: [ldWebPage("/book/", "Book with Innova", "Book a consultation or appointment with a deposit.")],
  }) +
    `<body class="inner light booking">` +
    header() +
    `<main id="main" class="book">
  <div class="book-intro">
    <h1>Book your appointment</h1>
    <p>Choose a treatment and clinic, tell us when suits you, then pay a deposit securely with Stripe. We'll message you to confirm your exact time. Your deposit comes off your treatment on the day.</p>
    <p class="cancelled" hidden data-cancelled>Payment was cancelled, so nothing has been booked. Your details are still here if you'd like to try again.</p>
  </div>
  <form class="book-form" data-book-form novalidate>
    <fieldset><legend>Treatment</legend><div class="choices">${serviceOptions}</div></fieldset>
    <fieldset><legend>Clinic</legend><div class="choices choices-2">${Object.entries(LOCATIONS)
      .map(([k, l]) => `<label class="choice"><input type="radio" name="location" value="${k}" required><span><b>${l.name}</b></span></label>`)
      .join("")}</div></fieldset>
    <fieldset><legend>When suits you</legend>
      <div class="row">
        <label class="field"><span>Preferred date</span><input type="date" name="date" required></label>
        <label class="field"><span>Time of day</span><select name="time" required><option value="">Choose</option><option>Morning</option><option>Afternoon</option><option>Evening</option></select></label>
      </div>
    </fieldset>
    <fieldset><legend>Your details</legend>
      <label class="field"><span>Full name</span><input name="name" autocomplete="name" required maxlength="80"></label>
      <div class="row">
        <label class="field"><span>Email</span><input type="email" name="email" autocomplete="email" required maxlength="120"></label>
        <label class="field"><span>Mobile</span><input type="tel" name="phone" autocomplete="tel" required maxlength="30" inputmode="tel"></label>
      </div>
      <label class="field"><span>Anything we should know? <i>(optional)</i></span><textarea name="notes" rows="3" maxlength="500"></textarea></label>
    </fieldset>
    <label class="check"><input type="checkbox" name="adult" required><span>I'm 18 or over.</span></label>
    <label class="check"><input type="checkbox" name="terms" required><span>I agree to the <a href="/terms/" target="_blank">booking terms</a>, including the 48-hour notice period for changes.</span></label>
    <p class="form-error" role="alert" data-form-error></p>
    <button class="btn btn-wide" type="submit" data-submit>Continue to secure payment</button>
    <p class="fine">Payments are processed by Stripe. We never see or store your card details.</p>
  </form>
</main>` +
    footer()
);

page(
  "/booking-confirmed/",
  head({ path: "/booking-confirmed/", title: "Deposit received | Innova Medical Aesthetics", description: "Your deposit has been received." }).replace(
    '<meta name="robots" content="index, follow, max-image-preview:large">',
    '<meta name="robots" content="noindex">'
  ) +
    `<body class="inner light booking">` +
    header() +
    `<main id="main" class="book confirmed">
  <h1>Deposit received</h1>
  <p data-confirm-summary>Thank you. We'll message you shortly to confirm your exact appointment time.</p>
  <p>A receipt is on its way to your email. If you need to change anything, message us on <a href="${SITE.instagram}" rel="noopener" target="_blank">Instagram</a>.</p>
  <a class="btn" href="/">Back to home</a>
</main>` +
    footer()
);

/* ---------- legal ---------- */
const legal = (path, title, body) =>
  page(
    path,
    head({ path, title: `${title} | ${SITE.name}`, description: `${title} for ${SITE.name}.` }) +
      `<body class="inner light">` +
      header() +
      `<main id="main" class="article legal"><h1>${title}</h1>${body}</main>` +
      footer()
  );

// TODO: clinic to confirm the policy below before launch.
legal(
  "/terms/",
  "Booking terms",
  `<p>These terms apply when you pay a deposit to book with ${SITE.name}.</p>
<h2>Deposits</h2><p>A deposit secures your appointment and is taken off the cost of your treatment or consultation on the day.</p>
<h2>Changes and cancellations</h2><p>You can move your appointment once, with at least 48 hours' notice, and your deposit transfers to the new date. Deposits are not refundable for missed appointments or for changes made with less than 48 hours' notice.</p>
<h2>Suitability</h2><p>All treatments are subject to a consultation. If your practitioner decides a treatment isn't suitable for you, your deposit will be refunded in full.</p>
<h2>Age</h2><p>We only treat adults aged 18 and over. Photo ID may be requested.</p>
<h2>Contact</h2><p>To change a booking, message us on <a href="${SITE.instagram}">Instagram</a>.</p>`
);
legal(
  "/privacy/",
  "Privacy",
  `<p>${SITE.name} collects the details you give when booking (name, email, mobile number, preferred date and any notes) to arrange and confirm your appointment.</p>
<h2>Payments</h2><p>Deposits are processed by Stripe. Your booking details are stored with your payment record in Stripe. We never receive or store your card details.</p>
<h2>Medical information</h2><p>Medical history is taken at your consultation and kept securely as part of your clinical record.</p>
<h2>Your rights</h2><p>You can ask to see, correct or delete your personal information at any time by contacting us.</p>
<h2>Cookies</h2><p>This site does not use advertising or tracking cookies.</p>`
);

/* ---------- 404 ---------- */
page(
  "/404.html",
  head({ path: "/404.html", title: `Page not found | ${SITE.name}`, description: "Page not found." }).replace('content="index, follow, max-image-preview:large"', 'content="noindex"') +
    `<body class="inner light">` +
    header() +
    `<main id="main" class="book confirmed"><h1>That page isn't here</h1><p>It may have moved. Try our treatments or book an appointment.</p><a class="btn" href="/">Go to the home page</a></main>` +
    footer()
);

/* ---------- crawler files ---------- */
const indexable = pages.filter((p) => !["/404.html", "/booking-confirmed/"].includes(p.path));
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexable.map((p) => `  <url><loc>${abs(p.path)}</loc><lastmod>${SITE.lastReviewed}</lastmod></url>`).join("\n")}
</urlset>`;

const robots = `# Search engines and AI answer engines are welcome.
User-agent: *
Allow: /
Disallow: /api/
Disallow: /booking-confirmed/

User-agent: GPTBot
Allow: /
User-agent: OAI-SearchBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: Claude-SearchBot
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Google-Extended
Allow: /
User-agent: Applebot-Extended
Allow: /

Sitemap: ${abs("/sitemap.xml")}
`;

const llms = `# ${SITE.name}

> ${SITE.description}

${SITE.name} (Instagram ${SITE.instagramHandle}) is a medically led aesthetics clinic with locations in Birmingham and London, UK. All consultations and treatments are carried out by a registered medical practitioner${SITE.practitioner.name ? ` (${SITE.practitioner.name}${SITE.practitioner.registration ? `, ${SITE.practitioner.registration}` : ""})` : ""}. Patients book online by paying a deposit, which is deducted from the treatment cost.

## Treatments
${TREATMENTS.map((t) => `- [${t.title}](${abs(`/treatments/${t.slug}/`)}): ${t.answer}`).join("\n")}

## Clinics
${LOCATION_PAGES.map((l) => `- [${l.name}](${abs(`/locations/${l.slug}/`)}): ${l.intro}`).join("\n")}

## Booking
- [Book an appointment](${abs("/book/")}): choose a treatment and clinic and pay a deposit via Stripe.
- [Booking terms](${abs("/terms/")})

## Frequently asked questions
${GENERAL_FAQS.map(([q, a]) => `- ${q} ${a}`).join("\n")}
`;

/* ---------- write ---------- */
await rm(OUT, { recursive: true, force: true });
await cp("public", OUT, { recursive: true });
for (const p of pages) {
  const file = p.path.endsWith(".html") ? join(OUT, p.path) : join(OUT, p.path, "index.html");
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, p.html);
}
await writeFile(join(OUT, "sitemap.xml"), sitemap);
await writeFile(join(OUT, "robots.txt"), robots);
await writeFile(join(OUT, "llms.txt"), llms);
console.log(`Built ${pages.length} pages to ./${OUT}`);
