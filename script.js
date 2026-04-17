/* ============================================================
   DIYAR RESTAURANT — ENHANCED INTERACTIONS
   All pages: loader · word-reveal · particles · scroll-reveal · parallax · card-tilt
   Subpages:  contact beacon · events candles · menu border · about connector
   ============================================================ */

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

const navToggle = $(".nav__toggle");
const navMenu   = $(".nav__menu");
const navEl     = $(".nav");
const navLinks  = $$(".nav__menu a");
const page      = document.body.dataset.page;

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;


/* ---------- Year ---------- */
$$("[id='year']").forEach((el) => { el.textContent = new Date().getFullYear(); });


/* ---------- Active Nav Link ---------- */
if (page) {
  const active = $(`[data-nav="${page}"]`);
  if (active) active.classList.add("is-active");
}


/* ---------- Mobile Nav Toggle ---------- */
if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!expanded));
    navMenu.classList.toggle("is-open");
  });
  navLinks.forEach((link) =>
    link.addEventListener("click", () => {
      navToggle.setAttribute("aria-expanded", "false");
      navMenu.classList.remove("is-open");
    })
  );
  document.addEventListener("click", (e) => {
    if (navMenu.classList.contains("is-open") &&
        !navMenu.contains(e.target) && !navToggle.contains(e.target)) {
      navToggle.setAttribute("aria-expanded", "false");
      navMenu.classList.remove("is-open");
    }
  });
}


/* ---------- Nav Scroll State ---------- */
if (navEl) {
  const tick = () => navEl.classList.toggle("is-scrolled", window.scrollY > 60);
  tick();
  window.addEventListener("scroll", tick, { passive: true });
}


/* ============================================================
   PAGE LOADER
   ============================================================ */

function createLoader() {
  if (reducedMotion) return;

  const makeRing = (r, dashes, opacity) => {
    const c = 2 * Math.PI * r;
    const da = dashes ? `${(c / dashes) * 0.45} ${(c / dashes) * 0.55}` : "none";
    return `<circle cx="60" cy="60" r="${r}" fill="none"
      stroke="rgba(200,162,106,${opacity})" stroke-width="${r < 30 ? 1.2 : 0.7}"
      stroke-dasharray="${da}" stroke-linecap="round"/>`;
  };

  const dots = (n, r, dr, phase = 0) =>
    Array.from({ length: n }, (_, i) => {
      const a = (i / n) * 2 * Math.PI + phase;
      return `<circle cx="${(60 + r * Math.cos(a)).toFixed(2)}"
                       cy="${(60 + r * Math.sin(a)).toFixed(2)}"
                       r="${dr}" fill="rgba(200,162,106,0.65)"/>`;
    }).join("");

  const svg = `
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" width="120" height="120">
      <g class="loader__ornament-ring loader__ornament-ring--outer">
        ${makeRing(56, 24, 0.35)}${dots(8, 56, 1.5)}
      </g>
      <g class="loader__ornament-ring loader__ornament-ring--mid">
        ${makeRing(40, 16, 0.5)}${dots(6, 40, 1.2, Math.PI / 6)}
      </g>
      <g class="loader__ornament-ring loader__ornament-ring--inner">
        ${makeRing(24, 8, 0.7)}${dots(4, 24, 1, Math.PI / 4)}
      </g>
      <circle cx="60" cy="60" r="4" fill="rgba(200,162,106,0.9)"/>
    </svg>`;

  const loader = document.createElement("div");
  loader.id = "page-loader";
  loader.setAttribute("aria-hidden", "true");
  loader.innerHTML = `
    <div class="loader__inner">
      <div class="loader__ornament">${svg}</div>
      <img class="loader__logo"
        src="https://diyarrestaurant.com/wp-content/uploads/2025/12/Logo-Website-Version-1000x.png"
        alt="Diyar Restaurant" loading="eager" />
      <span class="loader__tagline">Persian &amp; Mediterranean</span>
      <div class="loader__bar-wrap"><div class="loader__bar"></div></div>
    </div>`;

  document.body.prepend(loader);
  setTimeout(() => {
    loader.classList.add("is-hidden");
    setTimeout(() => loader.remove(), 1200);
  }, 2400);
}


/* ============================================================
   WORD-BY-WORD H1 REVEAL  (hero + page-hero)
   ============================================================ */

function setupWordReveal() {
  if (reducedMotion) return;

  [
    { sel: ".hero h1",      baseDelay: 0.55, step: 0.12 },
    { sel: ".page-hero h1", baseDelay: 0.35, step: 0.10 },
  ].forEach(({ sel, baseDelay, step }) => {
    const h1 = $(sel);
    if (!h1) return;

    const words = h1.textContent.trim().split(/\s+/);
    h1.innerHTML = words
      .map((w, i) =>
        `<span class="word-wrap"><span class="word" style="animation-delay:${(baseDelay + i * step).toFixed(2)}s">${w}</span></span>`
      )
      .join(" ");
    h1.classList.add("word-split-active");
  });
}


/* ============================================================
   CANVAS PARTICLES  (shared factory)
   ============================================================ */

