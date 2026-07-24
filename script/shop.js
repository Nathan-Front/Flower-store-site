//get cards per page
function getCardsPerPage() {
  if (window.innerWidth <= 540) return 6; // 1 × 6
  if (window.innerWidth <= 920) return 6; // 2 × 3 just to show grid style, can delete it if wanted
  if (window.innerWidth <= 950) return 9; // 3 x 3
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
function createPagination(products) {
  const paginationContainer = document.querySelector(".pagination");
  if (!paginationContainer) return;
  const cardsPerPage = getCardsPerPage();
  const totalPages = Math.ceil(products.length / cardsPerPage);
  currentPage = Math.min(currentPage, totalPages || 1); //always return the smaller number of the two
  paginationContainer.innerHTML = "";
  for (let i = 1; i <= totalPages; i++) {
    const button = document.createElement("button");
    button.textContent = i;
    button.classList.add("page-btn");
    button.addEventListener("click", () => {
      currentPage = i;
      displayPage(currentPage);
      document.querySelector(".shop-second-sec").scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
    paginationContainer.appendChild(button);
  }
}
//Display page
function displayPage(page) {
  const cardsPerPage = getCardsPerPage();
  const start = (page - 1) * cardsPerPage;
  const end = start + cardsPerPage;
  const productsForPage = filteredProducts.slice(start, end);

  renderProducts(productsForPage);
  updateActivePage();
  displayCountPerPage(filteredProducts.length);
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
function displayCountPerPage(totalProducts) {
  const productsPerPage = getCardsPerPage();
  const start = (currentPage - 1) * productsPerPage + 1;
  const end = Math.min(currentPage * productsPerPage, totalProducts);
  const startCount = document.querySelector(".start-flower-count-per-page");
  const endCount = document.querySelector(".end-flower-count-per-page");
  const totalFlowers = document.querySelector(".total-fowers");
  if (!startCount || !endCount || !totalFlowers) return;
  startCount.textContent = start;
  endCount.textContent = end;
  totalFlowers.textContent = totalProducts;
}

//Display category's selections
export function displayCategory() {
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
export function displayFilters() {
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

//Retrieve products from google sheet
let products = [];
let filteredProducts = []; //For pagination function
const API_URL =
  "https://script.google.com/macros/s/AKfycbzD_b_N3TEWmMTEHq8vPPE1tqmoaILMxakWVlXrf1NARpvIuZnl6Azwm01jQuh5Zijr/exec";
export async function loadProducts() {
  const loading = document.getElementById("loading-product");
  loading.classList.remove("loadingOff");
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }
    const data = await response.json();
    products = formatProducts(data.products);
    filteredProducts = [...products]; //spread inside array
    renderProducts(filteredProducts);
    createPagination(filteredProducts);
    displayPage(1);
    const productImages = data.productImages;
    products.forEach((product) => {
      product.modal = productImages
        .filter((img) => Number(img.productId) === product.no)
        .map((img) => ({
          no: Number(img.order),
          icon: img.image,
          iconAlt: img.alt,
        }));
    });
    //console.log(products); for checking captures
    //console.log(productImages[0]); for debugging
    //console.log(Object.keys(productImages[0])); for debugging
  } catch (error) {
    console.error(error);
  } finally {
    loading.classList.add("loadingOff");
  }
}
//change format back to number and strings
function formatProducts(products) {
  return products.map((product) => ({
    no: Number(product.ID),
    stock: Number(product.STOCK) || 0,
    product: product.Product,
    price: Number(product.Price),
    description: product.Description,
    image: product.Image,
    imgAlt: product.ImageAlt,
    review: Number(product.Review),
    rateTotal: Number(product.Rating),
    condition: product.Condition,
    category: product.Category,
    color: product.Color,
    occasion: product.Occasion
      ? product.Occasion.split(",").map((item) => item.trim())
      : [],
  }));
}

//Render product list
function renderProducts(filtered) {
  const cardContainer = document.querySelector(".flower-grid");
  if (!cardContainer) return;
  cardContainer.innerHTML = "";
  filtered.map((item, index) => {
    const li = document.createElement("li");
    li.dataset.id = item.no;
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
    requestAnimationFrame(() => {
      li.style.animationDelay = `${index * 0.05}s`;
    });
  });
  renderSelectedProduct();
}

//filter by occasion
export function filterProduct() {
  const checkedCategory = document.querySelector(
    'input[name="category"]:checked',
  )?.value;
  const checkedOccasion = document.querySelector(
    'input[name="occasions"]:checked',
  )?.value;
  const checkedColor = document.querySelector(
    'input[name="color"]:checked',
  )?.value;
  let filtered = products; //get the product array
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
  filteredProducts = filtered;
  currentPage = 1; //need to re-declare inside this function to be able to reset the counter start to 1
  createPagination(filteredProducts); //recreate the page buttons
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
export function initializePriceSlider() {
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
export function formatPrice(price) {
  const [whole, decimal] = price.toFixed(2).split(".");
  return `
        $${whole}<small>.${decimal}</small>
    `;
}
//Reset all filters to initial
export function resetFilters() {
  const reset = document.querySelector(".reset-filter");
  const minPrice = document.getElementById("min-price");
  const maxPrice = document.getElementById("max-price");
  if (!reset) return;
  reset.addEventListener("click", () => {
    document.getElementById("all-bouquets").checked = true;
    document.getElementById("all-section").checked = true;
    minPrice.value = minPrice.defaultValue;
    maxPrice.value = maxPrice.defaultValue;
    document.getElementById("all-color").checked = true;
    const categoryTitles = document.querySelectorAll(".category-title");
    const priceFilter = document.querySelector(".price-filter");
    categoryTitles.forEach((titleBtn) => {
      const allCategoryLists = titleBtn.closest("li").querySelector("div");
      const titleIcon = titleBtn.querySelector("span");
      if (titleIcon.innerHTML !== "+") {
        titleIcon.innerHTML = titleIcon.innerHTML === "+" ? "−" : "+";
        allCategoryLists.classList.toggle("showCategory");
        priceFilter.classList.add("price-filter-pad");
      }
    });
    filteredProducts = [...products];
    initializePriceSlider(); //Reset the price range display
    currentPage = 1; //need to re-declare inside this function to be able to reset the counter start to 1
    createPagination(filteredProducts); //reset button creation
    displayPage(currentPage); //reset product page
  });
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
      const id = Number(product.dataset.id);
      const selectedProduct = products.find((item) => item.no === id);
      asideCon.innerHTML = `
            <button type="button" class="close-modal-btn">Close</button>
            <div class="aside-product-image">
                <div class="aside-main-img">
                    <img src=${img.src} alt=${img.imgAlt} />
                </div>
                <ul class="aside-sub-img">
                    ${selectedProduct.modal
                      .map(
                        (icon) => `
                    <li class="modal-icons">
                        <img src="${icon.icon}" alt="${icon.iconAlt}">
                    </li>
                    `,
                      )
                      .join("")}
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
      thumbnailIcons();
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
function thumbnailIcons() {
  const mainImage = document.querySelector(".aside-main-img img");
  const thumbnails = document.querySelectorAll(".modal-icons img");
  const originalSrc = mainImage.src;
  const originalAlt = mainImage.alt;
  let currentSrc = mainImage.src;
  thumbnails.forEach((thumbnail) => {
    thumbnail.addEventListener("mouseenter", () => {
      mainImage.src = thumbnail.src;
    });

    thumbnail.addEventListener("mouseleave", () => {
      mainImage.src = currentSrc;
    });
    //For mobile
    thumbnail.addEventListener("click", () => {
      currentSrc = thumbnail.src;
      mainImage.src = currentSrc;
    });
  });
}
