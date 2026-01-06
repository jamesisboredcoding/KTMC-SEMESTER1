import config from "../config.js"

const content_modal = document.querySelector(".content-modal")

// Constants

export const TMBD_API = "https://api.themoviedb.org/3"
export const IMAGE_URL = "https://image.tmdb.org/t/p/"
export const FEMBOX_API = "https://fembox.aether.mom"

export const options = {
    method: "GET",
    headers: {
        "accept": "application/json",
        ...get_auth()
    }
}

// Functions

export function get_auth() {
    return { "Authorization": `Bearer ${config.TMBD_KEY}` }
}

export function show_modal(title, overview, banner, rating, type, year) {
    content_modal.querySelector(".title").textContent = title
    content_modal.querySelector(".overview").textContent = overview
    content_modal.querySelector(".rating").textContent = rating
    content_modal.querySelector(".type").textContent = type
    content_modal.querySelector(".year").textContent = year
    content_modal.querySelector("img.banner").setAttribute("src", banner)

    content_modal.querySelector(".type").classList.toggle("movie", (type == "Movie"))
    content_modal.querySelector(".type").classList.toggle("tv", (type != "Movie"))

    content_modal.classList.add("active-modal")
}

export async function fetch_content(type, movie) {
    const validTypes = {
        "playing": async () => {
            const endpoint = `/${movie ? "movie" : "tv"}/${movie ? "now_playing" : "on_the_air"}`
            const response = await fetch(TMBD_API + endpoint, options)

            if (!response.ok) {
                console.error(response.error)
                return
            }

            const data = await response.json()
            const filtered = data.results.filter((info) => (info.original_language == "en"))
            const top = filtered.sort((a, b) => b.popularity - a.popularity)
                .slice(0, 7)
            return { ...data, results: top }
        },
        "popular": async () => {
            const endpoint = `/${movie ? "movie" : "tv"}/popular`
            const response = await fetch(TMBD_API + endpoint, options)

            if (!response.ok) {
                console.error(response.error)
                return
            }

            const data = await response.json()
            const filtered = data.results.filter((info) => (info.original_language == "en"))
            const top = filtered.sort((a, b) => b.popularity - a.popularity)
                .slice(0, 11)
            return { ...data, results: top }
        },
        "top": async () => {
            const endpoint = `/${movie ? "movie" : "tv"}/top_rated`
            const response = await fetch(TMBD_API + endpoint, options)

            if (!response.ok) {
                console.error(response.error)
                return
            }

            const data = await response.json()
            const filtered = data.results.filter((info) => (info.original_language == "en"))
            const top = filtered.sort((a, b) => b.voting_average - a.voting_average)
                .slice(0, 11)
            return { ...data, results: top }
        },
        "upcoming": async () => {
            const response = await fetch(TMBD_API + `/movie/upcoming`, options)
            if (!response.ok) {
                console.error(response.error)
                return
            }

            const data = await response.json()
            const filtered = data.results.filter((info) => (info.original_language == "en"))
            const top = filtered.sort((a, b) => b.popularity - a.popularity)
                .slice(0, 11)
            return { ...data, results: top }
        },
    }

    const validatedType = validTypes[type]
    if (validatedType) {
        return await validatedType()
    } else {
        console.log("type does not exist")
    }
}