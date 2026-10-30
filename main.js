const header = document.querySelector(".topbar");
const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".topnav");

const closeMenu = () => {
  nav?.classList.remove("open");
  menuButton?.setAttribute("aria-expanded", "false");
  menuButton?.setAttribute("aria-label", "打开导航");
};

menuButton?.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!open));
  menuButton.setAttribute("aria-label", open ? "打开导航" : "关闭导航");
  nav?.classList.toggle("open", !open);
});

nav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08 });
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("visible"));
}

const navLinks = [...document.querySelectorAll(".topnav a")];
const navTargets = navLinks.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);
const navIndicator = nav?.querySelector(".topnav-indicator");
const updateHeader = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 20);
  const marker = window.innerHeight * 0.36;
  const current = navTargets
    .filter((section) => section.getBoundingClientRect().top <= marker)
    .sort((a, b) => b.getBoundingClientRect().top - a.getBoundingClientRect().top)[0];
  navLinks.forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("href") === `#${current?.id}`);
  });
  const activeLink = navLinks.find((link) => link.classList.contains("is-active"));
  if (activeLink && navIndicator) {
    navIndicator.style.width = `${activeLink.offsetWidth}px`;
    navIndicator.style.transform = `translateX(${activeLink.offsetLeft}px)`;
    nav?.classList.add("has-indicator");
  } else {
    nav?.classList.remove("has-indicator");
  }
};
window.addEventListener("scroll", updateHeader, { passive: true });
window.addEventListener("resize", updateHeader);
updateHeader();

const hero = document.querySelector(".hero");

const dotCanvas = document.querySelector(".hero-dot-field");
const dotContext = dotCanvas?.getContext("2d", { alpha: true });

if (hero && dotCanvas && dotContext) {
  hero.classList.add("has-canvas-dots");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0, strength: 0, active: false };
  let fieldWidth = 0;
  let fieldHeight = 0;
  let pixelRatio = 1;
  let dotFrame = 0;
  let lastFrameTime = 0;
  let visible = true;

  const metrics = () => ({ spacing: fieldWidth < 650 ? 34 : 46, radius: fieldWidth < 650 ? 70 : 96 });

  const drawDots = (interactive = false) => {
    if (!fieldWidth || !fieldHeight) return;
    const { spacing, radius: influenceRadius } = metrics();
    const startX = (fieldWidth % spacing) / 2;
    const startY = (fieldHeight % spacing) / 2;
    dotContext.clearRect(0, 0, fieldWidth, fieldHeight);
    for (let y = startY; y <= fieldHeight; y += spacing) {
      for (let x = startX; x <= fieldWidth; x += spacing) {
        let effect = 0;
        let drawX = x;
        let drawY = y;
        if (interactive && pointer.strength > .001) {
          const dx = x - pointer.x;
          const dy = y - pointer.y;
          const distance = Math.hypot(dx, dy) || 1;
          const proximity = Math.max(0, 1 - distance / influenceRadius) * pointer.strength;
          effect = proximity * proximity * (3 - 2 * proximity);
          const push = effect * 3;
          drawX += dx / distance * push;
          drawY += dy / distance * push;
        }
        const ambient = reduceMotion ? 0 : Math.sin(x * .012 + y * .009) * .12;
        const dotRadius = Math.max(.85, 1.1 + ambient + effect * .5);
        dotContext.beginPath();
        dotContext.arc(drawX, drawY, dotRadius, 0, Math.PI * 2);
        dotContext.fillStyle = effect > .015 ? `rgba(19,19,20,${.16 + effect * .13})` : "rgba(19,19,20,.2)";
        dotContext.fill();
      }
    }
  };

  const resizeDots = () => {
    const rect = dotCanvas.getBoundingClientRect();
    fieldWidth = rect.width;
    fieldHeight = rect.height;
    pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    dotCanvas.width = Math.round(fieldWidth * pixelRatio);
    dotCanvas.height = Math.round(fieldHeight * pixelRatio);
    dotContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    drawDots(false);
  };

  const animateDots = (time) => {
    dotFrame = 0;
    if (!visible || document.hidden || reduceMotion) return;
    if (lastFrameTime && time - lastFrameTime < 1000 / 45) {
      dotFrame = requestAnimationFrame(animateDots);
      return;
    }
    lastFrameTime = time;
    pointer.x += (pointer.targetX - pointer.x) * .16;
    pointer.y += (pointer.targetY - pointer.y) * .16;
    pointer.strength += ((pointer.active ? 1 : 0) - pointer.strength) * .12;
    const moving = Math.abs(pointer.targetX - pointer.x) > .15
      || Math.abs(pointer.targetY - pointer.y) > .15
      || Math.abs((pointer.active ? 1 : 0) - pointer.strength) > .003;
    if (!moving) {
      pointer.x = pointer.targetX;
      pointer.y = pointer.targetY;
      pointer.strength = pointer.active ? 1 : 0;
    }
    drawDots(true);
    if (moving) dotFrame = requestAnimationFrame(animateDots);
    else lastFrameTime = 0;
  };

  const startDotAnimation = () => {
    if (!visible || document.hidden || reduceMotion || dotFrame) return;
    dotFrame = requestAnimationFrame(animateDots);
  };

  hero.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch" || reduceMotion) return;
    const rect = dotCanvas.getBoundingClientRect();
    pointer.targetX = event.clientX - rect.left;
    pointer.targetY = event.clientY - rect.top;
    if (!pointer.active) {
      pointer.x = pointer.targetX;
      pointer.y = pointer.targetY;
    }
    pointer.active = true;
    startDotAnimation();
  }, { passive: true });
  hero.addEventListener("pointerleave", () => {
    pointer.active = false;
    startDotAnimation();
  });

  const visibilityObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (!visible) {
      pointer.active = false;
      if (dotFrame) cancelAnimationFrame(dotFrame);
      dotFrame = 0;
      drawDots(false);
    } else if (pointer.active) {
      startDotAnimation();
    }
  }, { threshold: 0 });
  visibilityObserver.observe(hero);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && dotFrame) {
      cancelAnimationFrame(dotFrame);
      dotFrame = 0;
    } else if (!document.hidden && pointer.active) {
      startDotAnimation();
    }
  });
  window.addEventListener("resize", resizeDots, { passive: true });
  new ResizeObserver(resizeDots).observe(hero);
  resizeDots();
}

