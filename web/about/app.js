(() => {
  const progress = document.querySelector("#readingProgress");
  const header = document.querySelector("#siteHeader");
  const reveals = [...document.querySelectorAll(".reveal")];
  const chapters = [...document.querySelectorAll("[data-chapter]")];
  const navLinks = [...document.querySelectorAll("#chapterNav a")];
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduced) reveals.forEach((item) => item.classList.add("is-visible"));
  else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8%" });
    reveals.forEach((item) => revealObserver.observe(item));
  }

  const chapterObserver = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    const chapter = visible.target.dataset.chapter;
    navLinks.forEach((link) => link.classList.toggle("is-active", link.getAttribute("href") === `#chapter-${chapter}`));
  }, { threshold: [0.2, 0.45, 0.7], rootMargin: "-25% 0px -45%" });
  chapters.forEach((chapter) => chapterObserver.observe(chapter));

  let ticking = false;
  const renderScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? window.scrollY / max : 0;
    progress.style.transform = `scaleX(${Math.min(1, Math.max(0, ratio))})`;
    header.classList.toggle("is-scrolled", window.scrollY > 40);
    ticking = false;
  };
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(renderScroll);
  }, { passive: true });
  renderScroll();
})();
