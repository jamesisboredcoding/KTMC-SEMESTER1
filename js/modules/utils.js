import config from "../config.js"
import Database from "./db.js"

const content_modal = document.querySelector(".content-modal")
const search_modal = document.querySelector(".search-container")

// Constants

export const TMBD_API = "https://api.themoviedb.org/3"
export const IMAGE_URL = "https://image.tmdb.org/t/p/"
export const FEMBOX_API = "https://fembox.aether.mom"

export const db = new Database({
    listed: [],
    history: [
        // { type: "movie", id: 98465654, s: 1, ep: 2, t: 500 },
    ],
    settings: {
        lan: null,
        quality: "1080P",
        volume: 50,
    }
})

export const options = {
    method: "GET",
    headers: {
        "accept": "application/json",
        ...get_auth()
    }
}

// Functions

function is_content_listed(id) {
    let listed = db.data.listed || []
    return listed.some(listed => listed[0] == id)
}

export function get_auth() {
    return { "Authorization": `Bearer ${config.TMBD_KEY}` }
}

export function set_content_listed(id, type, boolean = false) {
    let data = db.data
    let listed = data.listed || []

    const is_listed = is_content_listed(id)
    if (!is_listed && boolean) {
        listed.push([id, type])
    } else if (is_listed && !boolean) {
        listed.forEach((listed_item, index) => {
            if (listed_item[0] == id) listed.splice(index, 1)
        })
    }

    data.listed = listed
    db.push(data)
}

export function show_modal(title, overview, banner, rating, type, year, id) {
    content_modal.querySelector(".title").textContent = title
    content_modal.querySelector(".overview").textContent = overview
    content_modal.querySelector(".rating").textContent = rating
    content_modal.querySelector(".type").textContent = (type == "Movie" ? "Filmas" : "Serialas")
    content_modal.querySelector(".year").textContent = year

    content_modal.querySelector("img.banner").setAttribute("src", "")
    content_modal.querySelector("img.banner").setAttribute("src", banner)

    content_modal.querySelector(".type").classList.toggle("movie", (type == "Movie"))
    content_modal.querySelector(".type").classList.toggle("tv", (type != "Movie"))

    content_modal.querySelector(".wl-button").classList.toggle("listed", is_content_listed(id))
    content_modal.querySelector(".wl-button").textContent = (is_content_listed(id)) ? "✔" : "+"
    content_modal.querySelector(".wl-button").setAttribute("id", id)

    content_modal.querySelector(".play-button").setAttribute("id", content_modal.querySelector(".wl-button").id)

    content_modal.classList.add("active-modal")
    search_modal.classList.remove("active-modal")
}

export async function fetch_content(type, movie, extra) {
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
                .slice(0, 11)
            return { results: top }
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
            return { results: top }
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
            return { results: top }
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
            return { results: top }
        },
        "airing": async () => {
            const response = await fetch(TMBD_API + `/tv/airing_today`, options)
            if (!response.ok) {
                console.error(response.error)
                return
            }

            const data = await response.json()
            const filtered = data.results.filter((info) => (info.original_language == "en"))
            const top = filtered.sort((a, b) => b.popularity - a.popularity)
                .slice(0, 11)
            return { results: top }
        },
        "hero": async () => {
            const movieEndpoint = `/movie/now_playing`
            const tvEndpoint = `/tv/popular`
            
            const [movieResponse, tvResponse] = await Promise.all([
                fetch(TMBD_API + movieEndpoint, options),
                fetch(TMBD_API + tvEndpoint, options)
            ])

            if (!movieResponse.ok || !tvResponse.ok) {
                console.error("Error fetching data")
                return
            }

            const movieData = await movieResponse.json()
            const tvData = await tvResponse.json()
            
            const filteredMovies = movieData.results.filter((info) => info.original_language === "en")
            const filteredTV = tvData.results.filter((info) => info.original_language === "en")
            
            const merged = [...filteredMovies, ...filteredTV]
            const top = merged.sort((a, b) => b.popularity - a.popularity).slice(0, 11)
            
            return { results: top }
        },
        "trending": async () => {
            const endpoint = `/trending/${(movie == true) ? "movie" : (movie == false) ? tv : "all"}/week`
            const response = await fetch(TMBD_API + endpoint, options)

            if (!response.ok) {
                console.error(response.error)
                return
            }

            const data = await response.json()
            const filtered = data.results.filter((info) => (info.original_language == "en"))
                .sort((a, b) => b.popularity - a.popularity)
                .slice(0, 11)
            return { results: filtered }
        },
        "content": async () => {
            const response = await fetch(TMBD_API + `/${movie ? "movie": "tv"}/${extra}`, options)
            if (!response.ok) {
                console.error(response.error)
                return
            }
            return await response.json()
        },
        "query": async () => {
            const query = encodeURIComponent(movie)

            const movie_response = await fetch(TMBD_API + `/search/movie?query=${query}&page=${extra || "1"}`, options)
            const tv_response = await fetch(TMBD_API + `/search/tv?query=${query}&page=${extra || "1"}`, options)

            if (!movie_response.ok || !tv_response.ok) {
                console.error(movie_response.error + ":" + tv_response.error)
                return
            }

            const movie_data = await movie_response.json()
            const tv_data = await tv_response.json()

            const data = [...movie_data.results, ...tv_data.results]
            const filtered = data.sort((a, b) => b.popularity - a.popularity)

            console.log(tv_data)
            return { results: filtered }
        }
    }

    const validatedType = validTypes[type]
    if (validatedType) {
        let result = null
        for (let i = 0; i < 3; i++) {
            try {
                result = await validatedType()
                if (result) break;
            } catch (err) {
                console.error(err)
            }
        }
        return result
    } else {
        console.log("type does not exist")
    }
}