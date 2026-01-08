import { db } from "./utils.js";
import config from "../config.js";

const player = document.querySelector(".player")
const info = player.querySelector(".info")
const loading_label = info.querySelector(".label")
const video = document.querySelector("video")
const player_controls = player.querySelector(".controls")

const fs = player_controls.querySelector("#fullscreen").querySelector(".fa-solid")
const play = player_controls.querySelector("#play").querySelector(".fa-solid")
const bottom_controls = player.querySelector(".bottombar")
const progress = player.querySelector(".progress")
const progress_bar = progress.querySelector(".slider .bar")

let preloaded = {}
let current = null

let time_update
let loaded

export function toggle_fullscreen() {
    const fullscreened = fs.classList.contains("fa-compress")
    fs.classList.toggle("fa-expand", fullscreened)
    fs.classList.toggle("fa-compress", !fullscreened)

    if (!fullscreened) {
        player.requestFullscreen()
    } else {
        document.exitFullscreen()
    }
}

export function toggle_pause(force) {
    const playing = (force == undefined) ? play.classList.contains("fa-pause") : force
    play.classList.toggle("fa-play", playing)
    play.classList.toggle("fa-pause", !playing)

    if (!playing) {
        video.play()
    } else {
        video.pause()
    }
}

export function clean_player() {
    const time = video.currentTime

    info.style.display = "none"
    bottom_controls.style.display = "none"
    progress.style.display = "none"

    video.removeEventListener("loadeddata", loaded)
    video.removeEventListener("timeupdate", time_update)
    video.setAttribute("src", "")

    let history = db.data.history || []
    if (current) {
        if (current.type == "movie") {
            const exists = history.findIndex(data => data.id == current.id)
            if (exists != -1) {
                history[exists].t = time
            } else {
                history.push(current)
            }
        } else {
            const exists = history.findIndex(data => (data.id == current.id) && (data.s == current.s && data.ep == current.s))
            if (!exists) {
                history[exists].t = time
            } else {
                history.push(current)
            }
        }
    }
}

function fetch_data(id, s, ep, mtype) {
    let result = {}
    let is_listed = false

    for (const data of db.data.history) {
        if (data.id == id) {
            if (data.type == "movie") {
                result = data
                is_listed = true
                break
            } else {
                if (data.s == s && data.ep == ep) {
                    result = data
                    is_listed = true
                    break
                }
            }
        }
    }

    if (!result) {
        result = {
            type: mtype,
            id: id,
            s: s,
            ep: ep,
            t: 0,
        }
    }
    return [result, is_listed]
}

export async function query_content(type, id, s = 1, ep = 1) {
    video.setAttribute("src", "")
    loading_label.textContent = "Kraunami turinio šaltiniai..."

    info.style.display = ""
    bottom_controls.style.display = "none"
    progress.style.display = "none"

    let result = preloaded[id]
    if (!result) {
        for (let i = 0; i < 1; i++) {
            try {
                if (i != 0) {
                    loading_label.textContent = "Kraunami turinio šaltiniai... " + `(${i + 1} bandymas)`
                }

                const episode_endpoint = (type == "tv") ? `/${s}/${ep}` : ""
                const response = await fetch(`https://fembox.aether.mom/${type}/${id}${episode_endpoint}?ui=${config.SRC_TOKEN}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    }
                })

                const data = await response.json()
                if (data && data.sources) {
                    preloaded[id] = data
                    result = data
                    break
                }
            } catch (err) {
                console.error(err)
            }
        }
    }

    if (result) {
        const video_data = fetch_data(id, s, ep, type)
        const block_default_qualities = ["ORG", "4K"]

        let current_src = ""
        current = video_data

        for (const source_data of result.sources) {
            if (source_data.quality == db.data.settings.quality) {
                current_src = source_data.url
            }
        }

        for (const source_data of result.sources) {
            if (!block_default_qualities.includes(source_data.quality)) {
                current_src = source_data.url
                break
            }
        }

        loaded = () => {
            info.style.display = "none"
            bottom_controls.style.display = ""
            progress.style.display = ""

            video.play()
        }

        time_update = () => {
            const percent = (video.currentTime / video.duration) * 100
            progress_bar.style.width = `${percent}%`
        }

        video.addEventListener("loadeddata", loaded, { once: true })
        video.addEventListener("timeupdate", time_update)

        loading_label.textContent = "Kraunamas vaizdas..."
        video.setAttribute("src", current_src)
    }
}