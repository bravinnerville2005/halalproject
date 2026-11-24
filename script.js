/* ---------- Gallery filters ---------- */
const items = [...document.querySelectorAll(".g-item")];

document.querySelectorAll(".filters button").forEach((b) =>
  b.addEventListener("click", () => {
    document.querySelector(".filters .on").classList.remove("on");
    b.classList.add("on");
    items.forEach((i) =>
      i.classList.toggle("hide", b.dataset.f !== "all" && i.dataset.cat !== b.dataset.f)
    );
  })
);

/* ---------- Photo and video viewer ---------- */
const lb = document.getElementById("lb");
const lbImg = lb.querySelector("img");
const lbVid = lb.querySelector("video");
const lbCap = lb.querySelector("figcaption");
let cur = 0;

const visible = () => items.filter((i) => !i.classList.contains("hide"));

function show(n) {
  const v = visible();
  cur = (n + v.length) % v.length;
  const el = v[cur];
  const im = el.querySelector("img");
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
lb.querySelector(".lb-x").onclick = closeBox;
lb.querySelector(".lb-p").onclick = () => show(cur - 1);
lb.querySelector(".lb-n").onclick = () => show(cur + 1);
lb.addEventListener("click", (e) => {
  if (e.target === lb) closeBox();
});
document.addEventListener("keydown", (e) => {
  if (!lb.classList.contains("open")) return;
  if (e.key === "Escape") closeBox();
  if (e.key === "ArrowLeft") show(cur - 1);
  if (e.key === "ArrowRight") show(cur + 1);
});


/* ---------- County map links ---------- */
const isApple =
  /iPhone|iPad|iPod|Macintosh/i.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

document.querySelectorAll("[data-county]").forEach((a) => {
  const place = encodeURIComponent(a.dataset.county + " County, Kenya");
  a.href = isApple
    ? "https://maps.apple.com/?q=" + place
    : "https://www.google.com/maps/search/?api=1&query=" + place;
  a.target = "_blank";
  a.rel = "noopener";
  a.setAttribute("aria-label", a.dataset.county + " County on the map");
});

/* ---------- Clean URL: scroll to sections without showing # ---------- */
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const target = document.getElementById(a.getAttribute("href").slice(1));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView();
    history.replaceState(null, "", location.pathname + location.search);
  });
});
