import { Poster, Banner } from "./content.js"
import { IMAGE_URL } from "./utils.js"

const SCROLL_SPEED = 400
export const Sections = []

export class Section {
    constructor(title, useBanners = false) {
        this.title = title
        this.banners = useBanners
        this.elements = []

        Sections.push(this)
    }

    render(appendTo) {
        const template = document.querySelector("#category-section")
        const cloned = template.content.cloneNode(true)

        cloned.querySelector(".section-title").textContent = this.title

        const list = cloned.querySelector(".list")
        const moveRight = cloned.querySelector(".move-right")
        const moveLeft = cloned.querySelector(".move-left")

        this.container = list
        this.dom = cloned

        moveLeft.classList.toggle("hidden", (list.scrollLeft == 0))
        moveRight.classList.toggle("hidden", !(list.scrollLeft + list.clientWidth >= list.scrollWidth - 1))

        list.addEventListener("scroll", () => {
            moveLeft.classList.toggle("hidden", (list.scrollLeft == 0))
             moveRight.classList.toggle("hidden", (list.scrollLeft + list.clientWidth >= list.scrollWidth - 1))
        })

        moveRight.addEventListener("click", () => {
            list.scrollBy({ left: SCROLL_SPEED, behavior: "smooth" })
        })
        moveLeft.addEventListener("click", () => {
            list.scrollBy({ left: -SCROLL_SPEED, behavior: "smooth" })
        })

        appendTo.appendChild(cloned)
    }

    populate(content, type) {
        for (const item of content) {
            const data = [
                item.title || item.name, item.release_date || item.first_air_date || "NaN", type, item.vote_average,
                {
                    "banner": `${IMAGE_URL}w1280${item.backdrop_path}`,
                    "poster": `${IMAGE_URL}w500${item.poster_path}`
                },
                item.overview
            ]

            const element = (this.banners ? new Banner(...data) : new Poster(...data))
            element.render(this.container)
            this.elements.push(element)
        }
    }

    remove() {
        this.dom.remove()
        delete this
    }
}