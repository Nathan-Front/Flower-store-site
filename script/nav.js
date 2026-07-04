function displayNav() {
    const menuBtn = document.querySelector(".menu-btn");
    const nav = document.querySelector(".nav-links");
    const imageBtn = document.querySelector("#menu-icon");
    if(!menuBtn || !nav) return;
    menuBtn.addEventListener("click", () => {
        nav.classList.toggle("openNav");
        if (nav.classList.contains("openNav")) {
            imageBtn.classList.remove("fa-bars");
            imageBtn.classList.add("fa-xmark");
        } else {
            imageBtn.classList.remove("fa-xmark");
            imageBtn.classList.add("fa-bars");
        }
    });
}

