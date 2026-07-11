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
    if (window.innerWidth <= 640) return 6;   // 1 × 6
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



function displayCategory() {
    const categoryTitles = document.querySelectorAll(".category-title");
    categoryTitles.forEach((titleBtn) => {
       titleBtn.addEventListener("click", () => {
        const allCategoryLists = titleBtn.closest("li").querySelector("div");
        const titleIcon = titleBtn.querySelector("span");
        titleIcon.innerHTML = titleIcon.innerHTML === "+" ? "−" : "+";
        allCategoryLists.classList.toggle("showCategory");
       });
    
    });
}   



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
