import { db, fetch_content } from "./utils.js";
import config from "../config.js";

import srtParser2 from 'https://cdn.jsdelivr.net/npm/srt-parser-2@1.2.3/+esm'

const player = document.querySelector(".player")
const info = player.querySelector(".info")
const loading_label = info.querySelector(".label")
const video = document.querySelector("video")
const player_controls = player.querySelector(".controls")

const fs = player_controls.querySelector("#fullscreen").querySelector(".fa-solid")
const play = player_controls.querySelector("#play").querySelector(".fa-solid")
const next_ep = player_controls.querySelector("#next")
const eps = player_controls.querySelector("#episodes")

const bottom_controls = player.querySelector(".bottombar")
const progress = player.querySelector(".progress")
const progress_bar = progress.querySelector(".slider .bar")
const time_stamp = player.querySelector(".time-stamp")

const captions_list = bottom_controls.querySelector(".caption-list")
const episodes_list = bottom_controls.querySelector(".episode-list")

const captions_container = captions_list.querySelector(".container-list")
const episodes_container = episodes_list.querySelector(".container-list")

let preloaded = {}
let current = null

let time_update
let loaded
let back_eps

function convertArrayToVtt(srtArray) {
    let vtt = "WEBVTT\n\n";
    srtArray.forEach((cue) => {
        const startTime = cue.startTime.replace(',', '.');
        const endTime = cue.endTime.replace(',', '.');

        vtt += `${cue.id}\n${startTime} --> ${endTime} line:-3\n${cue.text}\n\n`;
    });
    return vtt;
}

function load_sub(url) {
    const track = video.querySelector("track")
    if (!url) {
        video.querySelector("track").src = ""
        return
    }
    fetch_sub(url)
        .then(vtt => video.querySelector("track").src = vtt)
        .then(() => {
            track.track.mode = "showing"
        })
}

async function fetch_sub(url) {
    try {
        const response = await fetch(url)
        if (!response.ok) {
            console.error(response.error)
            return
        }

        const txt = await response.text()
        const srt_parser = new srtParser2()
        const srt_array = srt_parser.fromSrt(txt)

        const vttString = convertArrayToVtt(srt_array);
        const blob = new Blob([vttString], { type: 'text/vtt' });

        return URL.createObjectURL(blob);
    } catch (err) {
        console.error(err)
    }
}

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
    info.style.display = "none"
    bottom_controls.style.display = "none"
    progress.style.display = "none"

    video.removeEventListener("loadeddata", loaded)
    video.removeEventListener("timeupdate", time_update)
    episodes_list.querySelector(".back").removeEventListener("click", back_eps)

    video.pause()
    video.removeAttribute("src")
    video.load()

    const caption_buttons = captions_container.querySelectorAll("div:not(#caption-list-item)")
    for (const caption_button of caption_buttons) {
        caption_button.remove()
    }

    const ep_buttons = episodes_container.querySelectorAll("div:not(#episode-list-item)")
    for (const ep_button of ep_buttons) {
        ep_button.remove()
    }

    let history = db.data.history || []
    if (current) {
        current[0].t = video.currentTime
        if (current[1]) {
            const index = history.findIndex(iterate => {
                const idMatch = (iterate.id == current[0].id)
                const isTv = (current[0].type == "tv")
                const epMatch = (current[0].s == iterate.s) && (current[0].ep == iterate.ep)
                return idMatch && (isTv ? (epMatch) : true)
            })
            history[index] = current[0]
        } else {
            history.push(current[0])
        }
    }

    db.push({ ...db.data, history: history })
    current = null
}

export function get_latest_season_episode_watched(id) {
    return db.data.history.filter(iterate => iterate.id == id)
        .sort((a, b) => b.s - a.s).filter((iterate, _, array) => array[0].s == iterate.s)
        .sort((a, b) => b.ep - a.ep)[0]
}

