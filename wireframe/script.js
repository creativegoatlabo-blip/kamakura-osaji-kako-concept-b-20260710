document.documentElement.classList.add("js");

const siteHeader = document.querySelector("[data-site-header]");
const heroSection = document.querySelector(".hero");

if (siteHeader && heroSection) {
  const setSiteHeaderVisibility = (isVisible) => {
    siteHeader.classList.toggle("is-visible", isVisible);
    siteHeader.setAttribute("aria-hidden", String(!isVisible));
    siteHeader.toggleAttribute("inert", !isVisible);
  };

  const heroObserver = new IntersectionObserver(([entry]) => {
    const hasPassedHero = !entry.isIntersecting && entry.boundingClientRect.bottom <= 0;
    setSiteHeaderVisibility(hasPassedHero);
  });

  heroObserver.observe(heroSection);
}

const annotationToggle = document.querySelector("[data-annotation-toggle]");

if (annotationToggle) {
  const shortLabel = window.matchMedia("(max-width: 600px)");

  const updateAnnotationLabel = () => {
    const isHidden = document.body.classList.contains("annotations-hidden");
    annotationToggle.setAttribute("aria-pressed", String(!isHidden));
    annotationToggle.textContent = shortLabel.matches
      ? isHidden
        ? "注釈ON"
        : "注釈OFF"
      : isHidden
        ? "設計ラベルを表示"
        : "設計ラベルを隠す";
  };

  annotationToggle.addEventListener("click", () => {
    document.body.classList.toggle("annotations-hidden");
    updateAnnotationLabel();
  });

  shortLabel.addEventListener("change", updateAnnotationLabel);
  updateAnnotationLabel();
}

const stickyCta = document.querySelector("[data-sticky-cta]");
const stickyStart = document.querySelector("#offer");
const stickyEnd = document.querySelector("#faq");

if (stickyCta && stickyStart && stickyEnd) {
  let queued = false;

  const updateStickyCta = () => {
    const hasPassedStart = stickyStart.getBoundingClientRect().top < window.innerHeight * 0.5;
    const hasReachedEnd = stickyEnd.getBoundingClientRect().top < window.innerHeight * 0.85;
    const isVisible = hasPassedStart && !hasReachedEnd;
    stickyCta.classList.toggle("is-visible", isVisible);
    stickyCta.setAttribute("aria-hidden", String(!isVisible));
    stickyCta.toggleAttribute("inert", !isVisible);
    document.body.classList.toggle("sticky-cta-visible", isVisible);
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

const reservationDialog = document.querySelector("[data-reservation-dialog]");
const openReservationButtons = document.querySelectorAll("[data-open-reservation]");
const closeReservationButton = document.querySelector("[data-close-reservation]");

if (reservationDialog instanceof HTMLDialogElement) {
  openReservationButtons.forEach((button) => {
    button.addEventListener("click", () => reservationDialog.showModal());
  });

  closeReservationButton?.addEventListener("click", () => reservationDialog.close());

  reservationDialog.addEventListener("click", (event) => {
    if (event.target === reservationDialog) reservationDialog.close();
  });
}

const shareButton = document.querySelector("[data-share]");
const shareStatus = document.querySelector("[data-share-status]");

if (shareButton) {
  const defaultLabel = shareButton.textContent;

  const setTemporaryLabel = (label) => {
    shareButton.textContent = label;
    if (shareStatus) shareStatus.textContent = label;
    window.setTimeout(() => {
      shareButton.textContent = defaultLabel;
      if (shareStatus) shareStatus.textContent = "";
    }, 2400);
  };

  shareButton.addEventListener("click", async () => {
    const shareData = {
      title: document.title,
      text: "結婚指輪・婚約指輪と、ふたりの香りをつくる蔵前限定コース",
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      await navigator.clipboard.writeText(window.location.href);
      setTemporaryLabel("ページURLをコピーしました");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setTemporaryLabel("URLをコピーできませんでした");
    }
  });
}
