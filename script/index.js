import { bestSeller } from "../components/index/bestSeller.js";
import { occasions } from "../components/index/occasions.js";
import { cards } from "../components/index/cards.js";
import { bouquets } from "../components/shop/flowers.js";
import {
  renderAboutCards,
  renderWhyUs,
  renderOurPromise,
  aboutIntersection,
} from "./about.js";
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
  //renderProducts(bouquets); //Must be loaded first
  renderBestSellers();
  renderOccasionCards();
  renderCards();
  displayNav();
  sectionsInterSections();
  goToShopFiltered();

  //about contents
  renderAboutCards();
  renderWhyUs();
  renderOurPromise();
  aboutIntersection();

  //Category filter
  document.querySelectorAll('input[name="category"]').forEach((radio) => {
    radio.addEventListener("change", filterProduct);
  });
  //Occasion filter
  document.querySelectorAll('input[name="occasions"]').forEach((radio) => {
    radio.addEventListener("change", filterProduct);
  });
  //load filter first since its from index html
  const params = new URLSearchParams(window.location.search);
  const selectedCategory = params.get("category");
  if (selectedCategory) {
    const radio = document.querySelector(
      `input[name="occasions"][value="${selectedCategory}"]`,
    );
    if (radio) {
      radio.checked = true;
      radio.dispatchEvent(new Event("change"));
    }
  }
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
  //filterCategory();
  filterProduct();
  //createPagination();
  //displayPage(1); //start of page
  displayCategory();
  initializePriceSlider();
  displayFilters();
  //renderSelectedProduct();
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
//secondSection content
function renderOccasionCards() {
  const cards = document.querySelector(".occasion-list");
  if (!cards) return;
  occasions.map((item) => {
    const li = document.createElement("li");
    li.classList.add("to-shop-filter-item");
    li.innerHTML = `
      <div class="image-wrapper">
          <img
            src=${item.mainImg}
            alt="bouquet ${item.no}"
            class="bouquet-img"
          />
          <img
            src=${item.circleImg}
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
      window.location.href = `shop.html?category=${encodeURIComponent(category)}`;
    });
  });
}

//shop.html
//get cards per page
function getCardsPerPage() {
  if (window.innerWidth <= 540) return 6; // 1 × 6
  if (window.innerWidth <= 920) return 8; // 2 × 4
  return 12; // 4 × 3
}
let currentPage = 1;
//Update button count display when width changes
let currentCardsPerPage = getCardsPerPage();
window.addEventListener("resize", () => {
  const newCardsPerPage = getCardsPerPage();
  if (newCardsPerPage !== currentCardsPerPage) {
    currentCardsPerPage = newCardsPerPage;
    createPagination();
    displayPage(currentPage);
  }
});
//Create page
function createPagination() {
  const cards = document.querySelectorAll(".flower-grid li");
  const paginationContainer = document.querySelector(".pagination");
  if (!cards || !paginationContainer) return;
  const cardsPerPage = getCardsPerPage();
  const totalPages = Math.ceil(cards.length / cardsPerPage);
  currentPage = Math.min(currentPage, totalPages || 1); //always return the smaller number of the two
  paginationContainer.innerHTML = "";
  for (let i = 1; i <= totalPages; i++) {
    const button = document.createElement("button");
    button.textContent = i;
    button.classList.add("page-btn");
    button.addEventListener("click", () => {
      currentPage = i;
      displayPage(currentPage);
    });
    paginationContainer.appendChild(button);
  }
}
//Display page
function displayPage(page) {
  const cards = document.querySelectorAll(".flower-grid li");
  if (!cards) return;
  const cardsPerPage = getCardsPerPage();
  const start = (page - 1) * cardsPerPage;
  const end = start + cardsPerPage;
  cards.forEach((card, index) => {
    card.style.display = index >= start && index < end ? "flex" : "none";
  });
  updateActivePage();
  displayCountPerPage();
}
//Highlight the active page button
function updateActivePage() {
  const pageButtons = document.querySelectorAll(".page-btn");
  if (!pageButtons) return;
  pageButtons.forEach((button, index) => {
    button.classList.toggle("activePage", index + 1 === currentPage);
  });
}
//Display total item per page counter
function displayCountPerPage() {
  const products = document.querySelectorAll(".flower-grid li");
  if (!products) return;
  const productTotal = products.length;
  const productsPerPage = getCardsPerPage();
  const start = (currentPage - 1) * productsPerPage + 1;
  const end = Math.min(currentPage * productsPerPage, productTotal);
  const startCount = document.querySelector(".start-flower-count-per-page");
  const endCount = document.querySelector(".end-flower-count-per-page");
  const totalFlowers = document.querySelector(".total-fowers");
  if (!startCount || !endCount || !totalFlowers) return;
  startCount.textContent = start;
  endCount.textContent = end;
  totalFlowers.textContent = productTotal;
}

//Display category's selections
function displayCategory() {
  const categoryTitles = document.querySelectorAll(".category-title");
  const priceFilter = document.querySelector(".price-filter");
  if (!categoryTitles || !priceFilter) return;
  categoryTitles.forEach((titleBtn) => {
    const allCategoryLists = titleBtn.closest("li").querySelector("div");
    const titleIcon = titleBtn.querySelector("span");
    titleBtn.addEventListener("click", (e) => {
      titleIcon.innerHTML = titleIcon.innerHTML === "+" ? "−" : "+";
      allCategoryLists.classList.toggle("showCategory");
      priceFilter.classList.add("price-filter-pad");
    });
  });
}

//To display filter categories
function displayFilters() {
  const displayInput = document.querySelector(".filter-btn");
  const displayFilters = document.querySelector(".left-con");
  if (!displayInput || !displayFilters) return;
  displayInput.addEventListener("click", () => {
    displayFilters.classList.toggle("show-filters");
  });
  document.addEventListener("click", (e) => {
    if (
      !displayFilters.contains(e.target) &&
      !displayInput.contains(e.target)
    ) {
      displayFilters.classList.remove("show-filters");
    }
  });
}

//Render product list
function renderProducts(filtered) {
  const cardContainer = document.querySelector(".flower-grid");
  if (!cardContainer) return;
  cardContainer.innerHTML = "";
  filtered.map((item) => {
    const li = document.createElement("li");
    li.innerHTML = `
        ${
          item.condition
            ? `<small class="flower-badge ${item.condition}">${getProductBadge(item.condition)}</small>`
            : ""
        }
        <img
            src="${item.image}"
            alt="${item.imgAlt}-image"
            class="bouquet-img"
        />
        <div class="flower-info">
          <div class="product-name">
            <h4>${item.product}</h4>
            <img
              src="./images/shop/secondSection/heart-round.svg"
              alt="heart-icon"
              class="flower-heart-icon"
            />
          </div>
          <div class="product-description"><p>${item.description}</p></div>
          <div class="product-rating">
         ${displayProductRating(item)}
          </div>
          <div class="product-price">
            <span class="flower-price">${formatPrice(item.price)}</span>
            <button class="cart-btn">
              <i class="fa-solid fa-cart-shopping cart-icon"></i>
              <span>Add To Cart</span>
            </button>
          </div>
        </div>
    `;

    cardContainer.append(li);
  });
  renderSelectedProduct();
}

//filter by occasion
function filterProduct() {
  const checkedCategory = document.querySelector(
    'input[name="category"]:checked',
  )?.value;
  const checkedOccasion = document.querySelector(
    'input[name="occasions"]:checked',
  )?.value;
  const checkedColor = document.querySelector(
    'input[name="color"]:checked',
  )?.value;

  let filtered = bouquets; //get the product array

  //Category filter
  if (checkedCategory && checkedCategory !== "all-bouquets") {
    filtered = filtered.filter((item) => item.category === checkedCategory);
  }
  //Occasions filter
  if (checkedOccasion && checkedOccasion !== "all-section") {
    filtered = filtered.filter((item) =>
      item.occasion.includes(checkedOccasion),
    );
  }
  //Price filter
  const min = Number(document.getElementById("min-price").value);
  const max = Number(document.getElementById("max-price").value);
  filtered = filtered.filter((item) => item.price >= min && item.price <= max);

  //Color filter
  if (checkedColor && checkedColor !== "all-color") {
    filtered = filtered.filter((item) => item.color === checkedColor);
  }

  renderProducts(filtered);

  currentPage = 1; //need to re-declare inside this function to be able to reset the counter start to 1
  createPagination(); //recreate the page buttons
  displayPage(currentPage); //updates the page content
}

//render badge
function getProductBadge(condition) {
  switch (condition) {
    case "new":
      return "New";
    case "best":
      return "Best Seller";
    case "limited":
      return "Limited";
    case "sale":
      return "Sale";
    default:
      return "";
  }
}
//Generate the star rating
function getProductRatings(rating) {
  let html = "";
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      html += '<i class="fa-solid fa-star active"></i>';
    } else if (rating >= i - 0.5) {
      html += '<i class="fa-solid fa-star-half-stroke active"></i>';
    } else {
      html += '<i class="fa-regular fa-star"></i>';
    }
  }
  return html;
}

//price range slider
function updateSliderTrack() {
  const track = document.querySelector(".slider-track");
  const minSlider = document.getElementById("min-price");
  const maxSlider = document.getElementById("max-price");
  const minValue = document.getElementById("min-value");
  const maxValue = document.getElementById("max-value");
  if (!track || !minSlider || !maxSlider) return;
  const min = Number(minSlider.value);
  const max = Number(maxSlider.value);
  //Prevent the sliders from crossing
  if (min > max) {
    minSlider.value = max;
    return updateSliderTrack();
  }
  //Update displayed values
  minValue.textContent = min;
  maxValue.textContent = max;
  //Update track
  const left = (min / Number(minSlider.max)) * 100;
  const right = (max / Number(maxSlider.max)) * 100;
  track.style.background = `
        linear-gradient(
            to right,
            #ead9df ${left}%,
            #a64b66 ${left}%,
            #a64b66 ${right}%,
            #ead9df ${right}%
        )
    `;
}
function initializePriceSlider() {
  const minSlider = document.getElementById("min-price");
  const maxSlider = document.getElementById("max-price");
  if (!minSlider || !maxSlider) return;
  minSlider.addEventListener("input", updateSliderTrack);
  maxSlider.addEventListener("input", updateSliderTrack);
  updateSliderTrack();
}

//pass the star ratings
function displayProductRating(product) {
  return `
        ${getProductRatings(product.rateTotal)}
        <span>(${product.review})</span>
    `;
}
//pass the price format
function formatPrice(price) {
  const [whole, decimal] = price.toFixed(2).split(".");
  return `
        $${whole}<small>.${decimal}</small>
    `;
}

//Selected product detail modal
function renderSelectedProduct() {
  const addToCartBtn = document.querySelectorAll(".cart-btn");
  if (!addToCartBtn) return;

  addToCartBtn.forEach((btn) => {
    btn.addEventListener("click", () => {
      const product = btn.closest("li");
      const img = product.closest("li").querySelector("img");
      const productName = product.closest("li").querySelector(".product-name");
      const productRate = product
        .closest("li")
        .querySelector(".product-rating");
      const productPrice = product.closest("li").querySelector(".flower-price");
      const productDescription = product
        .closest("li")
        .querySelector(".product-description p");
      const asideCon = document.createElement("aside");
      asideCon.classList = "aside-con";
      console.log(product);
      asideCon.innerHTML = `
            <button class="close-modal-btn">Close</button>
            <div class="aside-product-image">
            
                <div class="aside-main-img">
                    <img src=${img.src} alt=${img.imgAlt} />
                </div>
                <ul class="aside-sub-img">
                    <li><img src=${img.src} alt=${img.imgAlt} /></li>
                    <li><img src=${img.src} alt=${img.imgAlt} /></li>
                    <li><img src=${img.src} alt=${img.imgAlt} /></li>
                    <li><img src=${img.src} alt=${img.imgAlt} /></li>
                </ul>
            </div>
             <div class="aside-product-details">
                <span class="aside-product-title">${productName.textContent}</span>
                <div class="product-rating-modal">
                ${productRate.innerHTML}
                </div>
                <span class="aside-product-price">${productPrice.textContent}</span>
                <p class="aside-product-detail">${productDescription.textContent}</p>
                <div class="quantity-con">
                    <span>Quantity:</span>
                    <div class="add-minus-con">
                        <button id="minus-qty-btn">−</button>
                        <div class="qty-display-con">
                          <span class="qty-display">0</span>
                        </div>
                        <button id="add-qty-btn">+</button>
                    </div>
                </div>
                <div class="add-buy-con">
                    <button id="add-to-cart">Add To Cart</button>
                    <button id="buy-now">Buy Now</button>
                </div>
                <ul class="modal-footer">
                    <li>
                        <img src="./images/index/secondSection/flower-tulip-svgrepo-com.svg" alt="flower-icon" />
                        <div>
                            <span>Fresh</span>
                            <span>Flower</span>
                        </div>
                    </li>
                    <li>
                        <img src="./images/index/secondSection/delivery-fast-svgrepo-com.svg" alt="delivery-icon" />
                        <div>
                            <span>Free</span>
                            <span>Delivery</span>
                        </div>
                    </li>
                    <li>
                        <img src="./images/index/secondSection/secure-payment-fill-svgrepo-com.svg" alt="secure-icon" />
                        <div>
                            <span>Secure</span>
                            <span>Payment</span>
                        </div>
                    </li>
                </ul>
            </div>
        `;
      document.body.append(asideCon);
      const overlay = document.querySelector(".overlay");
      //Use timeout to be able to animate
      setTimeout(() => {
        asideCon.classList.add("showModal");
        overlay.classList.add("activeOverlay");
        if (window.innerWidth > 640) {
          document.body.classList.add("no-scroll");
        }
      }, 0);
      //Attache close function too
      asideCon
        .querySelector(".close-modal-btn")
        .addEventListener("click", () => {
          asideCon.classList.remove("showModal");
          asideCon.classList.add("hideModal");
          overlay.classList.remove("activeOverlay");
          document.body.classList.remove("no-scroll");
          asideCon.addEventListener(
            "transitionend",
            () => {
              asideCon.remove();
            },
            { once: true }, //execute one time
          );
        });
      addMinusModal();
    });
  });
}
//add quantity
function addMinusModal() {
  const qty = document.querySelector(".qty-display");
  const add = document.querySelector("#add-qty-btn");
  const minus = document.querySelector("#minus-qty-btn");
  let qtyDisplay = 0;

  function updateQty() {
    qty.textContent = qtyDisplay;
    minus.disabled = qtyDisplay === 0;
  }
  add.addEventListener("click", () => {
    qtyDisplay++;
    updateQty();
  });
  minus.addEventListener("click", () => {
    qty.textContent = Math.max(0, (qtyDisplay -= 1));
    if (qtyDisplay > 0) {
      qtyDisplay--;
      updateQty();
    }
  });
  updateQty();
}
