document.documentElement.classList.add("js");

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
