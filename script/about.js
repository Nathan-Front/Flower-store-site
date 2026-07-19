import { aboutCards } from "../components/about/aboutCard.js";
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
