import { toggle_modal, db } from "../modules/shared.js"

const sidebar = document.querySelector(".sidebar")
const absoluteContainer = document.querySelector(".absolute-container")

const newChat = sidebar.querySelector("#new-chat")
const settings = sidebar.querySelector("#settings")
const siderbarToggle = document.querySelector(".sidebar-button")

const settingsModal = absoluteContainer.querySelector("#settings")

const modelSelect = settingsModal.querySelector("select")
const instructions = settingsModal.querySelector("textarea")

const save = settingsModal.querySelector("#confirm")
const cancel = settingsModal.querySelector("#cancel")

// newChat.addEventListener("click", () => {
//     window.location.href = window.location.origin
// })

settings.addEventListener("click", () => {
    instructions.value = db.data.settings.system
    modelSelect.value = db.data.settings.model
    toggle_modal("settings", true)
})

cancel.addEventListener("click", () => {
    toggle_modal("settings", false)
})

save.addEventListener("click", () => {
    let data = db.data
    data.settings = data.settings ?? {}
    data.settings.model = modelSelect.value
    data.settings.system = instructions.value

    toggle_modal("settings", false)
    db.update(data)
})

sidebar.classList.toggle("extended", db.data.extended)
siderbarToggle.addEventListener("click", () => {
    let data = db.data
    data.extended = !sidebar.classList.contains("extended")
    db.update(data)
    sidebar.classList.toggle("extended", data.extended)
})