
import { bouquets } from "../../components/shop/flowers.js";
async function fetchHTML() {
    const page = document.body.dataset.page;
    const app = document.getElementById("app");//For page loader callback
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
        const [ //Capture html files
            nav,
            foot
        ] = await Promise.all([
            fetch("./components/navigation/nav.html").then(res => {
                if (!res.ok) throw new Error("Navigation failed");
                return res.text(); 
            }),
            fetch("./components/footer/footer.html").then(res => {
                if (!res.ok) throw new Error("Footer failed");
                return res.text();
            })
        ]);
        body.insertAdjacentHTML("beforebegin", nav); //render nav first
        let sections = []; //store sections in an array
        if (page === "index") {
            sections = await Promise.all([
                fetch("./components/index/indexFirstSection.html").then(res => res.text()),
                fetch("./components/index/indexSecondSection.html").then(res => res.text()),
                fetch("./components/index/indexThirdSection.html").then(res => res.text()),
                fetch("./components/index/indexFourthSection.html").then(res => res.text()),
            ]);
        }
        if (page === "shop") {
            sections = await Promise.all([
                fetch("./components/shop/shopFirstSection.html").then(res => res.text()),
                fetch("./components/shop/shopSecondSection.html").then(res => res.text()),
            ]);
        }
          
        //clear app content
        app.innerHTML = "";
        //render sections based on page
        sections.forEach(sec => {app.insertAdjacentHTML("beforeend", sec);});
        //render footer
        body.insertAdjacentHTML("beforeend", foot);
    } catch(error) {
        console.log(error)
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
    renderProducts(bouquets); //Must be loaded first
    displayNav();
    sectionsInterSections();
    createPagination();
    displayPage(1);
    displayCategory();
    initializePriceSlider();
    displayFilters();
    
   
}

document.addEventListener("DOMContentLoaded", fetchHTML);

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
            threshold: 0.1
        }
    );
    interSectItems.forEach((item) => observer.observe(item));
}




let currentPage = 1;
//get cards per page
function getCardsPerPage() {
    if (window.innerWidth <= 540) return 6;   // 1 × 6
    if (window.innerWidth <= 920) return 8;   // 2 × 4
    return 12;                                // 4 × 3
}
//Create page
function createPagination() {
    const cards = document.querySelectorAll(".flower-grid li");
    const paginationContainer = document.querySelector(".pagination");
    if (!paginationContainer) return;
    const cardsPerPage = getCardsPerPage();
    const totalPages = Math.ceil(cards.length / cardsPerPage);
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
    pageButtons.forEach((button, index) => {
        button.classList.toggle(
            "activePage", index + 1 === currentPage
        );
    });
}
//Display total item per page counter
function displayCountPerPage() {
    const products = document.querySelectorAll(".flower-grid li");
    const productTotal = products.length;
    const productsPerPage = getCardsPerPage();
    const start = (currentPage - 1) * productsPerPage + 1;
    const end = Math.min(currentPage * productsPerPage, productTotal)
    const startCount = document.querySelector(".start-flower-count-per-page")
    const endCount = document.querySelector(".end-flower-count-per-page")
    const totalFlowers = document.querySelector(".total-fowers")
    startCount.textContent = start;
    endCount.textContent = end;
    totalFlowers.textContent = productTotal;
}

//Display categories selection
function displayCategory() {
    const categoryTitles = document.querySelectorAll(".category-title");
    const priceFilter = document.querySelector(".price-filter");
    categoryTitles.forEach((titleBtn) => {
       titleBtn.addEventListener("click", () => {
        const allCategoryLists = titleBtn.closest("li").querySelector("div");
        const titleIcon = titleBtn.querySelector("span");
        titleIcon.innerHTML = titleIcon.innerHTML === "+" ? "−" : "+";
        allCategoryLists.classList.toggle("showCategory");
        priceFilter.classList.add("price-filter-pad");
       });
    
    });
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

function displayFilters() {
    const displayInput = document.querySelector(".filter-btn");
const displayFilters = document.querySelector(".left-con");
displayInput.addEventListener("click", () => {
    displayFilters.classList.toggle("show-filters");
});
}


//Render product list
function renderProducts(bouquets) {
    const cardContainer = document.querySelector(".flower-grid");
    if (!cardContainer) return;
    
    bouquets.map((item) => {
    const li = document.createElement("li");
    li.innerHTML = `
        ${ item.condition
        ? `<small class="flower-badge ${item.condition}">${getProductBadge(item.condition)}</small>`
        : ""}
        <img
            src="${item.image}"
            alt="shop-right-bottom-1"
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
          <div class="product-rating">
         ${displayProductRating(item)}
          </div>
          <div class="product-price">
            <span class="flower-price">${formatPrice(item.price)}</span>
            <img
              src="./images/shop/secondSection/cart-square.svg"
              alt="cart-icon"
              class="flower-cart-icon"
            />
          </div>
        </div>
    `;
     cardContainer.append(li);
    })
    console.log(cardContainer)
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