function createParticleCanvas(container, { count = 70, opacity = 0.65, delay = 1800 } = {}) {
  const canvas = document.createElement("canvas");
  canvas.className = container.classList.contains("page-hero")
    ? "page-hero__particles"
    : "hero__particles";

  // Insert right after the first child (backdrop / inner) so it's behind text
  const ref = container.querySelector(".hero__backdrop, .page-hero__inner");
  ref ? ref.after(canvas) : container.prepend(canvas);

  const ctx = canvas.getContext("2d");
  const resize = () => { canvas.width = container.offsetWidth; canvas.height = container.offsetHeight; };
  resize();
  window.addEventListener("resize", resize, { passive: true });

  const particles = Array.from({ length: count }, (_, i) => ({
    x:            Math.random() * canvas.width,
    y:            Math.random() * canvas.height,
    size:         i < count * 0.65 ? Math.random() * 1.4 + 0.3 : Math.random() * 2.8 + 1.2,
    speedY:       i < count * 0.65 ? Math.random() * 0.55 + 0.15 : Math.random() * 0.3 + 0.08,
    speedX:       (Math.random() - 0.5) * 0.25,
    opacity:      i < count * 0.65 ? Math.random() * 0.5 + 0.08 : Math.random() * 0.3 + 0.05,
    flicker:      Math.random() * Math.PI * 2,
    flickerSpeed: Math.random() * 0.025 + 0.008,
    glow:         i >= count * 0.65,
  }));

  const [R, G, B] = [200, 162, 106];
  let animId;

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.flicker += p.flickerSpeed;
      const a = p.opacity * (0.65 + 0.35 * Math.sin(p.flicker));

      if (p.glow) {
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2.5);
        g.addColorStop(0, `rgba(${R},${G},${B},${a})`);
        g.addColorStop(1, `rgba(${R},${G},${B},0)`);
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
      }

      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${R},${G},${B},${a})`; ctx.fill();

      p.y -= p.speedY; p.x += p.speedX;
      if (p.y < -p.size * 3)    { p.y = canvas.height + p.size; p.x = Math.random() * canvas.width; }
      if (p.x < 0)               p.x = canvas.width;
      if (p.x > canvas.width)    p.x = 0;
    });
    animId = requestAnimationFrame(draw);
  };

  setTimeout(() => { canvas.classList.add("is-active"); draw(); }, delay);

  // Pause when section leaves viewport
  new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) cancelAnimationFrame(animId);
    else draw();
  }, { threshold: 0 }).observe(container);
}

function setupHeroParticles() {
  const hero = $(".hero");
  if (!hero || reducedMotion) return;
  createParticleCanvas(hero, { count: 90, opacity: 0.7, delay: 1800 });
}

function setupPageHeroParticles() {
  const hero = $(".page-hero");
  if (!hero || reducedMotion) return;
  createParticleCanvas(hero, { count: 55, opacity: 0.45, delay: 900 });
}


/* ============================================================
   PARALLAX
   ============================================================ */

function makeParallax(el, container, rate) {
  if (!el || !container || reducedMotion) return;
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      el.style.transform = `translateY(${window.scrollY * rate}px)`;
      ticking = false;
    });
  };
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting)  window.addEventListener("scroll", onScroll, { passive: true });
    else { window.removeEventListener("scroll", onScroll); el.style.transform = ""; }
  }, { threshold: 0 }).observe(container);
}

function setupHeroParallax() {
  makeParallax($(".hero__content"), $(".hero"), 0.16);
  makeParallax($(".hero__panel"),   $(".hero"), 0.09);
}

function setupPageHeroParallax() {
  makeParallax($(".page-hero__inner"), $(".page-hero"), 0.10);
}


/* ============================================================
   SCROLL REVEAL
   ============================================================ */

function setupScrollReveal() {
  if (reducedMotion) return;

  const assign = (el, cls) => {
    if (!["reveal","reveal-left","reveal-right"].some(c => el.classList.contains(c)))
      el.classList.add(cls);
  };

  const skip = (el) => el.closest(".hero, .page-hero");

  $$(".section-heading, .feature-card, .event-card, .contact__card, .contact__stack, " +
     ".menu__content, .menu__preview, .footer__inner > div, .footer__links, .footer__meta")
    .forEach((el) => { if (!skip(el)) assign(el, "reveal"); });

  $$(".story__visual")
    .forEach((el) => { if (!skip(el)) { el.classList.remove("reveal"); assign(el, "reveal-left"); } });

  $$(".story__content")
    .forEach((el) => { if (!skip(el)) { el.classList.remove("reveal"); assign(el, "reveal-right"); } });

  // Stagger grid children
  $$(".promise__grid, .events__grid").forEach((grid) => {
    [...grid.children].forEach((child, i) => { child.style.transitionDelay = `${i * 0.13}s`; });
  });

  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); } }),
    { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
  );
  $$(".reveal, .reveal-left, .reveal-right").forEach((el) => io.observe(el));
}


/* ============================================================
   CARD 3D TILT
   ============================================================ */

function setupCardTilt() {
  if (reducedMotion) return;
  $$(".feature-card, .event-card").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const { left, top, width, height } = card.getBoundingClientRect();
      const dx = (e.clientX - left - width  / 2) / (width  / 2);
      const dy = (e.clientY - top  - height / 2) / (height / 2);
      card.style.transform  = `translateY(-6px) rotateX(${dy * -4}deg) rotateY(${dx * 4}deg)`;
      card.style.transition = "transform 0.07s linear, box-shadow 0.35s, border-color 0.35s";
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform  = "";
      card.style.transition = "transform 0.55s cubic-bezier(.25,1,.5,1), box-shadow 0.35s, border-color 0.35s";
    });
  });
}


/* ============================================================
   CONTACT PAGE — LIVE LOCATION BEACON
   ============================================================ */

function setupContactAnimations() {
  if (page !== "contact") return;

  // Inject animated location beacon into address card
  const addressCard = $$(".contact__stack .contact__card")
    .find((c) => c.querySelector("span")?.textContent.trim().toLowerCase() === "address");

  if (addressCard) {
    const beacon = document.createElement("div");
    beacon.className = "location-beacon";
    beacon.innerHTML = `
      <span class="location-beacon__dot"></span>
      <span class="location-beacon__text">Sammamish, WA</span>`;
    addressCard.prepend(beacon);
  }

  // Subtle gradient sweep on all contact cards on hover
  $$(".contact__card").forEach((card) => {
    card.style.cursor = "default";
  });

  // Social buttons get a continuous shimmer
  $$(".contact__actions .button").forEach((btn, i) => {
    btn.style.animationDelay = `${i * 1.5}s`;
  });
}


/* ============================================================
   EVENTS PAGE — CANDLE FLAMES + ATMOSPHERIC GLOW
   ============================================================ */

function setupEventsAnimations() {
  if (page !== "events") return;

  // Inject a candle flame into each event card
  $$(".event-card").forEach((card) => {
    const candle = document.createElement("div");
    candle.className = "event-candle";
    candle.innerHTML = `
      <span class="event-candle__flame"></span>
      <span class="event-candle__stem"></span>`;
    card.prepend(candle);
  });

  // Inject a decorative divider line above the events grid
  const heading = $(".section-heading--center");
  if (heading) {
    const line = document.createElement("div");
    line.style.cssText =
      "width:1px;height:40px;background:linear-gradient(180deg,var(--gold),transparent);margin:0 auto 32px;opacity:0.5;";
    heading.after(line);
  }
}


/* ============================================================
   MENU PAGE — ANIMATED PREVIEW REVEAL
   ============================================================ */

function setupMenuAnimations() {
  if (page !== "menu") return;

  // Inject a "zoom to browse" indicator below the preview
  const preview = $(".menu__preview");
  if (preview) {
    const hint = document.createElement("p");
    hint.style.cssText =
      "text-align:center;margin-top:14px;font-size:.78rem;letter-spacing:.18em;" +
      "text-transform:uppercase;color:var(--muted);animation:fadeIn 1s 1.2s both;";
    hint.textContent = "Click to browse the full menu";
    preview.after(hint);
  }

  // Animate the "Order Online" eyebrow line in with a delay
  const eyebrow = $(".menu__content .eyebrow");
  if (eyebrow && !reducedMotion) {
    eyebrow.style.cssText += ";animation:fadeInUp 0.8s 0.4s var(--ease-expo) both;opacity:0;";
  }
}


/* ============================================================
   ABOUT PAGE — STORY SECTION CONNECTOR
   ============================================================ */

function setupAboutAnimations() {
  if (page !== "about") return;

  // Between the page hero and story, add a thin animated vertical connector
  const pageHero = $(".page-hero");
  if (pageHero && !reducedMotion) {
    const connector = document.createElement("div");
    connector.style.cssText =
      "width:1px;height:0;background:linear-gradient(180deg,var(--gold),transparent);" +
      "margin:0 auto;opacity:0.5;transition:height 1.2s cubic-bezier(.16,1,.3,1);";
    pageHero.after(connector);
    // Animate in after load
    setTimeout(() => { connector.style.height = "56px"; }, 600);
  }

  // Add a subtle quote decoration before the story content paragraphs
  const storyContent = $(".story__content");
  if (storyContent) {
    const quote = document.createElement("div");
    quote.style.cssText =
      "font-family:'Cormorant Garamond',serif;font-size:5rem;line-height:1;" +
      "color:rgba(200,162,106,0.18);margin-bottom:-20px;margin-top:8px;" +
      "animation:fadeIn 1s 0.8s both;";
    quote.textContent = "\u201C";
    const firstP = storyContent.querySelector("p");
    if (firstP) firstP.before(quote);
  }
}


/* ============================================================
   INIT
   ============================================================ */

function init() {
  createLoader();
  setupWordReveal();
  setupScrollReveal();
  setupHeroParticles();
  setupPageHeroParticles();

  if (!reducedMotion) {
    setupHeroParallax();
    setupPageHeroParallax();
    setupCardTilt();
  }

  // Page-specific enhancements
  setupContactAnimations();
  setupEventsAnimations();
  setupMenuAnimations();
  setupAboutAnimations();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
