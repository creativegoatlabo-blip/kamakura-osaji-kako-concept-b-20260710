document.documentElement.classList.add("js");

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

document.querySelectorAll("[data-carousel]").forEach((carousel) => {
  const slides = Array.from(carousel.querySelectorAll("[data-carousel-slide]"));
  const previousButton = carousel.querySelector("[data-carousel-prev]");
  const nextButton = carousel.querySelector("[data-carousel-next]");
  const toggleButton = carousel.querySelector("[data-carousel-toggle]");
  const captionOutputs = carousel.querySelectorAll("[data-carousel-caption]");
  const indexOutputs = carousel.querySelectorAll("[data-carousel-index]");
  const thumbnails = Array.from(carousel.querySelectorAll("[data-carousel-goto]"));
  const autoplay = carousel.dataset.autoplay === "true";

  if (slides.length < 2) return;

  let activeIndex = Math.max(
    0,
    slides.findIndex((slide) => slide.classList.contains("is-active")),
  );
  let autoplayTimer = null;
  let userPaused = false;
  let pointerInside = false;
  let focusInside = false;
  let inViewport = true;

  const render = (nextIndex) => {
    activeIndex = (nextIndex + slides.length) % slides.length;

    slides.forEach((slide, index) => {
      const active = index === activeIndex;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", String(!active));
    });

    const activeCaption = slides[activeIndex].dataset.caption || "";
    captionOutputs.forEach((output) => {
      output.textContent = activeCaption;
    });
    indexOutputs.forEach((output) => {
      output.textContent = String(activeIndex + 1).padStart(2, "0");
    });
    thumbnails.forEach((thumbnail, index) => {
      const active = index === activeIndex;
      thumbnail.classList.toggle("is-active", active);
      if (active) {
        thumbnail.setAttribute("aria-current", "true");
      } else {
        thumbnail.removeAttribute("aria-current");
      }
    });
  };

  const stopAutoplay = () => {
    if (autoplayTimer !== null) {
      window.clearTimeout(autoplayTimer);
      autoplayTimer = null;
    }
  };

  const canAutoplay = () =>
    autoplay &&
    !reducedMotion.matches &&
    !userPaused &&
    !pointerInside &&
    !focusInside &&
    inViewport &&
    !document.hidden;

  const scheduleAutoplay = () => {
    stopAutoplay();
    if (!canAutoplay()) return;

    autoplayTimer = window.setTimeout(() => {
      render(activeIndex + 1);
      scheduleAutoplay();
    }, 6500);
  };

  const syncToggle = () => {
    if (!toggleButton) return;

    if (reducedMotion.matches) {
      toggleButton.textContent = "自動再生なし";
      toggleButton.setAttribute("aria-pressed", "true");
      toggleButton.disabled = true;
      return;
    }

    toggleButton.disabled = false;
    toggleButton.textContent = userPaused ? "再生" : "一時停止";
    toggleButton.setAttribute("aria-pressed", String(userPaused));
  };

  captionOutputs.forEach((output) => {
    output.setAttribute("aria-live", autoplay ? "off" : "polite");
  });

  previousButton?.addEventListener("click", () => {
    render(activeIndex - 1);
    scheduleAutoplay();
  });

  nextButton?.addEventListener("click", () => {
    render(activeIndex + 1);
    scheduleAutoplay();
  });

  thumbnails.forEach((thumbnail) => {
    thumbnail.addEventListener("click", () => {
      render(Number(thumbnail.dataset.carouselGoto));
      scheduleAutoplay();
    });
  });

  toggleButton?.addEventListener("click", () => {
    userPaused = !userPaused;
    syncToggle();
    scheduleAutoplay();
  });

  if (autoplay) {
    carousel.addEventListener("pointerenter", () => {
      pointerInside = true;
      stopAutoplay();
    });

    carousel.addEventListener("pointerleave", () => {
      pointerInside = false;
      scheduleAutoplay();
    });

    carousel.addEventListener("focusin", () => {
      focusInside = true;
      stopAutoplay();
    });

    carousel.addEventListener("focusout", () => {
      window.requestAnimationFrame(() => {
        focusInside = carousel.contains(document.activeElement);
        scheduleAutoplay();
      });
    });

    const viewportObserver = new IntersectionObserver(
      ([entry]) => {
        inViewport = entry.isIntersecting;
        scheduleAutoplay();
      },
      { threshold: 0.15 },
    );

    viewportObserver.observe(carousel);
    document.addEventListener("visibilitychange", scheduleAutoplay);
    reducedMotion.addEventListener("change", () => {
      syncToggle();
      scheduleAutoplay();
    });
  }

  render(activeIndex);
  syncToggle();
  scheduleAutoplay();
});

const stickyCta = document.querySelector(".sticky-cta");
const stickyStart = document.querySelector("#memory");
const stickyEnd = document.querySelector("#booking");

let hasReachedStory = false;
let hasReachedBooking = false;

const updateStickyCta = () => {
  if (!stickyCta) return;
  stickyCta.classList.toggle("is-visible", hasReachedStory && !hasReachedBooking);
};

if (stickyCta && stickyStart) {
  const startObserver = new IntersectionObserver(
    ([entry]) => {
      hasReachedStory = entry.isIntersecting || entry.boundingClientRect.top < 0;
      updateStickyCta();
    },
    { threshold: 0 },
  );

  startObserver.observe(stickyStart);
}

if (stickyCta && stickyEnd) {
  const endObserver = new IntersectionObserver(
    ([entry]) => {
      hasReachedBooking = entry.isIntersecting || entry.boundingClientRect.top < 0;
      updateStickyCta();
    },
    { threshold: 0 },
  );

  endObserver.observe(stickyEnd);
}
