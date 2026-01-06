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
        const cloned = template.cloneNode(true)

        cloned.removeAttribute("id")
        cloned.style.display = ''

        cloned.querySelector(".title").textContent = this.title
        cloned.querySelector(".rating").textContent = this.rating
        cloned.querySelector(".year").textContent = this.year
        cloned.querySelector(".img").setAttribute("src", this.img)

        appendTo.appendChild(cloned)
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
        console.log("BANNER")
        const template = document.getElementById("banner-content")
        const cloned = template.cloneNode(true)

        cloned.removeAttribute("id")
        cloned.style.display = ''

        cloned.querySelector(".title").textContent = this.title
        cloned.querySelector(".rating").textContent = this.rating
        cloned.querySelector(".year").textContent = this.year
        cloned.querySelector(".img").setAttribute("src", this.img)

        appendTo.appendChild(cloned)
    }
}