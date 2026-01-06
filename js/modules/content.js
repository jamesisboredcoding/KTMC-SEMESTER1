export class Poster {
    constructor(title, yor, type, rating, poster) {
        this.title = title
        this.year = yor
        this.type = type
        this.rating = rating
        this.img = poster
    }

    render(appendTo) {
        const template = document.getElementById("poster-content")
        const cloned = template.contentEditable.cloneNode(true)

        cloned.querySelector(".title").textContent = this.title
        cloned.querySelector(".rating").textContent = this.rating
        cloned.querySelector(".year").textContent = this.year
        cloned.querySelector(".img").setAttribute("src", this.img)

        appendTo.appendCHild(cloned)
    }
}

export class Banner {
    constructor(title, yor, type, rating, banner) {
        this.title = title
        this.year = yor
        this.type = type
        this.rating = rating
        this.img = banner
    }

    render(appendTo) {
        const template = document.getElementById("banner-content")
        const cloned = template.contentEditable.cloneNode(true)

        cloned.querySelector(".title").textContent = this.title
        cloned.querySelector(".rating").textContent = this.rating
        cloned.querySelector(".year").textContent = this.year
        cloned.querySelector(".img").setAttribute("src", this.img)

        appendTo.appendCHild(cloned)
    }
}