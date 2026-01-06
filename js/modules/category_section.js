export class Section {
    constructor(title, data, useBanners) {
        this.title = title
        this.data = data
        this.banners = useBanners
    }

    render(appendTo) {
        const template = document.querySelector("#category-section")
        const cloned = template.content.cloneNode(true)

        cloned.querySelector(".section-title").textContent = this.title

        appendTo.appendChild(cloned)
    }
}