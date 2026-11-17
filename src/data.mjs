// Site content. Everything a non-developer may need to change lives here.
// Lines marked TODO need real details from the clinic before launch.

export const SITE = {
  name: "Innova Medical Aesthetics",
  shortName: "Innova",
  // TODO: replace with the custom domain once it is attached in Cloudflare.
  url: "https://innova-bhx.pages.dev",
  description:
    "Advanced medical aesthetics in Birmingham and London, led by a qualified doctor and nurse. Anti-wrinkle consultations, dermal fillers, skin boosters and vitamin injection consultations.",
  instagram: "https://www.instagram.com/innova_birm",
  instagramHandle: "@innova_birm",
  // TODO: add a public email and phone if the clinic wants them shown.
  email: "",
  phone: "",
  // TODO: names and registration numbers. Showing these builds trust with
  // patients and with AI answer engines. Leave a name blank to hide that person.
  team: [
    { name: "", role: "Doctor", registration: "" }, // e.g. "GMC 1234567"
    { name: "", role: "Nurse", registration: "" }, // e.g. "NMC 12A3456E"
  ],
  lastReviewed: "2026-11-17",
};

const u = (id, w = 1600, extra = "") =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=72${extra}`;

export const img = (id) => ({
  id,
  src: (w) => u(id, w),
  srcset: [480, 800, 1200, 1600, 2200].map((w) => `${u(id, w)} ${w}w`).join(", "),
});

// Placeholder photography (free Unsplash licence). Swap for the clinic's own
// photos when available: real clinic and practitioner images rank and convert better.
export const IMAGES = {
  hero: img("1695990190064-e8ca2ca16af6"),
  texture: img("1675773051474-55c4b7d2cf53"),
  portrait: img("1673970561722-9f1dec556bdd"),
  calm: img("1581182800629-7d90925ad072"),
  antiWrinkle: img("1728727217834-b190862837a3"),
  fillers: img("1785861084191-3600dfc2a6d6"),
  boosters: img("1544717304-a2db4a7b16ee"),
  vitamins: img("1784294331171-6deaf6847268"),
  clinician: img("1713085085470-fba013d67e65"),
  serum: img("1764694187667-f28a05a52c0e"),
  birmingham: img("1548860258-be5cfff4f165"),
  birminghamCanal: img("1602230986242-b0e2b80e1ce5"),
  london: img("1513026705753-bc3fffca8bf4"),
  men: img("1775127741091-cb7c89cedc78"),
  room: img("1762625570087-6d98fca29531"),
};

export const TREATMENTS = [
  {
    slug: "anti-wrinkle",
    service: "anti-wrinkle-consultation",
    title: "Anti-wrinkle consultation",
    h1: "Anti-wrinkle consultations in Birmingham and London",
    metaTitle: "Anti-Wrinkle Consultation Birmingham & London | Innova",
    metaDescription:
      "Book an anti-wrinkle consultation with a qualified prescriber in Birmingham or London. Face-to-face assessment, honest advice and a plan made for you.",
    card: "A face-to-face assessment of expression lines with a prescriber, before anything is agreed.",
    image: "antiWrinkle",
    group: "consultation",
    answer:
      "An anti-wrinkle consultation is a face-to-face appointment with a qualified prescriber who assesses your expression lines, medical history and goals, explains your options, risks and alternatives, and decides with you whether a prescription treatment is suitable. Nothing is prescribed without this consultation.",
    sections: [
      {
        h: "What happens at your consultation",
        p: [
          "You'll talk through what you'd like to change and why. Your practitioner looks at how your face moves at rest and in expression, and takes a full medical history, including medicines, allergies, pregnancy and previous treatments.",
          "If a prescription treatment is suitable, you'll be told exactly what's proposed, the realistic result, the possible side effects and what aftercare involves. You can take time to think before going ahead.",
        ],
      },
      {
        h: "Why a consultation comes first",
        p: [
          "Treatments for expression lines are prescription-only medicines in the UK. They can only be prescribed after an in-person assessment by a qualified prescriber, which protects you and means your plan is built around your face rather than a menu.",
        ],
      },
      {
        h: "Who it's for",
        p: [
          "Adults aged 18 and over who want softer frown lines, forehead lines or crow's feet. It's not suitable during pregnancy or breastfeeding, or with certain neuromuscular conditions. Your practitioner will check this with you.",
        ],
      },
    ],
    faqs: [
      [
        "How long do results from prescription anti-wrinkle treatment last?",
        "Results usually last around three to four months, though it varies from person to person. Your practitioner will talk you through what to expect for you.",
      ],
      [
        "Is the deposit for the consultation or the treatment?",
        "The deposit secures your consultation slot. If you go ahead with treatment, it's taken off the cost on the day.",
      ],
    ],
  },
  {
    slug: "dermal-fillers",
    service: "dermal-fillers",
    title: "Dermal fillers",
    h1: "Dermal fillers in Birmingham and London",
    metaTitle: "Dermal Fillers Birmingham & London | Lips, Cheeks, Jawline | Innova",
    metaDescription:
      "Hyaluronic acid dermal fillers for lips, cheeks, chin and jawline, by a qualified doctor or nurse in Birmingham and London. Natural, balanced results.",
    card: "Hyaluronic acid filler to restore volume and refine lips, cheeks, chin and jawline.",
    image: "fillers",
    group: "treatment",
    answer:
      "Dermal fillers are gel injections, most often made of hyaluronic acid, used to restore lost volume and shape features such as the lips, cheeks, chin and jawline. Results are visible straight away, settle over about two weeks, and usually last between six and eighteen months depending on the area and product.",
    sections: [
      {
        h: "Areas we treat",
        p: [
          "Lips for shape, hydration and definition. Cheeks to restore support lost with age. Chin and jawline for balance and profile. Every plan starts with how your features relate to each other, not with a syringe count.",
        ],
      },
      {
        h: "What to expect",
        p: [
          "Your appointment starts with an assessment and medical history. Filler is placed with a fine needle or cannula, usually with local anaesthetic mixed in for comfort. Swelling and some bruising are common for a few days.",
          "We review you at around two weeks, once everything has settled, and adjust if needed.",
        ],
      },
      {
        h: "Safety",
        p: [
          "Hyaluronic acid filler can be dissolved if ever needed. Being treated by a doctor or nurse means complications are recognised early and managed properly.",
        ],
      },
    ],
    faqs: [
      [
        "How long do dermal fillers last?",
        "Typically six to eighteen months. Lips tend to be at the shorter end; cheeks and jawline often last longer.",
      ],
      [
        "Do fillers hurt?",
        "Most people describe mild discomfort. Most fillers contain local anaesthetic, and numbing cream can be used.",
      ],
    ],
  },
  {
    slug: "skin-boosters",
    service: "skin-boosters",
    title: "Skin boosters",
    h1: "Skin boosters in Birmingham and London",
    metaTitle: "Skin Boosters Birmingham & London | Hydration & Glow | Innova",
    metaDescription:
      "Injectable skin boosters to improve hydration, texture and glow, delivered by a qualified doctor or nurse in Birmingham and London.",
    card: "Injectable hydration that improves texture, firmness and glow from within.",
    image: "boosters",
    group: "treatment",
    answer:
      "Skin boosters are injectable treatments, usually based on hyaluronic acid, that hydrate the skin from within to improve texture, firmness and radiance. Unlike filler, they don't change shape or add volume. They're usually given as a course of two sessions about four weeks apart, then maintained every six months or so.",
    sections: [
      {
        h: "What skin boosters do",
        p: [
          "They spread a fine layer of hydration through the skin, helping it look smoother, plumper and more even. Popular areas are the face, neck, décolletage and hands.",
        ],
      },
      {
        h: "Your course",
        p: [
          "Most plans are two sessions, around four weeks apart. You may see small bumps at the injection points for a day or two; these settle on their own.",
        ],
      },
    ],
    faqs: [
      [
        "When will I see results from skin boosters?",
        "Most people notice better hydration within a couple of weeks, with the full effect a few weeks after the second session.",
      ],
      [
        "Are skin boosters the same as filler?",
        "No. Skin boosters improve the quality of the skin. Filler changes shape and volume.",
      ],
    ],
  },
  {
    slug: "vitamin-injections",
    service: "vitamin-injection-consultation",
    title: "Vitamin injection consultation",
    h1: "Vitamin injection consultations in Birmingham and London",
    metaTitle: "Vitamin Injection Consultation Birmingham & London | Innova",
    metaDescription:
      "Book a vitamin injection consultation with a qualified prescriber in Birmingham or London. Medical history first, so any treatment is right for you.",
    card: "A medical consultation to check whether a vitamin injection is appropriate for you.",
    image: "vitamins",
    group: "consultation",
    answer:
      "A vitamin injection consultation is an appointment with a qualified prescriber to review your medical history and decide whether a vitamin injection, such as vitamin B12, is appropriate for you. Some vitamin injections are prescription-only, so the consultation always comes first.",
    sections: [
      {
        h: "Your consultation",
        p: [
          "Your practitioner asks about your health, diet, medicines and any symptoms, and explains what a vitamin injection can and can't do. If it's appropriate, they'll talk you through the plan and aftercare.",
        ],
      },
      {
        h: "When we'll suggest your GP instead",
        p: [
          "If anything in your history needs investigating, such as signs of a deficiency that hasn't been diagnosed, we'll advise you to see your GP first. That's part of being treated by a medical practitioner.",
        ],
      },
    ],
    faqs: [
      [
        "Do I need a consultation before a vitamin injection?",
        "Yes. Some vitamin injections are prescription-only medicines, and a medical history is needed to make sure they're safe for you.",
      ],
    ],
  },
];

export const LOCATION_PAGES = [
  {
    slug: "birmingham",
    name: "Birmingham",
    h1: "Medical aesthetics in Birmingham",
    metaTitle: "Aesthetics Clinic Birmingham | Fillers, Skin Boosters | Innova",
    metaDescription:
      "Innova Medical Aesthetics in Birmingham: anti-wrinkle consultations, dermal fillers, skin boosters and vitamin injection consultations with a qualified doctor and nurse.",
    image: "birmingham",
    // TODO: real address and postcode. Leave blank to hide; fill in for local SEO.
    address: { street: "", locality: "Birmingham", region: "West Midlands", postcode: "", country: "GB" },
    geo: { lat: 52.4797, lng: -1.9026 },
    hours: "", // TODO e.g. "Tue–Sat, 10:00–19:00"
    intro:
      "Our Birmingham clinic is home base: unhurried appointments, a medical-first approach and results that look like you on a good day.",
    areas: ["Birmingham city centre", "Solihull", "Edgbaston", "Sutton Coldfield", "Moseley", "Harborne"],
  },
  {
    slug: "london",
    name: "London",
    h1: "Medical aesthetics in London",
    metaTitle: "Aesthetics Clinic London | Fillers, Skin Boosters | Innova",
    metaDescription:
      "Innova Medical Aesthetics in London: anti-wrinkle consultations, dermal fillers, skin boosters and vitamin injection consultations with a qualified doctor and nurse.",
    image: "london",
    address: { street: "", locality: "London", region: "Greater London", postcode: "", country: "GB" },
    geo: { lat: 51.5072, lng: -0.1276 },
    hours: "",
    intro:
      "The same doctor and nurse and the same standards, in London. Ideal if you live or work in the city and want medically led care without compromise.",
    areas: ["Central London"],
  },
];

export const GENERAL_FAQS = [
  [
    "Who carries out treatments at Innova?",
    "Every consultation and treatment is carried out by our qualified doctor or nurse, never a beautician or trainee.",
  ],
  [
    "Where are Innova's clinics?",
    "Innova Medical Aesthetics sees patients in Birmingham and London.",
  ],
  [
    "How does the booking deposit work?",
    "You pay a deposit online to secure your appointment. It's taken off the cost of your treatment on the day. We then message you to confirm your exact appointment time.",
  ],
  [
    "Can I move my appointment?",
    "Yes, with at least 48 hours' notice your deposit moves to your new date. Deposits for missed appointments or changes with less notice are not refundable.",
  ],
  [
    "Can under-18s be treated?",
    "No. It is illegal in England to give anti-wrinkle injections or dermal fillers for cosmetic purposes to anyone under 18, and we treat adults only.",
  ],
  [
    "Is there any downtime?",
    "Most people go back to normal activities the same day. Small bumps, redness, swelling or bruising can last a few days. We'll give you written aftercare.",
  ],
];

// The patient journey is a genuine sequence, so it is numbered on the page.
export const JOURNEY = [
  ["Consultation", "We listen first. Your goals, your history, your face in motion. No pressure, no upsell."],
  ["Your plan", "A clear recommendation, with costs, risks and alternatives, written down so you can decide in your own time."],
  ["Treatment", "Precise, unhurried work by our qualified doctor or nurse, in a calm clinical room."],
  ["Two-week review", "We check how you've settled and fine-tune if needed. Aftercare doesn't end when you leave."],
];
