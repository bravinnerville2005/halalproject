/**
 * Finds an element inside a parent, or stops with a clear message.
 * @param {string} selector
 * @param {ParentNode} root
 * @returns {HTMLElement}
 */
function need(selector, root) {
  const el = root.querySelector(selector);
  if (!el) throw new Error("Missing element: " + selector);
  return /** @type {HTMLElement} */ (el);
}

/* ---------- Gallery filters and viewer (gallery page only) ---------- */
const lbEl = document.getElementById("lb");
if (lbEl) setupGallery(lbEl);

/** @param {HTMLElement} lb */
function setupGallery(lb) {
  const items = /** @type {HTMLElement[]} */ (
    Array.from(document.querySelectorAll(".g-item"))
  );
  const buttons = /** @type {HTMLElement[]} */ (
    Array.from(document.querySelectorAll(".filters button"))
  );

  buttons.forEach((b) =>
    b.addEventListener("click", () => {
      const active = document.querySelector(".filters .on");
      if (active) active.classList.remove("on");
      b.classList.add("on");
      items.forEach((i) =>
        i.classList.toggle("hide", b.dataset.f !== "all" && i.dataset.cat !== b.dataset.f)
      );
    })
  );

  const lbImg = /** @type {HTMLImageElement} */ (need("img", lb));
  const lbVid = /** @type {HTMLVideoElement} */ (need("video", lb));
  const lbCap = need("figcaption", lb);
  let cur = 0;

  const visible = () => items.filter((i) => !i.classList.contains("hide"));

  /** @param {number} n */
  function show(n) {
    const v = visible();
    if (!v.length) return;
    cur = (n + v.length) % v.length;
    const el = v[cur];
    const im = /** @type {HTMLImageElement | null} */ (el.querySelector("img"));
    if (!im) return;
    const src = el.dataset.video;

    if (src) {
      lbImg.hidden = true;
      lbVid.hidden = false;
      lbVid.poster = im.src;
      lbVid.src = src;
      lbVid.play().catch(() => {});
    } else {
      lbVid.pause();
      lbVid.removeAttribute("src");
      lbVid.load();
      lbVid.hidden = true;
      lbImg.hidden = false;
      lbImg.src = im.src;
      lbImg.alt = im.alt;
    }
    lbCap.textContent = im.alt;
  }

  /** @param {HTMLElement} el */
  function openBox(el) {
    show(visible().indexOf(el));
    lb.classList.add("open");
    lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeBox() {
    lbVid.pause();
    lb.classList.remove("open");
    lb.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  items.forEach((i) => {
    i.tabIndex = 0;
    i.addEventListener("click", () => openBox(i));
    i.addEventListener("keydown", (e) => {
      if (e.key === "Enter") openBox(i);
    });
  });

  need(".lb-x", lb).onclick = closeBox;
  need(".lb-p", lb).onclick = () => show(cur - 1);
  need(".lb-n", lb).onclick = () => show(cur + 1);
  lb.addEventListener("click", (e) => {
    if (e.target === lb) closeBox();
  });
  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") closeBox();
    if (e.key === "ArrowLeft") show(cur - 1);
    if (e.key === "ArrowRight") show(cur + 1);
  });
}

/* ---------- County map links (Apple Maps on Apple devices) ---------- */
const isApple =
  /iPhone|iPad|iPod|Macintosh/i.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

if (isApple) {
  const countyLinks = /** @type {NodeListOf<HTMLAnchorElement>} */ (
    document.querySelectorAll("a[data-county]")
  );
  countyLinks.forEach((a) => {
    const place = (a.dataset.county || "") + " County, Kenya";
    a.href = "https://maps.apple.com/?q=" + encodeURIComponent(place);
  });
}

/* ---------- Cold-chain destinations ---------- */
const hubsData = document.getElementById("hubs-data");
const hubsBox = document.getElementById("hubs");
const hubTabs = document.getElementById("hub-tabs");
const hubPanel = document.getElementById("hub-panel");

if (hubsData && hubsBox && hubTabs && hubPanel) {
  setupHubs(hubsData, hubsBox, hubTabs, hubPanel);
}

/**
 * @typedef {{ name: string, rows: [string, string][] }} Hub
 */

