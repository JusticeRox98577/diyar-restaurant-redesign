/* ============================================================
   DIYAR RESTAURANT — ENHANCED INTERACTIONS
   ============================================================ */

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

const navToggle = $(".nav__toggle");
const navMenu   = $(".nav__menu");
const navEl     = $(".nav");
const navLinks  = $$(".nav__menu a");
const yearEl    = $("#year");
const page      = document.body.dataset.page;

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;


/* ---------- Year ---------- */

$$("[id='year']").forEach((el) => {
  el.textContent = new Date().getFullYear();
});


/* ---------- Active Nav Link ---------- */

if (page) {
  const activeLink = $(`[data-nav="${page}"]`);
  if (activeLink) activeLink.classList.add("is-active");
}


/* ---------- Nav Toggle (Mobile) ---------- */

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!expanded));
    navMenu.classList.toggle("is-open");
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navToggle.setAttribute("aria-expanded", "false");
      navMenu.classList.remove("is-open");
    });
  });

  document.addEventListener("click", (e) => {
    if (
      navMenu.classList.contains("is-open") &&
      !navMenu.contains(e.target) &&
      !navToggle.contains(e.target)
    ) {
      navToggle.setAttribute("aria-expanded", "false");
      navMenu.classList.remove("is-open");
    }
  });
}


/* ---------- Nav Scroll State ---------- */

if (navEl) {
  const setNavState = () => {
    navEl.classList.toggle("is-scrolled", window.scrollY > 60);
  };
  setNavState();
  window.addEventListener("scroll", setNavState, { passive: true });
}


/* ============================================================
   PAGE LOADER
   ============================================================ */

function createLoader() {
  if (reducedMotion) return;

  // Build the ornament SVG rings
  const makeRing = (r, dashes, cls) => {
    const circumference = 2 * Math.PI * r;
    const dashArray = dashes
      ? `${(circumference / dashes) * 0.45} ${(circumference / dashes) * 0.55}`
      : "none";
    return `<circle cx="60" cy="60" r="${r}" fill="none"
      stroke="rgba(200,162,106,${cls === 'outer' ? 0.4 : cls === 'mid' ? 0.55 : 0.7})"
      stroke-width="${cls === 'inner' ? 1.2 : 0.7}"
      stroke-dasharray="${dashArray}"
      stroke-linecap="round"/>`;
  };

  const makeDots = (count, r, dotR, phase = 0) =>
    Array.from({ length: count }, (_, i) => {
      const a = (i / count) * 2 * Math.PI + phase;
      const x = 60 + r * Math.cos(a);
      const y = 60 + r * Math.sin(a);
      return `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${dotR}" fill="rgba(200,162,106,0.6)"/>`;
    }).join("");

  const ornamentSVG = `
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" width="120" height="120">
      <g class="loader__ornament-ring loader__ornament-ring--outer">
        ${makeRing(56, 24, 'outer')}
        ${makeDots(8, 56, 1.5)}
      </g>
      <g class="loader__ornament-ring loader__ornament-ring--mid">
        ${makeRing(40, 16, 'mid')}
        ${makeDots(6, 40, 1.2, Math.PI / 6)}
      </g>
      <g class="loader__ornament-ring loader__ornament-ring--inner">
        ${makeRing(24, 8, 'inner')}
        ${makeDots(4, 24, 1, Math.PI / 4)}
      </g>
      <circle cx="60" cy="60" r="4" fill="rgba(200,162,106,0.9)"/>
    </svg>`;

  const loader = document.createElement("div");
  loader.id = "page-loader";
  loader.setAttribute("aria-hidden", "true");
  loader.innerHTML = `
    <div class="loader__inner">
      <div class="loader__ornament">${ornamentSVG}</div>
      <img
        class="loader__logo"
        src="https://diyarrestaurant.com/wp-content/uploads/2025/12/Logo-Website-Version-1000x.png"
        alt="Diyar Restaurant"
        loading="eager"
      />
      <span class="loader__tagline">Persian &amp; Mediterranean</span>
      <div class="loader__bar-wrap">
        <div class="loader__bar"></div>
      </div>
    </div>`;

  document.body.prepend(loader);

  // Hide after animation completes
  setTimeout(() => {
    loader.classList.add("is-hidden");
    setTimeout(() => loader.remove(), 1200);
  }, 2400);
}


