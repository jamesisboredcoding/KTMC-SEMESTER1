import { NotifyInfo } from "./modules/notifications.js"
import { fetch_content, IMAGE_URL, show_modal } from "./modules/utils.js"
import { Section, Sections } from "./modules/category_section.js"

// Elements

const content_modal = document.querySelector(".content-modal")
const hero = document.querySelector(".hero")

// Globals

let hero_data = {}
let current_hero_item = 0

// Functions

function sanitize_item(item) {
    return {
        title: item.title || item.name,
        rating: Number(item.voting_average || item.vote_average).toFixed(1),
        year: (item.release_date || item.first_air_date).split("-")[0],
        type: (item.release_date ? "Movie" : "TV Show"),
        overview: item.overview,
        isMovie: (item.release_date != undefined),
        backdrop: `${IMAGE_URL}/w1280/${item.backdrop_path}`
    }
}

function switch_hero(instant) {
    setTimeout(() => {
        const item = sanitize_item(hero_data.results[current_hero_item])
        current_hero_item = (current_hero_item + 1 != hero_data.results.length) ? (current_hero_item + 1) : 0

        hero.querySelector(".title").textContent = item.title
        hero.querySelector(".rating").textContent = item.rating
        hero.querySelector(".year").textContent = item.year
        hero.querySelector(".type").textContent = item.type
        hero.querySelector(".overview").textContent = item.overview

        hero.querySelector(".type").classList.toggle("movie", item.isMovie)
        hero.querySelector(".type").classList.toggle("tv", !item.isMovie)

        hero.style.backgroundImage = hero.style.getPropertyValue("--bg-image")
        hero.style.setProperty("--bg-opacity", 0)
        
        setTimeout(() => {
            hero.style.setProperty("--bg-opacity", 1)
            hero.style.setProperty("--bg-image", `url(${item.backdrop})`)
        }, (instant ? 0 : 500))
        switch_hero(false)
    }, (instant ? 0 : 10_000))
}

function load_page(page = "home") {
    for (const section of Sections) {
        section.delete()
    }

    if (page == "home") {
        fetch_content("hero").then(response => { hero_data = response })
            .then(() => switch_hero(true))

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
    }
}

// Init

load_page()

// Element events

content_modal.querySelector(".exit").addEventListener("click", () => {
    content_modal.classList.remove("active-modal")
})

hero.querySelector(".info-button").addEventListener("click", () => {
    const item = sanitize_item(hero_data.results[current_hero_item - 1])
    show_modal(item.title, item.overview, item.backdrop, item.rating, item.type, item.year)
})

// Window DOM events

window.addEventListener("scroll", () => {
    document.querySelector(".header").classList.toggle("scrolled", scrollY > 0)
})