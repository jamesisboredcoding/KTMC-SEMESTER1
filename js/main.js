import "./components/message_container.js"
import "./components/chat_container.js"

import Chat from "./modules/chat.js"
import { db, set_chat } from "./modules/shared.js"

const url = new URL(window.location.href)
const params = Object.fromEntries(url.searchParams)

const mainWindow = document.querySelector(".main-window")

let chats = {}
for (const chat_id in db.data.chats) {
    const chat_data = db.data.chats[chat_id]
    const chat = new Chat(chat_id, chat_data.name)

    chat.messages = chat_data.messages
    chats[chat_id] = chat
}

const existing_chat = chats[params.chat]
const chat_data = db.data.chats[params.chat]

if (existing_chat && chat_data && chat_data.messages) {
    chat_data.messages.forEach(message => {
        mainWindow.classList.add("inited")
        const message_obj = existing_chat.add_message_entry(message.role)
        message_obj.render(message.content)
    })
}

set_chat(existing_chat)

document.querySelector(".sidebar").classList.toggle("extended", db.data.extended)
document.querySelector(".sidebar-button").addEventListener("click", () => {
    let data = db.data
    data.extended = !document.querySelector(".sidebar").classList.contains("extended")
    db.update(data)
    document.querySelector(".sidebar").classList.toggle("extended", data.extended)
})