/* ============================================================
   HERO WORD-BY-WORD REVEAL
   ============================================================ */

function setupWordReveal() {
  const h1 = $(".hero h1");
  if (!h1 || reducedMotion) return;

  const rawText = h1.textContent.trim();
  const words   = rawText.split(/\s+/);

  // Base delay: after loader finishes entering (0.3s) + cascade start
  const baseDelay = 0.55; // seconds

  h1.innerHTML = words
    .map((word, i) => {
      const delay = baseDelay + i * 0.12;
      return `<span class="word-wrap"><span class="word" style="animation-delay:${delay}s">${word}</span></span>`;
    })
    .join(" ");

  h1.classList.add("word-split-active");
}


/* ============================================================
   HERO CANVAS PARTICLES
   ============================================================ */

function setupHeroParticles() {
  const hero = $(".hero");
  if (!hero || reducedMotion) return;

  const canvas = document.createElement("canvas");
  canvas.className = "hero__particles";
  // Insert after the backdrop
  const backdrop = $(".hero__backdrop", hero);
  if (backdrop) {
    backdrop.after(canvas);
  } else {
    hero.prepend(canvas);
  }

  const ctx = canvas.getContext("2d");

  const resize = () => {
    canvas.width  = hero.offsetWidth;
    canvas.height = hero.offsetHeight;
  };
  resize();
  window.addEventListener("resize", resize, { passive: true });

  // Particle definitions: two layers — tiny fast + larger slow
  const count = 90;
  const particles = Array.from({ length: count }, (_, i) => ({
    x:       Math.random() * canvas.width,
    y:       Math.random() * canvas.height,
    size:    i < 60 ? Math.random() * 1.4 + 0.3 : Math.random() * 2.8 + 1.2,
    speedY:  i < 60 ? Math.random() * 0.55 + 0.15 : Math.random() * 0.3 + 0.08,
    speedX:  (Math.random() - 0.5) * 0.25,
    opacity: i < 60 ? Math.random() * 0.5 + 0.08 : Math.random() * 0.3 + 0.05,
    flicker: Math.random() * Math.PI * 2,
    flickerSpeed: Math.random() * 0.025 + 0.008,
    glow: i >= 60, // larger particles get a glow
  }));

  const G_R = 200, G_G = 162, G_B = 106; // gold RGB

  let animId;
  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p) => {
      p.flicker += p.flickerSpeed;
      const alpha = p.opacity * (0.65 + 0.35 * Math.sin(p.flicker));

      if (p.glow) {
        // Soft glow for larger particles
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2.5);
        grad.addColorStop(0, `rgba(${G_R},${G_G},${G_B},${alpha})`);
        grad.addColorStop(1, `rgba(${G_R},${G_G},${G_B},0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${G_R},${G_G},${G_B},${alpha})`;
      ctx.fill();

      // Move
      p.y -= p.speedY;
      p.x += p.speedX;

      // Wrap
      if (p.y < -p.size * 3) {
        p.y = canvas.height + p.size;
        p.x = Math.random() * canvas.width;
      }
      if (p.x < 0)             p.x = canvas.width;
      if (p.x > canvas.width)  p.x = 0;
    });

    animId = requestAnimationFrame(animate);
  };

  // Fade canvas in after loader has mostly gone
  setTimeout(() => {
    canvas.classList.add("is-active");
    animate();
  }, 1800);

  // Pause when hero leaves viewport
  const io = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) {
      cancelAnimationFrame(animId);
    } else {
      animate();
    }
  }, { threshold: 0 });
  io.observe(hero);
}


