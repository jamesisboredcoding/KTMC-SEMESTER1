import { show_modal } from "./utils.js"

class ContentElement {
    constructor(title, yor, type, rating, images, desc) {
        this.element = null
        this.title = title
        this.year = yor.split("-")[0]
        this.type = type
        this.rating = Number(rating).toFixed(1)
        this.imgs = images
        this.desc = desc
    }

    create(id, title, rating, y, img) {
        const template = document.getElementById(id)
        const cloned = template.cloneNode(true)

        cloned.removeAttribute("id")
        cloned.style.display = ''

        cloned.querySelector(".title").textContent = title
        cloned.querySelector(".rating").textContent = rating
        cloned.querySelector(".year").textContent = y
        cloned.querySelector(".img").setAttribute("src", img)

        this.element = cloned
        this.setProgress(0)

        cloned.addEventListener("click", () => {
            show_modal(title, this.desc, this.imgs.banner, this.rating, this.type, this.year)
        })

        return cloned
    }

    setProgress(percentAlpha) {
        percentAlpha = Math.min(1, Math.max(0, percentAlpha))

        const progressBar = this.element.querySelector(".progress")
        progressBar.style.width = `${percentAlpha * 100}%`
        progressBar.classList.toggle("hidden", (percentAlpha == 0))
    }
}

export class Poster extends ContentElement {
    constructor(...args) {
        super(...args)
        this.img = this.imgs.poster
    }

    render(appendTo) {
        appendTo.appendChild(this.create("poster-content", this.title, this.rating, this.year, this.img))
    }
}

export class Banner extends ContentElement {
    constructor(...args) {
        super(...args)
        this.img = this.imgs.banner
    }

    render(appendTo) {
        appendTo.appendChild(this.create("banner-content", this.title, this.rating, this.year, this.img))
    }
}