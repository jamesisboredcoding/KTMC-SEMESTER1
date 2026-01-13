import Notify from "./modules/notifications.js"
import { fetch_content, IMAGE_URL, show_modal, set_content_listed, db } from "./modules/utils.js"
import { Section, Sections } from "./modules/category_section.js"
import { Poster, Contents } from "./modules/content.js"
import { query_content, clean_player, toggle_fullscreen, toggle_pause } from "./modules/player.js"

// Elements

const main = document.querySelector("main")
const footer = document.querySelector("footer")

const content_modal = document.querySelector(".content-modal")
const hero = document.querySelector(".hero")
const navbar = document.querySelector(".navbar")
const category_sections = document.querySelector(".category-sections")
const search_modal = document.querySelector(".search-container")
const watchlist = document.querySelector(".watch-list")
const player = document.querySelector(".player")

const nav_buttons = navbar.querySelectorAll(".nav-item")
const player_controls = player.querySelector(".controls")
const progress_bar = player.querySelector(".progress .slider")
const video = document.querySelector("video")

// Globals

let hero_data = {}
let current_hero_item = 0
let current_page = ""
let hero_loaded = false
let mouse_timeout = null
let search_scroll = null
let search_page = 0
let search_loaded = []

// Functions

function sanitize_item(item) {
    return {
        title: item.title || item.name,
        rating: Number(item.voting_average || item.vote_average).toFixed(1),
        year: (item.release_date ?? item.first_air_date ?? "").split("-")[0],
        type: (item.release_date ? "Movie" : "TV Show"),
        overview: item.overview,
        isMovie: (item.release_date != undefined),
        backdrop: `${IMAGE_URL}w1280${item.backdrop_path}`,
        poster: `${IMAGE_URL}w500${item.poster_path}`,
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
        hero.querySelector(".type").textContent = (item.type == "Movie") ? "Filmas" : "Serialas"
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

        if (!hero_loaded ?? !hero_loaded) {
            fetch_content("hero").then(response => { hero_data = response })
                .then(() => switch_hero(true))
        }

        // Watch history

        if (db.data.history.length > 0) {
            const history = new Section("Žiūrėjimo Istorija")
            history.render(category_sections)

            let ids_shown = []
            for (const content_data of db.data.history) {
                fetch_content("content", (content_data.type == "movie"), content_data.id)
                    .then(response => {
                        if (!ids_shown.find(id => content_data.id == id)) {
                            ids_shown.push(content_data.id)
                            history.populate([{ ...response, meta: { t: content_data.t, d: content_data.d } }])
                        }
                    })
            }
        }

        // Trending

        const trending = new Section("Labiausiai žiūrimi", true)
        trending.render(category_sections)

        fetch_content("trending", true)
            .then(response => trending.populate(response.results))

        // Popular Movies

        const popular = new Section("Populiariausi filmai", true)
        popular.render(category_sections)

        fetch_content("popular", true)
            .then(response => popular.populate(response.results))

        // Popular Shows

        const popularShows = new Section("Populiariausi serialai", true)
        popularShows.render(category_sections)

        fetch_content("popular", false)
            .then(response => popularShows.populate(response.results))

        // Top Movies

        const top = new Section("Geriausiai vertinami filmai", false)
        top.render(category_sections)

        fetch_content("top", true)
            .then(response => top.populate(response.results))

        // Top Shows

        const topShows = new Section("Geriausiai vertinami serialai", false)
        topShows.render(category_sections)

        fetch_content("top", false)
            .then(response => topShows.populate(response.results))
    } else if (page == "movies" || page == "shows") {
        const is_tv = (page == "shows")
        main.classList.add("off")

        // Popular

        const popular = new Section(`Populiarūs ${is_tv ? "serialai" : "filmai"}`, false)
        popular.render(category_sections)

        fetch_content("popular", !is_tv)
            .then(response => popular.populate(response.results))

        // Theatres & Airing

        const airing = new Section(`${is_tv ? "Rodoma laida" : "Jau cinemose"}`, false)
        airing.render(category_sections)

        fetch_content(is_tv ? "airing" : "playing", !is_tv)
            .then(response => airing.populate(response.results))

        // Top

        const top = new Section(`Geriausiai vertinami ${is_tv ? "serialai" : "filmai"}`, false)
        top.render(category_sections)

        fetch_content("top", !is_tv)
            .then(response => top.populate(response.results))

        // Upcoming

        const upcoming = new Section(`${!is_tv ? "Kylantys filmai" : "Serialai eteryje"}`, false)
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
    const type_label = content_modal.querySelector(".type")
    const type = type_label.classList.contains("movie") ? "Movie" : "TV Show"

    e.target.textContent = is_listed ? "✔" : "+"
    set_content_listed(e.target.id, type, is_listed)
})

content_modal.querySelector(".play-button").addEventListener("click", () => {
    player.classList.add("active-modal")
    content_modal.classList.remove("active-modal")

    const type_label = content_modal.querySelector(".type")
    const type = type_label.classList.contains("movie") ? "movie" : "tv"
    const id = content_modal.querySelector(".play-button").id

    query_content(type, id)
})

