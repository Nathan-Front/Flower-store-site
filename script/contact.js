export function contactIntersection() {
  const interSect = document.querySelectorAll(".contact-intersecting");
  if (!interSect) return;
  const observer = new IntersectionObserver(
    (entries, observe) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("contact-intersect");
          observe.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
    },
  );
  interSect.forEach((item) => observer.observe(item));
}
