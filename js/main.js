import { NotifyInfo } from "./modules/notifications.js"
import { fetch_content } from "./modules/utils.js"
import { Section } from "./modules/category_section.js"

// Elements

const content_modal = document.querySelector(".content-modal")

// Functions

// Init

const theatres = new Section("In Theatres", true)
theatres.render(document.querySelector(".category-sections"))

fetch_content("playing", true)
    .then(response => theatres.populate(response.results, "Movie"))

const popular = new Section("Popular Movies", true)
popular.render(document.querySelector(".category-sections"))

fetch_content("popular", true)
    .then(response => popular.populate(response.results, "Movie"))

const top = new Section("Top Rated Movies", false)
top.render(document.querySelector(".category-sections"))

fetch_content("top", true)
    .then(response => top.populate(response.results, "Movie"))

const upcoming = new Section("Up And Coming", false)
upcoming.render(document.querySelector(".category-sections"))

fetch_content("upcoming", true)
    .then(response => upcoming.populate(response.results, "Movie"))

const popularShows = new Section("Popular TV Shows", true)
popularShows.render(document.querySelector(".category-sections"))

fetch_content("popular", false)
    .then(response => popularShows.populate(response.results, "TV Show"))

// Element events

content_modal.querySelector(".exit").addEventListener("click", () => {
    content_modal.classList.remove("active-modal")
})

// Window DOM events

window.addEventListener("scroll", () => {
    document.querySelector(".header").classList.toggle("scrolled", scrollY > 0)
})