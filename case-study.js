const progressBar = document.querySelector(".page-progress span");
const header = document.querySelector(".case-topbar");
const chapterNav = document.querySelector(".chapter-nav");
const chapterLinks = [...(chapterNav?.querySelectorAll('a[href^="#"]') ?? [])];
const chapters = [...document.querySelectorAll("[data-chapter]")];
const rail = document.querySelector(".case-rail-list");

const setActiveChapter = (current) => {
  chapterLinks.forEach((link) => {
    const active = link.hash === `#${current.id}`;
    link.classList.toggle("is-active", active);
    if (active) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
  rail?.querySelectorAll("a").forEach((link) => {
    const active = link.hash === `#${current.id}`;
    link.classList.toggle("is-active", active);
    if (active) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
};

if (rail) {
  chapters.filter((chapter) => chapter.id !== "overview").forEach((chapter) => {
    const number = chapter.dataset.index || "";
    const label = chapter.querySelector(".chapter-index strong")?.textContent?.trim()
      || chapter.querySelector("h2")?.textContent?.trim()
      || chapter.id;
    const item = document.createElement("li");
    const link = document.createElement("a");
    const index = document.createElement("b");
    const text = document.createElement("span");
    link.href = `#${chapter.id}`;
    index.textContent = number;
    text.textContent = label;
    link.append(index, text);
    item.append(link);
    rail.append(item);
  });
}

const updateProgress = () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
  progressBar?.style.setProperty("transform", `scaleX(${Math.min(1, Math.max(0, progress))})`);
  header?.classList.toggle("is-scrolled", window.scrollY > 20);
};
window.addEventListener("scroll", updateProgress, { passive: true });
window.addEventListener("resize", updateProgress);
updateProgress();

document.querySelector("[data-print-resume]")?.addEventListener("click", () => window.print());

if ("IntersectionObserver" in window && chapters.length) {
  const activeObserver = new IntersectionObserver((entries) => {
    const active = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => Math.abs(a.boundingClientRect.top - window.innerHeight * 0.38) - Math.abs(b.boundingClientRect.top - window.innerHeight * 0.38))[0];
    if (active) setActiveChapter(active.target);
  }, { rootMargin: "-22% 0px -62% 0px", threshold: 0 });
  chapters.forEach((chapter) => activeObserver.observe(chapter));

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  }, { rootMargin: "160px 0px 160px", threshold: 0 });
  document.querySelectorAll(".case-chapter, .case-slide, .case-cover").forEach((element) => revealObserver.observe(element));
  document.body.classList.add("case-motion-ready");
  const initiallyVisible = chapters.find((chapter) => {
    const rect = chapter.getBoundingClientRect();
    return rect.top < window.innerHeight * .62 && rect.bottom > window.innerHeight * .22;
  });
  if (initiallyVisible) setActiveChapter(initiallyVisible);
} else {
  const initial = chapters.find((chapter) => {
    const rect = chapter.getBoundingClientRect();
    return rect.top < window.innerHeight * .62 && rect.bottom > window.innerHeight * .22;
  }) || chapters[0];
  if (initial) setActiveChapter(initial);
}

const lightbox = document.querySelector(".lightbox");
const lightboxImage = lightbox?.querySelector("img");
document.querySelectorAll("[data-zoom]").forEach((button) => {
  button.addEventListener("click", () => {
    const image = button.querySelector("img");
    if (!image || !lightbox || !lightboxImage) return;
    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = image.alt;
    lightbox.showModal();
  });
});
lightbox?.querySelector("[data-lightbox-close]")?.addEventListener("click", () => lightbox.close());
lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox) lightbox.close();
});
