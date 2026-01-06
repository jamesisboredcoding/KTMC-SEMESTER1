import { Poster, Banner } from "./content.js"
import { IMAGE_URL } from "./utils.js"

export class Section {
    constructor(title, data, useBanners) {
        this.title = title
        this.data = data
        this.banners = useBanners
    }

    render(appendTo) {
        const template = document.querySelector("#category-section")
        const cloned = template.content.cloneNode(true)

        this.container = cloned.querySelector("div")
        
        cloned.querySelector(".section-title").textContent = this.title
        appendTo.appendChild(cloned)
    }

    populate(content, banner, type) {
        for (const item of content) {
            const data = [
                item.title, item.release_date, type, item.vote_average,
                IMAGE_URL + (banner ? "w1280" : "w500") + (banner ? item.backdrop_path : item.poster_path)
            ]

            const element = (banner ? new Banner(...data) : new Poster(...data))
            element.render(this.container)
            console.log(element)
        }
    }
}