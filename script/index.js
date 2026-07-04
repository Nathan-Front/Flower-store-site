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
        //render html files
        body.insertAdjacentHTML("beforeend", nav);
        //store sections in an array
        let sections = [];
        //clear app content
        app.innerHTML = "";
        //render sections based on page

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