function fetch_data(id, s, ep, mtype) {
    let result = null
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
            t: 0,
            d: 0,
        }

        if (mtype == "tv") {
            result.s = s
            result.ep = ep
        }
    }
    return [result, is_listed]
}

function create_ep_button(appendTo, content, callback, order) {
    let new_button = document.querySelector("#episode-list-item")
    new_button = new_button.cloneNode(true)
    new_button.removeAttribute("id")

    new_button.classList.remove("hidden")
    new_button.textContent = content

    new_button.addEventListener("click", (e) => {
        callback(e)
    })

    new_button.style.order = order
    appendTo.appendChild(new_button)
}

function create_cc_button(lan, url) {
    let new_cc_button = document.querySelector("#caption-list-item")
    new_cc_button = new_cc_button.cloneNode(true)
    new_cc_button.removeAttribute("id")

    new_cc_button.classList.remove("hidden")
    new_cc_button.textContent = lan || "No Subtitles"
    if (url) new_cc_button.setAttribute("data-url", url)
    new_cc_button.classList.toggle("selected-caption", (db.data.settings.lan == lan))

    new_cc_button.addEventListener("click", () => {
        const caption_buttons = captions_container.querySelectorAll("div:not(#caption-list-item)")
        load_sub(url)

        const dbData = db.data
        dbData.settings.lan = lan
        db.push(dbData)

        for (const other_button of caption_buttons) {
            other_button.classList.toggle("selected-caption", (db.data.settings.lan == other_button.textContent))
        }
        new_cc_button.classList.toggle("selected-caption", true)
    })
    captions_container.appendChild(new_cc_button)
}

