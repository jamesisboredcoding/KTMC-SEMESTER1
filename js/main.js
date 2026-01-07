import { NotifyInfo } from "./modules/notifications.js"
import { fetch_content, IMAGE_URL, show_modal, set_content_listed, db } from "./modules/utils.js"
import { Section, Sections } from "./modules/category_section.js"
import { Poster, Contents } from "./modules/content.js"

// Elements

const main = document.querySelector("main")
const footer = document.querySelector("footer")

const content_modal = document.querySelector(".content-modal")
const hero = document.querySelector(".hero")
const navbar = document.querySelector(".navbar")
const category_sections = document.querySelector(".category-sections")
const search_modal = document.querySelector(".search-container")
const watchlist = document.querySelector(".watch-list")

const nav_buttons = navbar.querySelectorAll(".nav-item")

// Globals

let hero_data = {}
let current_hero_item = 0
let current_page = ""
let hero_loaded = false

// Functions

function sanitize_item(item) {
    return {
        title: item.title || item.name,
        rating: Number(item.voting_average || item.vote_average).toFixed(1),
        year: (item.release_date || item.first_air_date).split("-")[0],
        type: (item.release_date ? "Movie" : "TV Show"),
        overview: item.overview,
        isMovie: (item.release_date != undefined),
        backdrop: `${IMAGE_URL}/w1280/${item.backdrop_path}`,
        poster: `${IMAGE_URL}/w500/${item.poster_path}`,
        id: item.id
    }
}

function switch_hero(instant) {
    hero_loaded = true
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
    if (page == current_page) return;
    current_page = page

    for (const section of Sections) {
        section.remove()
    }

    for (const content of Contents) {
        content.remove()
    }

    footer.classList.remove("abs-bottom")
    main.classList.remove("flex")

    hero.style.display = "none"
    watchlist.style.display = "none"

    if (page == "home") {
        hero.style.display = ""
        main.classList.remove("off")

        if (!hero_loaded) {
            fetch_content("hero").then(response => { hero_data = response })
                .then(() => switch_hero(true))
        }

        // Trending

        const trending = new Section("Trending Now", true)
        trending.render(category_sections)

        fetch_content("trending", true)
            .then(response => trending.populate(response.results))

        // Popular Movies

        const popular = new Section("Popular Movies", true)
        popular.render(category_sections)

        fetch_content("popular", true)
            .then(response => popular.populate(response.results))

        // Popular Shows

        const popularShows = new Section("Popular TV Shows", true)
        popularShows.render(category_sections)

        fetch_content("popular", false)
            .then(response => popularShows.populate(response.results))

        // Top Movies

        const top = new Section("Top Rated Movies", false)
        top.render(category_sections)

        fetch_content("top", true)
            .then(response => top.populate(response.results))

        // Top Shows

        const topShows = new Section("Top Rated TV Shows", false)
        topShows.render(category_sections)

        fetch_content("top", false)
            .then(response => topShows.populate(response.results))
    } else if (page == "movies" || page == "shows") {
        const is_tv = (page == "shows")
        main.classList.add("off")

        // Popular

        const popular = new Section(`Popular ${is_tv ? "TV Shows" : "Movies"}`, false)
        popular.render(category_sections)

        fetch_content("popular", !is_tv)
            .then(response => popular.populate(response.results))

        // Theatres & Airing

        const airing = new Section(`${is_tv ? "Airing Today" : "In Theatres"}`, false)
        airing.render(category_sections)

        fetch_content(is_tv ? "airing" : "playing", !is_tv)
            .then(response => airing.populate(response.results))

        // Top

        const top = new Section(`Top Rated ${is_tv ? "TV Shows" : "Movies"}`, false)
        top.render(category_sections)

        fetch_content("top", !is_tv)
            .then(response => top.populate(response.results))

        // Upcoming

        const upcoming = new Section(`${!is_tv ? "Up-and-coming" : "On The Air"}`, false)
        upcoming.render(category_sections)

        fetch_content(is_tv ? "playing" : "upcoming", !is_tv)
            .then(response => upcoming.populate(response.results))
    } else if (page == "list") {
        footer.classList.add("abs-bottom")
        main.classList.add("h-screen")
        main.classList.add("flex")

        main.classList.remove("off")
        watchlist.style.display = ""

        watchlist.querySelector(".empty").style.display = (db.data.listed.length > 0) ? "none" : ""

        for (const [id, type] of db.data.listed) {
            fetch_content("content", (type == "Movie"), id)
                .then(response => {
                    if (!response) return;
                    const info = sanitize_item(response)
                    new Poster(info.title, info.year, info.type, info.rating,
                        {
                            banner: info.backdrop,
                            poster: info.poster
                        },info.overview, info.id)
                        .render(watchlist)
                })
        }
    }
}

// Init

load_page()

for (const nav_item of nav_buttons) {
    nav_item.addEventListener("click", () => {
        search_modal.classList.remove("active-modal")
        if (nav_item.id == "") return;

        for (const other_nav_item of nav_buttons) {
            if (other_nav_item == nav_item) continue;
            other_nav_item.classList.remove("selected")
        }

        nav_item.classList.add("selected")
        load_page(nav_item.id)
    })
}

// Element events

content_modal.querySelector(".exit").addEventListener("click", () => {
    content_modal.classList.remove("active-modal")
})

content_modal.querySelector(".wl-button").addEventListener("click", (e) => {
    e.target.classList.toggle("listed")

    const is_listed = e.target.classList.contains("listed")
    const type = content_modal.querySelector(".type").textContent

    e.target.textContent = is_listed ? "✔" : "+"
    set_content_listed(e.target.id, type, is_listed)
})

hero.querySelector(".info-button").addEventListener("click", () => {
    const item = sanitize_item(hero_data.results[current_hero_item - 1])
    show_modal(item.title, item.overview, item.backdrop, item.rating, item.type, item.year, item.id)
})

navbar.querySelector(".search").addEventListener("click", () => {
    search_modal.classList.add("active-modal")
})

search_modal.querySelector(".exit").addEventListener("click", () => {
    search_modal.classList.remove("active-modal")
})

search_modal.querySelector("input").addEventListener("keydown", (e) => {
    const search_list = search_modal.querySelector(".list")
    if (e.key === "Enter") {
        for (const content of Contents) {
            if (content.element.parentElement == search_list) {
                content.remove()
            }
        }

        fetch_content("query", e.target.value)
            .then(response => {
                console.log(response)
                for (const item of response.results) {
                    const info = sanitize_item(item)
                    const content = new Poster(info.title, info.year, info.type, info.rating,
                        {
                            banner: info.backdrop,
                            poster: info.poster
                        }, info.overview, info.id)

                    content.render(search_list)
                    content.makeAutosize(true)
                }
            })
    }
})

// Window DOM events

window.addEventListener("scroll", () => {
    document.querySelector(".header").classList.toggle("scrolled", scrollY > 0)
})