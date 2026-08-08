import {
  loadBouquets,
  filterProduct,
  displayCategory,
  initializePriceSlider,
  displayFilters,
  resetFilters,
  formatPrice,
  cartCounterDisplay,
  viewCartModal,
} from "./shop.js";
import {
  renderAboutCards,
  renderWhyUs,
  renderOurPromise,
  aboutIntersection,
} from "./about.js";
import { contactIntersection, sendMessage, FAQs } from "./contact.js";
import { newSubscriber } from "./footer.js";
import {
  cartCheckoutSummary,
  loadCheckoutDisplay,
  renderCheckoutData,
  checkCartAvailability,
  updateCheckoutFormState,
} from "./cart.js";
import {
  updatePaymentMethod,
  placeOrderCOD,
  initPaymentValidation,
} from "./app.js";
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
    if (page === "cart") {
      sections = await Promise.all([
        fetch("./components/cart/cartFirstSection.html").then((res) =>
          res.text(),
        ),
        fetch("./components/cart/cartSecondSection.html").then((res) =>
          res.text(),
        ),
        fetch("./components/cart/cartThirdSection.html").then((res) =>
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

  //index contents
  if (page === "index") {
    Promise.all([loadBestSellers(), loadFilterCards(), loadWhyUsCards()]).catch(
      (error) => {
        console.error("Failed to load index content:", error);
      },
    );
  }
  displayNav();
  sectionsInterSections();
  //from shop.js
  cartCounterDisplay();
  viewCartModal();
  //from cart.js
  if (page === "cart") {
    cartCheckoutSummary();
    loadCheckoutDisplay();
    updateCheckoutFormState();
    checkCartAvailability();
    updatePaymentMethod();
    document
      .querySelectorAll('input[name="paymentMethod"]')
      .forEach((input) => {
        input.addEventListener("change", updatePaymentMethod);
      });
    initPaymentValidation();
    placeOrderCOD();
  }

  //about contents
  if (page === "about") {
    renderAboutCards();
    renderWhyUs();
    renderOurPromise();
    aboutIntersection();
  }

  //contact contents
  if (page === "contact") {
    contactIntersection();
    FAQs();
    sendMessage();
  }

  //shop contents
  //Category filter
  if (page === "shop") {
    document.querySelectorAll('input[name="category"]').forEach((radio) => {
      radio.addEventListener("change", filterProduct);
    });
    async function initShop() {
      document.querySelectorAll('input[name="occasions"]').forEach((radio) => {
        radio.addEventListener("change", filterProduct);
      });
      await loadBouquets(); //load bouquets here for index and shop filter functions
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
    const minSlider = document.getElementById("min-price");
    const maxSlider = document.getElementById("max-price");
    if (minSlider && maxSlider) {
      minSlider.addEventListener("input", filterProduct);
      maxSlider.addEventListener("input", filterProduct);
    }
    document.querySelectorAll('input[name="color"]').forEach((radio) => {
      radio.addEventListener("change", filterProduct);
    });
    displayCategory();
    initializePriceSlider();
    displayFilters();
    resetFilters();
  }
}

document.addEventListener("DOMContentLoaded", fetchHTML);
//fetch data from google sheet first
let indexProducts = [];
const API_URL =
  "https://script.google.com/macros/s/AKfycbyKLPGoQElgHbTen7D6Xsqlwodlfaj3ikkim-QEeal7xp1a6iQR3ScmZQURg3ziFGLJ/exec";
export async function fetchSpecificSheet(sheetType, key, dataFormatter) {
  try {
    const response = await fetch(`${API_URL}?type=${sheetType}`); //send type to just fetch related files only
    if (!response.ok) {
      throw new Error("Failed to fetch cards");
    }
    const data = await response.json();
    /* console.log(data); //for debugging only
    console.log(data[key]); */ //for debugging only
    return dataFormatter ? dataFormatter(data[key]) : data[key];
  } catch (error) {
    console.log(`Error fetching ${sheetType}:`, error);
    throw error; //Re-throw so the caller knows it failed
  }
}

//Shared spinner loaders
export function setSectionLoading(section, isLoading) {
  if (!section) return;
  const loading = section.querySelector(".product-loading");
  if (loading) {
    loading.hidden = !isLoading;
  }
}

//error message
export function showSectionError(section) {
  const errorMessage = document.createElement("div");
  errorMessage.classList.add("section-error");
  errorMessage.innerHTML = `
    <p>We couldn't load this section."</p>
    <span>Please reload the page and try again.</span>
  `;
  section.appendChild(errorMessage);
}

//loader for each section
async function loadBestSellers() {
  //const response = await fetch(API_URL); original fetching
  /*  const response = await fetch(`${API_URL}?type=index-filter-cards`); 
    if (!response.ok) {
      throw new Error("Failed to fetch filter-cards");
    } */
  const secondSection = document.querySelector(".index-second-sec");
  setSectionLoading(secondSection, true); //pass true
  try {
    indexProducts = await fetchSpecificSheet(
      "best-seller-cards", //Case in apps script
      "bestSellers", //Declared name in apps script
      formatBestSellers, //spre
    );
    renderBestSellers(indexProducts);
  } catch (error) {
    console.log(error);
    showSectionError(secondSection);
  } finally {
    setSectionLoading(secondSection, false);
  }
}
async function loadFilterCards() {
  const thirdSection = document.querySelector(".index-third-sec");
  setSectionLoading(thirdSection, true);
  try {
    indexProducts = await fetchSpecificSheet(
      "index-filter-cards",
      "filterCards",
      formatFilterCards,
    );
    renderOccasionCards(indexProducts);
  } catch (error) {
    console.log(error);
    showSectionError(thirdSection);
  } finally {
    setSectionLoading(thirdSection, false);
  }
}
async function loadWhyUsCards() {
  const fourthSection = document.querySelector(".index-fourth-sec");
  setSectionLoading(fourthSection, true);
  try {
    indexProducts = await fetchSpecificSheet(
      "why-us-cards",
      "whyUsCards",
      formatWhyUsCards,
    );
    renderCards(indexProducts);
  } catch (error) {
    console.log(error);
    showSectionError(fourthSection);
  } finally {
    setSectionLoading(fourthSection, false);
  }
}

//format back data to numbers and strings
function formatBestSellers(data) {
  return data.map((card) => ({
    no: Number(card.No),
    product: card.product,
    price: Number(card.price),
    description: card.description,
    image: card.image,
    imageAlt: card.imageAlt,
    review: card.review,
    rate: card.rateTotal,
    condition: card.condition,
  }));
}
function formatFilterCards(data) {
  return data.map((card) => ({
    no: Number(card.No),
    filterValue: card.FilterValue,
    mainImage: card.MainImage,
    circleImage: card.CircleImage,
    cardTitle: card.CardTitle,
    cardText: card.CardText,
  }));
}
function formatWhyUsCards(data) {
  return data.map((card) => ({
    no: Number(card.No),
    mainImage: card.MainImage,
    mainImageAlt: card.MainImageAlt,
    cardTitle: card.CardTitle,
    cardText: card.CardText,
  }));
}

//Render index cards
//secondSection content
function renderBestSellers(bestSell) {
  console.count("loadBestSellerCards");
  const cards = document.querySelector(".best-seller-cards");
  if (!cards) return;
  //li.innerHTML = "";
  bestSell.map((item) => {
    const li = document.createElement("li");
    li.innerHTML = `
    <img src=${item.image} alt='bouquet-${item.no}' loading="lazy"/>
        <div>
          <small>Best Seller</small>
          <span>${item.product}</span>
          <p>${item.description}</p>
          <div class="price-btn-con">
            <span class="price">${formatPrice(item.price)}</span> 
            <button aria-label="Add to cart" class="add-to-cart-best-seller" data-product-id=${item.no}>
              <i class="fa-solid fa-cart-shopping"></i>
              Add to Cart →
            </button>
          </div>
        </div>
  `;
    cards.append(li);
  });
  addToCartBestSeller();
}

//thirdSection content
function renderOccasionCards(filteringCard) {
  console.count("loadFilterCards");
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
            loading="lazy"
          />
          <img
            src=${item.circleImage}
            alt="image-icon-${item.no}"
            class="round-images"
            loading="lazy"
          />
        </div>
        <span>${item.cardTitle}</span>
        <p>${item.cardText}</p>
        <small>Explore More</small>
    `;
    cards.append(li);
  });
  goToShopFiltered();
}
//fourthSection content
function renderCards(whyUsCards) {
  console.count("loadWhyUsCards");
  const cardTiles = document.querySelector(".why-us-list");
  if (!cardTiles) return;
  whyUsCards.map((item) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <img
        src=${item.mainImage}
        alt=${item.mainImgAlt}
        class="why-us-icon"
        loading="lazy"
      />
      <span>${item.cardTitle}</span>
      <div class="heart-con">
        <img src="./images/index/fourthSection/heart.svg" alt="heart-image" loading="lazy"/>
      </div>
      <p>${item.cardText}</p>
    `;
    cardTiles.append(li);
  });
}

//shared intersection
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

//add to cart best seller
export function addToCartBestSeller() {
  const addToCart = document.querySelectorAll(".add-to-cart-best-seller");
  addToCart.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const productId = e.currentTarget.dataset.productId;
      window.location.href = `./shop.html?product=${productId}`;
    });
  });
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
