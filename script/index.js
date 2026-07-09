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
}

document.addEventListener("DOMContentLoaded", fetchHTML);