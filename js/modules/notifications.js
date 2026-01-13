const notifications = document.querySelector(".notifications")

let timeouts = []

function update_container() {
    notifications.classList.toggle("hidden", (timeouts.length == 0))
}

function create_notification(type, text) {
    const template = document.querySelector(".notifications ." + type)
    if (template) {
        const cloned = template.cloneNode(true)
        cloned.querySelector("p").textContent = text

        notifications.appendChild(cloned)
        cloned.classList.remove("hide-notif")
        cloned.classList.remove("hidden")

        cloned.querySelector("button").addEventListener("click", () => {
            timeouts.forEach(obj => {
                if (obj.element == cloned) {
                    clearTimeout(obj.tm)
                    cloned.remove()

                    timeouts.forEach((value, index) => {
                    if (value.element != cloned) return
                        timeouts.splice(index, 1)
                    })
                    update_container()
                }
            })
        })

        timeouts.push({
            element: cloned,
            tm: setTimeout(() => {
                cloned.classList.add("hide-notif")
                cloned.remove()

                timeouts.forEach((value, index) => {
                    if (value.element != cloned) return
                    timeouts.splice(index, 1)
                })
                update_container()
            }, 4000)
        })
        update_container()
    } else {
        console.error("template " + type + " doesn't exist")
    }
}

export default function Notify(type, text) {
    create_notification(type, text)
}