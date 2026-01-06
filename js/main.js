import { NotifyInfo } from "./modules/notifications.js"
import { fetch_content } from "./modules/utils.js"
import { Section } from "./modules/category_section.js"

// Elements

// Functions

// Init

const theatres = new Section("In Theatres", [])
theatres.render(document.querySelector(".category-sections"))

const popular = new Section("Popular", [])
popular.render(document.querySelector(".category-sections"))

const top = new Section("Top Rated", [])
top.render(document.querySelector(".category-sections"))

const upcoming = new Section("Up And Coming", [])
upcoming.render(document.querySelector(".category-sections"))

fetch_content("playing", true).then(response => theatres.populate(response.results, true, "movie"))

// Window DOM events

window.addEventListener("scroll", () => {
    document.querySelector(".header").classList.toggle("scrolled", scrollY > 0)
})