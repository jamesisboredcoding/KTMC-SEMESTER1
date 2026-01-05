import { NotifyInfo } from "./modules/notifications.js"
import { get_config } from "./modules/utils.js"
import { Section } from "./modules/category_section.js"

// Elements

// Functions

get_config().then(response => NotifyInfo(response))

// Init

const popular = new Section("In Theatres", [])
popular.render(document.querySelector(".category-sections"))

// Window DOM events

window.addEventListener("scroll", () => {
    document.querySelector(".header").classList.toggle("scrolled", scrollY > 0)
})