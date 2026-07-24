import { bestSeller } from "../components/index/bestSeller.js";
import { cards } from "../components/index/cards.js";

import {
  loadProducts,
  filterProduct,
  displayCategory,
  initializePriceSlider,
  displayFilters,
  resetFilters,
  formatPrice,
} from "./shop.js";
import {
  renderAboutCards,
  renderWhyUs,
  renderOurPromise,
  aboutIntersection,
} from "./about.js";
import { contactIntersection, sendMessage, FAQs } from "./contact.js";
import { newSubscriber } from "./footer.js";
async function fetchHTML() {
  const page = document.body.dataset.page;
  const app = document.getElementById("app"); //For page loader callback
  const body = document.body;

  //Callback
  app.innerHTML = `
        <div class="loading">
        <div class="spinner"></div>
        <p>Loading content...</p>
        </div>
    `;

  //Load content
  try {
    const [
      //Capture html files
      nav,
      foot,
    ] = await Promise.all([
      fetch("./components/navigation/nav.html").then((res) => {
        if (!res.ok) throw new Error("Navigation failed");
        return res.text();
      }),
      fetch("./components/footer/footer.html").then((res) => {
        if (!res.ok) throw new Error("Footer failed");
        return res.text();
      }),
    ]);
    body.insertAdjacentHTML("beforebegin", nav); //render nav first
    let sections = []; //store sections in an array
    if (page === "index") {
      sections = await Promise.all([
        fetch("./components/index/indexFirstSection.html").then((res) =>
          res.text(),
        ),
        fetch("./components/index/indexSecondSection.html").then((res) =>
          res.text(),
        ),
        fetch("./components/index/indexThirdSection.html").then((res) =>
          res.text(),
        ),
        fetch("./components/index/indexFourthSection.html").then((res) =>
          res.text(),
        ),
      ]);
    }
    if (page === "shop") {
      sections = await Promise.all([
        fetch("./components/shop/shopFirstSection.html").then((res) =>
          res.text(),
        ),
        fetch("./components/shop/shopSecondSection.html").then((res) =>
          res.text(),
        ),
      ]);
    }
    if (page === "about") {
      sections = await Promise.all([
        fetch("./components/about/aboutFirstSection.html").then((res) =>
          res.text(),
        ),
        fetch("./components/about/aboutSecondSection.html").then((res) =>
          res.text(),
        ),
        fetch("./components/about/aboutThirdSection.html").then((res) =>
          res.text(),
        ),
        fetch("./components/about/aboutFourthSection.html").then((res) =>
          res.text(),
        ),
        fetch("./components/about/aboutFifthSection.html").then((res) =>
          res.text(),
        ),
      ]);
    }
    if (page === "contact") {
      sections = await Promise.all([
        fetch("./components/contact/contactFirstSection.html").then((res) =>
          res.text(),
        ),
        fetch("./components/contact/contactSecondSection.html").then((res) =>
          res.text(),
        ),
        fetch("./components/contact/contactThirdSection.html").then((res) =>
          res.text(),
        ),
      ]);
    }
    //clear app content
    app.innerHTML = "";
    //render sections based on page
    sections.forEach((sec) => {
      app.insertAdjacentHTML("beforeend", sec);
    });
    //render footer
    body.insertAdjacentHTML("beforeend", foot);
  } catch (error) {
    console.log(error);
    app.innerHTML = `
            <div>
             <h2>Sorry for the inconvinience</h2>
                <p>Unable to load content</p>
                <button onclick="location.reload()">
                    Try again
                </button>
            </div>
        `;
  }
  //footer subscribe
  newSubscriber();

  loadFilterCards(); //I will change this into await in the future
  renderBestSellers();
  //renderOccasionCards();
  renderCards();
  displayNav();
  sectionsInterSections();
  goToShopFiltered(); //filter card of index

  //about contents
  renderAboutCards();
  renderWhyUs();
  renderOurPromise();
  aboutIntersection();

  //contact contents
  contactIntersection();
  FAQs();
  sendMessage();

  //shop contents
  //Category filter
  document.querySelectorAll('input[name="category"]').forEach((radio) => {
    radio.addEventListener("change", filterProduct);
  });
  //load filter first since its from index html
  const params = new URLSearchParams(window.location.search);
  //const selectedCategory = params.get("category");
  async function initShop() {
    //Occasion filter
    document.querySelectorAll('input[name="occasions"]').forEach((radio) => {
      radio.addEventListener("change", filterProduct);
    });
    await loadProducts(); //apply the loading of product here since filter in index is async
    const params = new URLSearchParams(window.location.search);
    const selectedOccasion = params.get("occasion");

    if (selectedOccasion) {
      const radio = document.querySelector(
        `input[name="occasions"][value="${selectedOccasion}"]`,
      );

      if (radio) {
        radio.checked = true;
        filterProduct();
      }
    }
  }
  initShop();
  //Price filter
  const minSlider = document.getElementById("min-price");
  const maxSlider = document.getElementById("max-price");
  if (!minSlider || !maxSlider) return;
  minSlider.addEventListener("input", filterProduct);
  maxSlider.addEventListener("input", filterProduct);

  //Color filter
  document.querySelectorAll('input[name="color"]').forEach((radio) => {
    radio.addEventListener("change", filterProduct);
  });

  //filterProduct();
  displayCategory();
  initializePriceSlider();
  displayFilters();
  resetFilters();
}

