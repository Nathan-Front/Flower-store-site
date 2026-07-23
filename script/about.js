import { aboutCards, aboutBottomCards } from "../components/about/aboutCard.js";
import { whyChooseUs } from "../components/about/whyUs.js";
export function renderAboutCards() {
  const cards = document.querySelector(".about-card-list");
  if (!cards) return;
  aboutCards.map((item) => {
    const li = document.createElement("li");
    li.innerHTML = `
        <img src=${item.cardImg} alt=${item.cardImgAlt} />
        <div>
          <span>${item.cardTitle}</span>
          <p>${item.cardText}</p>
        </div>
    `;
    cards.append(li);
  });
}
//Render upper cards
export function renderWhyUs() {
  const cards = document.querySelector(".about-why-us-list");
  if (!cards) return;
  whyChooseUs.map((item) => {
    const li = document.createElement("li");
    li.innerHTML = `
            <img src="./images/about/fourthSection/check-circle.svg" alt="check-icon" />
            <p>${item.whyText}</p>
        `;
    cards.append(li);
  });
}
//render lower cards
export function renderOurPromise() {
  const cards = document.querySelector(".about-card-bot-list");
  if (!cards) return;
  aboutBottomCards.map((item) => {
    const li = document.createElement("li");
    li.innerHTML = `
            <img src=${item.cardImg} alt=${item.cardImgAlt} />
            <div>
              <span>${item.cardTitle}</span>
              <p>${item.cardText}</p>
            </div>
        `;
    cards.append(li);
  });
}
//Intersection function
export function aboutIntersection() {
  const interSect = document.querySelectorAll(".about-intersecting");
  if (!interSect.length) return;
  const observer = new IntersectionObserver(
    (entries, observe) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("about-intersect");
          observe.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.2,
    },
  );
  interSect.forEach((item) => observer.observe(item));
}
