import { NotifyInfo } from "./modules/notifications.js"
import { get_config } from "./modules/utils.js"
import { Section } from "./modules/category_section.js"

// Elements

// Functions

get_config().then(response => NotifyInfo(response))

// Init

const theatres = new Section("In Theatres", [])
theatres.render(document.querySelector(".category-sections"))

const popular = new Section("Popular", [])
popular.render(document.querySelector(".category-sections"))

const top = new Section("Top Rated", [])
top.render(document.querySelector(".category-sections"))

const upcoming = new Section("Up And Coming", [])
upcoming.render(document.querySelector(".category-sections"))

// Window DOM events

window.addEventListener("scroll", () => {
    document.querySelector(".header").classList.toggle("scrolled", scrollY > 0)
})