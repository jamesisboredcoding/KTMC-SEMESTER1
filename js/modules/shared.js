import Database from "./db.js";

const absoluteContainer = document.querySelector(".absolute-container")

export let current_chat = null

export const db = new Database({
    chats: {},
    think: false,
    extended: false,
})

export function toggle_modal(modal, bool) {
    const targetModal = absoluteContainer.querySelector("#" + modal)
    if (!targetModal) return console.error(modal + " doesnt exist");

    targetModal.classList.toggle("hidden", !bool)
    absoluteContainer.classList.toggle("active", bool)
}

export function set_chat(chat) {
    current_chat = chat
}