const cursor = document.querySelector(".cursor");
if (cursor && window.matchMedia("(pointer:fine)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  window.addEventListener("pointermove", (event) => {
    cursor.style.transform = `translate3d(${event.clientX}px,${event.clientY}px,0) translate(-50%,-50%)`;
  }, { passive: true });
  document.querySelectorAll("a,button,[role='button']").forEach((element) => {
    element.addEventListener("pointerenter", () => cursor.classList.add("active"));
    element.addEventListener("pointerleave", () => cursor.classList.remove("active"));
  });
}

const lanyardRoot = document.getElementById("lanyard-react-root");
const portraitStage = document.querySelector(".portrait-stage");
if (lanyardRoot && portraitStage && hero) {
  const html = document.documentElement;
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const constrainedHardware = (navigator.deviceMemory && navigator.deviceMemory <= 4)
    || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
  const mode = connection?.saveData || reduceMotion ? "lite" : constrainedHardware ? "balanced" : "full";
  html.dataset.lanyardMode = mode;
  lanyardRoot.dataset.lanyardMode = mode;
  const syncCanvasHeight = () => {
    if (window.matchMedia("(max-width:1050px)").matches) return;
    const heroRect = hero.getBoundingClientRect();
    const stageRect = portraitStage.getBoundingClientRect();
    lanyardRoot.style.top = "0px";
    lanyardRoot.style.height = `${Math.max(0, stageRect.bottom - heroRect.top)}px`;
  };
  new ResizeObserver(syncCanvasHeight).observe(portraitStage);
  syncCanvasHeight();
  window.addEventListener("portfolio-lanyard:ready", () => { lanyardRoot.dataset.lanyardState = "live"; });
  window.addEventListener("portfolio-lanyard:error", () => { lanyardRoot.dataset.lanyardState = "poster"; });
  if (!window.matchMedia("(max-width:1050px)").matches) {
    const bundle = document.createElement("script");
    bundle.src = "assets/lanyard/lanyard-island.js?v=badge-clean-20261030-5";
    bundle.async = true;
    bundle.addEventListener("error", () => { lanyardRoot.dataset.lanyardState = "poster"; }, { once: true });
    document.head.appendChild(bundle);
  }
}

