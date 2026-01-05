window.addEventListener("scroll", () => {
    document.querySelector(".header").classList.toggle("scrolled", scrollY > 0)
})