document.documentElement.classList.add("js");

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

document.querySelectorAll("[data-carousel]").forEach((carousel) => {
  const slides = Array.from(carousel.querySelectorAll("[data-carousel-slide]"));
  const previousButton = carousel.querySelector("[data-carousel-prev]");
  const nextButton = carousel.querySelector("[data-carousel-next]");
  const toggleButton = carousel.querySelector("[data-carousel-toggle]");
  const captions = carousel.querySelectorAll("[data-carousel-caption]");
  const indexes = carousel.querySelectorAll("[data-carousel-index]");
  const autoplay = carousel.dataset.autoplay === "true";

  if (slides.length < 2) return;

  let activeIndex = Math.max(0, slides.findIndex((slide) => slide.classList.contains("is-active")));
  let timer = null;
  let userPaused = false;
  let pointerInside = false;
  let focusInside = false;

  const render = (nextIndex) => {
    activeIndex = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, index) => {
      const isActive = index === activeIndex;
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
    });

    const caption = slides[activeIndex].dataset.caption || "";
    captions.forEach((output) => {
      output.textContent = caption;
    });
    indexes.forEach((output) => {
      output.textContent = String(activeIndex + 1).padStart(2, "0");
    });
  };

  const stop = () => {
    if (timer !== null) {
      window.clearTimeout(timer);
      timer = null;
    }
  };

  const canAutoplay = () =>
    autoplay && !reducedMotion.matches && !userPaused && !pointerInside && !focusInside && !document.hidden;

  const schedule = () => {
    stop();
    if (!canAutoplay()) return;
    timer = window.setTimeout(() => {
      render(activeIndex + 1);
      schedule();
    }, 6500);
  };

  const syncToggle = () => {
    if (!toggleButton) return;
    if (reducedMotion.matches) {
      toggleButton.textContent = "自動再生なし";
      toggleButton.disabled = true;
      toggleButton.setAttribute("aria-pressed", "true");
      return;
    }
    toggleButton.disabled = false;
    toggleButton.textContent = userPaused ? "再生" : "一時停止";
    toggleButton.setAttribute("aria-pressed", String(userPaused));
  };

  previousButton?.addEventListener("click", () => {
    render(activeIndex - 1);
    schedule();
  });

  nextButton?.addEventListener("click", () => {
    render(activeIndex + 1);
    schedule();
  });

  toggleButton?.addEventListener("click", () => {
    userPaused = !userPaused;
    syncToggle();
    schedule();
  });

  if (autoplay) {
    carousel.addEventListener("pointerenter", () => {
      pointerInside = true;
      stop();
    });
    carousel.addEventListener("pointerleave", () => {
      pointerInside = false;
      schedule();
    });
    carousel.addEventListener("focusin", () => {
      focusInside = true;
      stop();
    });
    carousel.addEventListener("focusout", () => {
      window.requestAnimationFrame(() => {
        focusInside = carousel.contains(document.activeElement);
        schedule();
      });
    });
    document.addEventListener("visibilitychange", schedule);
    reducedMotion.addEventListener("change", () => {
      syncToggle();
      schedule();
    });
  }

  render(activeIndex);
  syncToggle();
  schedule();
});

const stickyCta = document.querySelector("[data-sticky-cta]");
const stickyStart = document.querySelector("#guide");
const stickyEnd = document.querySelector("#final");

if (stickyCta && stickyStart && stickyEnd) {
  let queued = false;

  const updateStickyCta = () => {
    const startBox = stickyStart.getBoundingClientRect();
    const endBox = stickyEnd.getBoundingClientRect();
    const hasPassedStart = startBox.top < window.innerHeight * 0.45;
    const hasReachedEnd = endBox.top < window.innerHeight * 0.8;
    stickyCta.classList.toggle("is-visible", hasPassedStart && !hasReachedEnd);
    queued = false;
  };

  const queueUpdate = () => {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(updateStickyCta);
  };

  window.addEventListener("scroll", queueUpdate, { passive: true });
  window.addEventListener("resize", queueUpdate);
  updateStickyCta();
}