document.addEventListener("DOMContentLoaded", fetchHTML);

//Render index cards
//firstSection content
function renderBestSellers() {
  const cards = document.querySelector(".best-seller-cards");
  if (!cards) return;
  //li.innerHTML = "";
  bestSeller.map((item) => {
    const li = document.createElement("li");
    li.innerHTML = `
    <img src=${item.image} alt="bouquet-1" />
        <div>
          <small>Best Seller</small>
          <span>${item.product}</span>
          <p>${item.description}</p>
          <div class="price-btn-con">
            <span class="price">${formatPrice(item.price)}</span>
            <button aria-label="Add to cart" class="add-to-cart-btn">
              <i class="fa-solid fa-cart-shopping"></i>
              Add to Cart →
            </button>
          </div>
        </div>
  `;
    cards.append(li);
  });
}
let filterCards = [];
let filteringCard = [];
const API_URL =
  "https://script.google.com/macros/s/AKfycbxUJ_DkojSxACQtgGQvsaaQ6HqwiS3Xz3w2JTpAlZEIFUlS-7PllkX3u8xlFDSiBRJ0/exec";
async function loadFilterCards() {
  try {
    //const response = await fetch(API_URL); original fetching
    const response = await fetch(`${API_URL}?type=index-filter-cards`); //send type to just fetch related files only
    if (!response.ok) {
      throw new Error("Failed to fetch filter-cards");
    }
    const data = await response.json();
    console.log(data);
    console.log(data.filterCards);
    filterCards = formatFilterCards(data.filterCards); //data.name_of_data is from apps script
    filteringCard = [...filterCards]; //spread inside array

    renderOccasionCards(filteringCard);
    console.log(filteringCard); //for checking captures
  } catch (error) {
    console.error(error);
  }
}

function formatFilterCards(filterCards) {
  return filterCards.map((card) => ({
    no: Number(card.No),
    filterValue: card.FilterValue,
    mainImage: card.MainImage,
    circleImage: card.CircleImage,
    cardTitle: card.CardTitle,
    cardText: card.CardText,
  }));
}

//secondSection content
function renderOccasionCards(filteringCard) {
  const cards = document.querySelector(".occasion-list");
  if (!cards) return;
  filteringCard.map((item) => {
    const li = document.createElement("li");
    li.classList.add("to-shop-filter-item");
    li.innerHTML = `
      <div class="image-wrapper">
          <img
            src=${item.mainImage}
            alt="bouquet ${item.no}"
            class="bouquet-img"
          />
          <img
            src=${item.circleImage}
            alt="image-icon-${item.no}"
            class="round-images"
          />
        </div>
        <span>${item.cardTitle}</span>
        <p>${item.cardText}</p>
        <small>Explore More</small>
    `;
    cards.append(li);
  });
}
//thirdSection content
function renderCards() {
  const cardTiles = document.querySelector(".why-us-list");
  if (!cardTiles) return;
  cards.map((item) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <img
        src=${item.mainImage}
        alt=${item.mainImgAlt}
        class="why-us-icon"
      />
      <span>${item.cardTitle}</span>
      <div class="heart-con">
        <img src="./images/index/fourthSection/heart.svg" alt="heart-image" />
      </div>
      <p>${item.cardText}</p>
    `;
    cardTiles.append(li);
  });
}
function sectionsInterSections() {
  const interSectItems = document.querySelectorAll(".intersect-items");
  if (!interSectItems.length) return;
  const observer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("intersect");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
    },
  );
  interSectItems.forEach((item) => observer.observe(item));
}

//Selecting card from index html
function goToShopFiltered() {
  const filterBtn = document.querySelectorAll(".to-shop-filter-item");

  filterBtn.forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.closest("li");
      const category = btn.querySelector("span").textContent.trim();
      window.location.href = `shop.html?occasion=${encodeURIComponent(category)}`;
    });
  });
}
