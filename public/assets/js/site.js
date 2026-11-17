/* Innova — interactions. Progressive enhancement: the site works without JS. */
(() => {
  const doc = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  const motion = hasGsap && !reduce;
  if (!motion) doc.classList.add("no-motion");

  /* ---------- header, menu, mobile CTA ---------- */
  const header = document.querySelector("[data-header]");
  const mobileBook = document.querySelector("[data-mobile-book]");
  const hero = document.querySelector("[data-hero]");
  const pageHero = document.querySelector(".page-hero");
  let lastY = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    const threshold = hero ? hero.offsetHeight - window.innerHeight * 0.9 : pageHero ? pageHero.offsetHeight - 80 : 10;
    header.classList.toggle("is-solid", y > threshold);
    header.classList.toggle("is-hidden", y > lastY && y > 200 && !document.body.classList.contains("menu-open"));
    if (mobileBook) mobileBook.classList.toggle("is-visible", y > (hero ? hero.offsetHeight * 0.75 : 400));
    lastY = y;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const toggle = document.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("[data-menu]");
  if (toggle && menu) {
    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      menu.hidden = !open;
      document.body.classList.toggle("menu-open", open);
      if (window.__lenis) open ? window.__lenis.stop() : window.__lenis.start();
    };
    toggle.addEventListener("click", () => setOpen(menu.hidden));
    menu.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !menu.hidden) { setOpen(false); toggle.focus(); } });
  }

  /* ---------- booking form ---------- */
  initBooking();
  initConfirmation();

  if (!motion) return;

  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);

  /* Smooth scrolling on pointer devices; touch keeps native scrolling. */
  if (typeof window.Lenis !== "undefined") {
    const lenis = new window.Lenis({ lerp: 0.09, smoothWheel: true });
    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"], a[href^="/#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href").replace(/^\//, "");
        if (location.pathname !== "/" && a.getAttribute("href").startsWith("/#")) return;
        const el = id.length > 1 && document.querySelector(id);
        if (el) { e.preventDefault(); lenis.scrollTo(el, { offset: -20 }); }
      });
    });
  }

  /* ---------- hero: zoom through the word ---------- */
  if (hero) {
    const mask = hero.querySelector("[data-hero-mask]");
    const measure = hero.querySelector("[data-measure]");
    const img = hero.querySelector(".hero-img");
    const copy = hero.querySelector("[data-hero-copy]");
    const hint = hero.querySelector("[data-hero-hint]");
    const stage = hero.querySelector(".hero-stage");

    // Zoom towards the stem of the first "i" so the screen fills with photograph.
    const setOrigin = () => {
      try {
        const box = measure.getExtentOfChar(0);
        const ox = box.x + box.width * 0.5;
        const oy = box.y + box.height * 0.62;
        gsap.set(mask, { transformOrigin: `${ox}px ${oy}px` });
      } catch (_) {
        gsap.set(mask, { transformOrigin: "50% 50%" });
      }
    };
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { setOrigin(); ScrollTrigger.refresh(); });
    window.addEventListener("resize", setOrigin);

    gsap.from(mask, { opacity: 0, duration: 1.4, ease: "power2.out" });
    gsap.from(img, { scale: 1.35, duration: 2.4, ease: "power3.out" });

    const tl = gsap.timeline({
      scrollTrigger: { trigger: hero, start: "top top", end: "bottom bottom", scrub: 0.6 },
    });
    tl.to(hint, { opacity: 0, duration: 0.1 }, 0)
      .to(mask, { scale: 60, ease: "power3.in", duration: 0.55 }, 0)
      .to(mask, { opacity: 0, duration: 0.08 }, 0.47)
      .to(img, { scale: 1, ease: "none", duration: 0.7 }, 0)
      .to(stage, { "--shade": 1, duration: 0.2 }, 0.55)
      .fromTo(copy, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" }, 0.62)
      .to({}, { duration: 0.15 });
  }

  /* ---------- manifesto: words light up as you read ---------- */
  document.querySelectorAll("[data-words]").forEach((el) => {
    el.innerHTML = el.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(" ");
    gsap.to(el.querySelectorAll(".w"), {
      opacity: 1,
      stagger: 0.1,
      ease: "none",
      scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: true },
    });
  });

  /* ---------- journey: horizontal on desktop ---------- */
  const journey = document.querySelector("[data-journey]");
  if (journey) {
    ScrollTrigger.matchMedia({
      "(min-width: 900px)": () => {
        const track = journey.querySelector("[data-journey-track]");
        const distance = () => track.scrollWidth - window.innerWidth;
        gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: journey.querySelector(".journey-pin"),
            start: "top top",
            end: () => "+=" + distance(),
            pin: true,
            scrub: 0.5,
            invalidateOnRefresh: true,
          },
        });
      },
    });
  }

  /* ---------- gentle parallax ---------- */
  document.querySelectorAll("[data-parallax] img").forEach((im) => {
    gsap.fromTo(im, { yPercent: -10 }, {
      yPercent: 0, ease: "none",
      scrollTrigger: { trigger: im.parentElement, start: "top bottom", end: "bottom top", scrub: true },
    });
  });

  /* ---------- inner page hero settle ---------- */
  const ph = document.querySelector(".page-hero-img");
  if (ph) gsap.from(ph, { scale: 1.12, duration: 2, ease: "power3.out" });

  /* ---------- helpers ---------- */
  function initBooking() {
    const form = document.querySelector("[data-book-form]");
    if (!form) return;
    const params = new URLSearchParams(location.search);
    const pre = (name, val) => {
      const el = val && form.querySelector(`input[name="${name}"][value="${CSS.escape(val)}"]`);
      if (el) el.checked = true;
    };
    pre("service", params.get("service"));
    pre("location", params.get("location"));
    if (params.get("cancelled")) document.querySelector("[data-cancelled]").hidden = false;

    // Restore details after a cancelled payment.
    try {
      const saved = JSON.parse(sessionStorage.getItem("innova-booking") || "null");
      if (saved && params.get("cancelled")) {
        for (const [k, v] of Object.entries(saved)) {
          const els = form.querySelectorAll(`[name="${k}"]`);
          els.forEach((el) => {
            if (el.type === "radio") el.checked = el.value === v;
            else if (el.type !== "checkbox") el.value = v;
          });
        }
      }
    } catch (_) {}

    const date = form.querySelector('input[name="date"]');
    const today = new Date();
    today.setDate(today.getDate() + 1);
    date.min = today.toISOString().slice(0, 10);

    const err = form.querySelector("[data-form-error]");
    const btn = form.querySelector("[data-submit]");
    const label = btn.textContent;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      err.textContent = "";
      form.querySelectorAll("[aria-invalid]").forEach((el) => el.removeAttribute("aria-invalid"));
      const invalid = [...form.elements].filter((el) => el.willValidate && !el.checkValidity());
      if (invalid.length) {
        invalid.forEach((el) => el.setAttribute("aria-invalid", "true"));
        const first = invalid[0];
        const what =
          first.name === "service" ? "Choose a treatment." :
          first.name === "location" ? "Choose a clinic." :
          first.name === "adult" ? "Please confirm you're 18 or over." :
          first.name === "terms" ? "Please agree to the booking terms." :
          first.type === "email" ? "Enter a valid email address." :
          "Fill in the highlighted fields.";
        err.textContent = what;
        first.focus();
        return;
      }
      const data = Object.fromEntries(new FormData(form));
      data.adult = !!data.adult;
      data.terms = !!data.terms;
      try { sessionStorage.setItem("innova-booking", JSON.stringify({ ...data, adult: undefined, terms: undefined })); } catch (_) {}
      btn.disabled = true;
      btn.textContent = "Opening secure payment…";
      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(data),
        });
        const out = await res.json().catch(() => ({}));
        if (!res.ok || !out.url) throw new Error(out.error || "Payment couldn't be started. Please try again.");
        location.href = out.url;
      } catch (ex) {
        err.textContent = ex.message;
        btn.disabled = false;
        btn.textContent = label;
      }
    });
  }

  function initConfirmation() {
    const el = document.querySelector("[data-confirm-summary]");
    const id = new URLSearchParams(location.search).get("session_id");
    if (!el || !id) return;
    fetch("/api/session?id=" + encodeURIComponent(id))
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => {
        if (!s || !s.paid) return;
        el.textContent = `Thank you, ${s.firstName}. Your ${s.amount} deposit for a ${s.service.toLowerCase()} in ${s.location} is confirmed. We'll message you shortly to confirm your exact time.`;
        try { sessionStorage.removeItem("innova-booking"); } catch (_) {}
      })
      .catch(() => {});
  }
})();