hero.querySelector(".info-button").addEventListener("click", () => {
    const item = sanitize_item(hero_data.results[current_hero_item - 1])
    show_modal(item.title, item.overview, item.backdrop, item.rating, item.type, item.year, item.id)
})

hero.querySelector(".play-button").addEventListener("click", () => {
    const item = sanitize_item(hero_data.results[current_hero_item - 1])
    const type_label = hero.querySelector(".type")
    const type = type_label.classList.contains("movie") ? "movie" : "tv"

    player.classList.add("active-modal")
    query_content(type, item.id)
})

navbar.querySelector(".search").addEventListener("click", () => {
    search_modal.classList.add("active-modal")
    search_modal.querySelector("input").focus()
})

search_modal.querySelector(".exit").addEventListener("click", () => {
    search_modal.classList.remove("active-modal")
})

search_modal.querySelector("input").addEventListener("keydown", (e) => {
    const load_results = (p) => {
        search_page = p ?? 1
        fetch_content("query", e.target.value, p)
            .then(response => {
                for (const item of response.results) {
                    if (search_loaded.includes(item.id)) continue;

                    const info = sanitize_item(item)
                    const content = new Poster(info.title, info.year, info.type, info.rating,
                        {
                            banner: info.backdrop,
                            poster: info.poster
                        }, info.overview, info.id)
                    content.render(search_list)
                    content.makeAutosize(true)

                    content.element.classList.add("grown")
                    search_loaded.push(info.id)
                }
            })
    }

    const search_list = search_modal.querySelector(".list")
    if (e.key === "Enter") {
        search_modal.querySelector("input").blur()
        for (const content of Contents) {
            if (content.element.parentElement == search_list) {
                content.remove()
            }
        }

        search_loaded = []
        load_results()

        if (!search_scroll) {
            search_scroll = () => {
                if (search_list.scrollTop + search_list.offsetHeight >= search_list.scrollHeight) {
                    load_results(search_page + 1)
                }
            }
            search_list.addEventListener("scroll", search_scroll)
        }
    }
})

player_controls.querySelector("#volume").addEventListener("click", () => {
    player_controls.querySelector(".volume-slider").classList.toggle("hidden")
})

player_controls.querySelector("#fullscreen").addEventListener("click", () => {
    if (!player.classList.contains("active-modal")) return;
    toggle_fullscreen()
})

player_controls.querySelector("#play").addEventListener("click", () => {
    if (!player.classList.contains("active-modal")) return;
    toggle_pause()
})

player_controls.querySelector("#forward").addEventListener("click", () => {
    if (!player.classList.contains("active-modal")) return;
    video.currentTime = video.currentTime + 15
})

player_controls.querySelector("#backward").addEventListener("click", () => {
    if (!player.classList.contains("active-modal")) return;
    video.currentTime = video.currentTime - 15
})

player_controls.querySelector(".volume-slider input").addEventListener("change", (e) => {
    if (!player.classList.contains("active-modal")) return;
    video.volume = (e.target.value / 100)

    const data = db.data
    data.settings.volume = e.target.value
    db.push(data)
})

progress_bar.addEventListener("click", (e) => {
    const rect = progress_bar.getBoundingClientRect()
    const initial_pos = e.clientX - rect.left
    const percent = initial_pos / rect.width
    const time = percent * player.querySelector("video").duration
    player.querySelector("video").currentTime = time
})

player.querySelector(".exit").addEventListener("click", () => {
    player.classList.remove("active-modal")
    clean_player()
    load_page()

    document.exitFullscreen()
    window.location.reload()
})

player_controls.querySelector("#sub").addEventListener("click", () => {
    player_controls.querySelector(".caption-list").classList.toggle("hidden")
})

player_controls.querySelector("#episodes").addEventListener("click", () => {
    player_controls.querySelector(".episode-list").classList.toggle("hidden")
})

// Window DOM events

window.addEventListener("scroll", () => {
    document.querySelector(".header").classList.toggle("scrolled", scrollY > 0)
})

window.addEventListener("mousemove", () => {
    document.body.classList.remove("inactive")
    if (!player.classList.contains("active-modal")) return;
    if (mouse_timeout) {
        player_controls.classList.remove("faded")
        clearTimeout(mouse_timeout)
    }

    mouse_timeout = setTimeout(() => {
        player_controls.classList.add("faded")
        document.body.classList.add("inactive")
    }, 3000)
})

document.addEventListener("keydown", (e) => {
    if (!player.classList.contains("active-modal")) return;
    if (e.key.toLowerCase() == "f") {
        toggle_fullscreen()
    } else if (e.key == " " || e.key.toLowerCase() == "enter") {
        toggle_pause()
    } else if (e.key.toLowerCase() == "arrowleft") {
        video.currentTime = video.currentTime - 15
    } else if (e.key.toLowerCase() == "arrowright") {
        video.currentTime = video.currentTime + 15
    }
})

window.addEventListener("beforeunload", () => clean_player())