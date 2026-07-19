import { aboutCards } from "../components/about/aboutCard.js";
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