/**
 * @param {HTMLElement} data
 * @param {HTMLElement} box
 * @param {HTMLElement} tabs
 * @param {HTMLElement} panel
 */
function setupHubs(data, box, tabs, panel) {
  /** @type {Hub[]} */
  let hubs = [];
  try {
    hubs = JSON.parse(data.textContent || "[]");
  } catch (err) {
    hubs = [];
  }
  if (!hubs.length) return;

  box.hidden = false;

  /** @param {number} index */
  const select = (index) => {
    tabs.querySelectorAll("button").forEach((b, j) => b.classList.toggle("on", j === index));
    panel.innerHTML = "";
    hubs[index].rows.forEach(([label, value]) => {
      const row = document.createElement("div");
      const dt = document.createElement("dt");
      const dd = document.createElement("dd");
      dt.textContent = label;
      dd.textContent = value;
      row.append(dt, dd);
      panel.append(row);
    });
  };

  hubs.forEach((h, index) => {
    const b = document.createElement("button");
    b.type = "button";
    b.innerHTML = '<i class="fa-solid fa-location-dot"></i> ';
    b.append(h.name);
    b.addEventListener("click", () => select(index));
    tabs.append(b);
  });
  select(0);
}

/* ---------- Mobile menu ---------- */
const navEl = document.querySelector("nav");
const menuBtn = document.querySelector(".menu-btn");

if (navEl && menuBtn) {
  /** @param {boolean} open */
  const setOpen = (open) => {
    navEl.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };

  menuBtn.addEventListener("click", () => setOpen(!navEl.classList.contains("open")));

  navEl.querySelectorAll(".links a").forEach((a) =>
    a.addEventListener("click", () => setOpen(false))
  );

  document.addEventListener("click", (e) => {
    if (e.target instanceof Node && !navEl.contains(e.target)) setOpen(false);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });

  window.matchMedia("(min-width: 861px)").addEventListener("change", () => setOpen(false));
}
/* ---------- Hero slideshow (plays by itself) ---------- */
const heroEl = document.querySelector(".hero");
if (heroEl) setupHero(heroEl);

/** @param {Element} hero */
function setupHero(hero) {
  const slides = Array.from(hero.querySelectorAll(".slide"));
  const bgs = Array.from(hero.querySelectorAll(".hero-bg img"));
  if (slides.length < 2) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let cur = 0;
  /** @type {number | undefined} */
  let timer;

  function show() {
    slides.forEach((s, i) => {
      s.classList.toggle("active", i === cur);
      s.setAttribute("aria-hidden", String(i !== cur));
    });
    bgs.forEach((b, i) => b.classList.toggle("active", i === cur));
  }

  function stop() {
    if (timer !== undefined) window.clearInterval(timer);
    timer = undefined;
  }

  function start() {
    stop();
    if (reduceMotion.matches) return;
    timer = window.setInterval(() => {
      cur = (cur + 1) % slides.length;
      show();
    }, 6500);
  }

  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));

  show();
  start();
}
/* ---------- Back to top (with scroll progress ring) ---------- */
setupToTop();

function setupToTop() {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "to-top";
  btn.setAttribute("aria-label", "Back to top");
  btn.innerHTML =
    '<svg class="tt-ring" viewBox="0 0 52 52" aria-hidden="true">' +
    '<circle class="tt-track" cx="26" cy="26" r="23"></circle>' +
    '<circle class="tt-bar" cx="26" cy="26" r="23"></circle></svg>' +
    '<svg class="tt-arrow" viewBox="0 0 24 24" aria-hidden="true">' +
    '<path d="M12 19V5M5 12l7-7 7 7"></path></svg>';
  document.body.append(btn);

  const bar = /** @type {SVGElement | null} */ (btn.querySelector(".tt-bar"));
  const circumference = 2 * Math.PI * 23;
  let ticking = false;

  function update() {
    ticking = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    if (bar) bar.style.strokeDashoffset = String(circumference * (1 - progress));
    btn.classList.toggle("show", window.scrollY > 300);
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  btn.addEventListener("click", () => {
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: calm ? "auto" : "smooth" });
  });

  update();
}