export async function query_content(type, id, s, ep, useHls = true) {
    clean_player()
    const latest_show_watch = (type == "tv" && !s && !ep) ? get_latest_season_episode_watched(id) ?? {}: {}

    if (latest_show_watch.s && latest_show_watch.ep) {
        s = latest_show_watch.s
        ep = latest_show_watch.ep
    } else {
        if (!s && !ep) {
            s = 1
            ep = 1
        }
    }

    const video_data = fetch_data(id, s, ep, type)
    video.setAttribute("src", "")
    loading_label.textContent = "Kraunami turinio šaltiniai..."

    info.style.display = ""
    progress.style.display = "none"

    let result = preloaded[id + `${(type == "tv") ? `-${s}-${ep}` : ""}`]
    if (!result) {
        for (let i = 0; i < 1; i++) {
            try {
                if (i != 0) {
                    loading_label.textContent = "Kraunami turinio šaltiniai... " + `(${i + 1} bandymas)`
                }

                const episode_endpoint = (type == "tv") ? `/${s}/${ep}` : ""
                const response = await fetch(`https://fembox.aether.mom/${useHls ? "hls/" : ""}${type}/${id}${episode_endpoint}?ui=${config.SRC_TOKEN}`, { method: "GET", headers: {"Content-Type": "application/json"}})

                const data = await response.json()
                if (data && (data.sources ?? data.hls)) {
                    preloaded[id + `${(type == "tv") ? `-${s}-${ep}` : ""}`] = data
                    result = data
                    break
                }
            } catch (err) {
                console.error(err)
            }
        }
    }

    if (result) {
        const block_default_qualities = ["ORG", "4K"]

        let hls = null
        let current_src = ""

        current = video_data
        if (result.sources) {
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

            if (current_src == "" && result.sources.length == 1) {
                current_src = result.sources[0].url
            }
        } else if (result.hls) {
            if (Hls.isSupported()) {
                hls = new Hls()
                hls.loadSource(result.hls)
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                hls = true
                current_src = result.hls
            }
        }

        if (current_src == "" && !hls) {
            query_content(type, id, s, ep, false)
            return
        }

        create_cc_button(null)
        for (const caption_data of result.subtitles) {
            create_cc_button(caption_data.language, caption_data.url)
        }

        let season_data = null
        let max_seasons = 0

        fetch_content("content", (type == "movie"), id)
            .then(response => {
                player_controls.querySelector(".name").textContent = (response.title || response.name)
                player_controls.querySelector(".title").style.display = (type == "tv") ? "" : "none"
                player_controls.querySelector(".episode").style.display = (type == "tv") ? "" : "none"

                if (type == "tv") {
                    max_seasons = response.number_of_seasons
                    player_controls.querySelector(".episode").textContent = `S${s}:E${ep}`

                    fetch_content("content", false, `${id}/season/${s}`)
                        .then(season => {
                            const episodes = season.episodes
                            const current_episode = episodes.filter(iterate => iterate.season_number == s)
                                .find(iterate => iterate.episode_number == ep)
                            player_controls.querySelector(".title").textContent = current_episode.name
                            season_data = season
                        })
                    .then(() => {
                        const reset = () => {
                            for (let i = 0; i < max_seasons; i++) {
                                fetch_content("content", false, `${id}/season/${i + 1}`)
                                    .then(season => {
                                        create_ep_button(episodes_container, `Season ${i + 1}`, () => {
                                            const ep_buttons = episodes_container.querySelectorAll("div:not(#episode-list-item)")
                                            const sorted = season.episodes.sort((a, b) => a.episode_number - b.episode_number)

                                            episodes_list.querySelector(".back").classList.remove("hidden")

                                            for (const ep_button of ep_buttons) {
                                                ep_button.remove()
                                            }

                                            for (const episode of sorted) {
                                                create_ep_button(episodes_container, `E${episode.episode_number}: ${episode.name}`, () => {
                                                    query_content(type, id, i + 1, episode.episode_number)
                                                })
                                            }
                                        }, i)
                                    })
                            }
                        }

                        back_eps = () => {
                            const ep_buttons = episodes_container.querySelectorAll("div:not(#episode-list-item)")
                            episodes_list.querySelector(".back").classList.add("hidden")

                            for (const ep_button of ep_buttons) {
                                ep_button.remove()
                            }
                            reset()
                        }
                        reset()

                        episodes_list.querySelector(".back").classList.add("hidden")
                        episodes_list.querySelector(".back").addEventListener("click", back_eps)
                    })
                }
        
            })

        loaded = () => {
            info.style.display = "none"
            bottom_controls.style.display = ""
            progress.style.display = ""
            next_ep.style.display = (type == "tv") ? "" : "none"
            eps.style.display = (type == "tv") ? "" : "none"

            play.classList.toggle("fa-play", false)
            play.classList.toggle("fa-pause", true)

            const caption_buttons = captions_container.querySelectorAll("div:not(#caption-list-item)")
            const default_sub = Array.from(caption_buttons).find(iterate => iterate.textContent == db.data.settings.lan)

            if (default_sub) load_sub(default_sub.getAttribute("data-url"));           
            if (!current) return;

            current[0].d = video.duration
            video.currentTime = parseFloat(current[0].t)
            video.play()
        }

        const next_listen = () => {
            if (!season_data) return
            const new_ep = season_data.episodes.find(iterate => iterate.episode_number == ep + 1) || -1
            const new_s = (new_ep != -1) ? s : (s + 1) <= max_seasons ? (s + 1) : s
            query_content(type, id, new_s, new_ep.episode_number ?? 1)
        }

        time_update = () => {
            const percent = (video.currentTime / video.duration) * 100
            progress_bar.style.width = `${percent}%`
            time_stamp.textContent = `${new Date(video.currentTime * 1000).toISOString().slice(11, 19)}`
        }

        video.addEventListener("loadeddata", loaded, { once: true })
        video.addEventListener("timeupdate", time_update)
        player_controls.querySelector("#next").addEventListener("click", next_listen, { once: true })

        player_controls.querySelector(".volume-slider input").value = db.data.settings.volume

        loading_label.textContent = "Kraunamas vaizdas..."
        if (hls) {
            if (hls == true) {
                video.setAttribute("src", current_src)
            } else {
                hls.attachMedia(video)
            }
        } else {
            video.setAttribute("src", current_src)
        }
    }
}