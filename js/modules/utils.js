import config from "../config.js"

const content_modal = document.querySelector(".content-modal")

export const TMBD_API = "https://api.themoviedb.org/3"
export const IMAGE_URL = "https://image.tmdb.org/t/p/"
export const options = {
    method: "GET",
    headers: {
        "accept": "application/json",
        ...get_auth()
    }
}

export function get_auth() {
    return { "Authorization": `Bearer ${config.TMBD_KEY}` }
}

export function show_modal(title, overview, banner, id) {
    
}

export function hide_modal() {

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
            const top5 = filtered.sort((a, b) => b.popularity - a.popularity)
                .slice(0, 7)

            return { ...data, results: top5 }
        }
    }

    const validatedType = validTypes[type]
    if (validTypes) {
        return await validatedType()
    } else {
        console.log("type does not exist")
    }
}