/* ============================================================
   SCROLL REVEAL (IntersectionObserver)
   ============================================================ */

function setupScrollReveal() {
  if (reducedMotion) return;

  const revealSelectors = [
    ".section-heading",
    ".feature-card",
    ".event-card",
    ".contact__card",
    ".contact__stack",
    ".menu__content",
    ".menu__preview",
    ".footer__inner > div",
    ".footer__links",
    ".footer__meta",
  ];

  const leftSelectors  = [".story__visual"];
  const rightSelectors = [".story__content"];

  const assign = (el, cls) => {
    if (!el.classList.contains("reveal") &&
        !el.classList.contains("reveal-left") &&
        !el.classList.contains("reveal-right")) {
      el.classList.add(cls);
    }
  };

  revealSelectors.forEach((sel) => {
    $$(sel).forEach((el) => {
      if (el.closest(".hero") || el.closest(".page-hero")) return;
      assign(el, "reveal");
    });
  });

  leftSelectors.forEach((sel) => {
    $$(sel).forEach((el) => {
      if (el.closest(".hero") || el.closest(".page-hero")) return;
      el.classList.remove("reveal");
      assign(el, "reveal-left");
    });
  });

  rightSelectors.forEach((sel) => {
    $$(sel).forEach((el) => {
      if (el.closest(".hero") || el.closest(".page-hero")) return;
      el.classList.remove("reveal");
      el.classList.remove("reveal-left");
      assign(el, "reveal-right");
    });
  });

  // Stagger grid children
  $$(".promise__grid, .events__grid").forEach((grid) => {
    [...grid.children].forEach((child, i) => {
      child.style.transitionDelay = `${i * 0.13}s`;
    });
  });

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
  );

  $$(".reveal, .reveal-left, .reveal-right").forEach((el) => io.observe(el));
}


/* ============================================================
   HERO PARALLAX
   ============================================================ */

function setupHeroParallax() {
  const heroContent = $(".hero__content");
  const heroPanel   = $(".hero__panel");
  const heroEl      = $(".hero");
  if (!heroContent || !heroEl || reducedMotion) return;

  let ticking = false;

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      heroContent.style.transform = `translateY(${y * 0.16}px)`;
      if (heroPanel) heroPanel.style.transform = `translateY(${y * 0.09}px)`;
      ticking = false;
    });
  };

  const io = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      window.addEventListener("scroll", onScroll, { passive: true });
    } else {
      window.removeEventListener("scroll", onScroll);
      if (heroContent) heroContent.style.transform = "";
      if (heroPanel)   heroPanel.style.transform   = "";
    }
  }, { threshold: 0 });

  io.observe(heroEl);
}


/* ============================================================
   CARD 3D TILT
   ============================================================ */

function setupCardTilt() {
  if (reducedMotion) return;

  $$(".feature-card, .event-card").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const dx   = (e.clientX - rect.left  - rect.width  / 2) / (rect.width  / 2);
      const dy   = (e.clientY - rect.top   - rect.height / 2) / (rect.height / 2);
      card.style.transform  = `translateY(-6px) rotateX(${dy * -4}deg) rotateY(${dx * 4}deg)`;
      card.style.transition = "transform 0.07s linear, box-shadow 0.35s ease, border-color 0.35s ease";
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform  = "";
      card.style.transition = "transform 0.55s cubic-bezier(0.25,1,0.5,1), box-shadow 0.35s ease, border-color 0.35s ease";
    });
  });
}


/* ============================================================
   INIT
   ============================================================ */

function init() {
  createLoader();
  setupWordReveal();
  setupScrollReveal();
  setupHeroParticles();

  if (!reducedMotion) {
    setupHeroParallax();
    setupCardTilt();
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
