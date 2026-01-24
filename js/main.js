import "./components/message_container.js"
import "./components/chat_container.js"
import "./components/sidebar.js"

import Chat from "./modules/chat.js"
import { db, set_chat } from "./modules/shared.js"

const url = new URL(window.location.href)
const params = Object.fromEntries(url.searchParams)

const mainWindow = document.querySelector(".main-window")
const messages = mainWindow.querySelector(".messages")

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

messages.scrollTo({ top: messages.scrollHeight, behavior: "smooth" })
set_chat(existing_chat)