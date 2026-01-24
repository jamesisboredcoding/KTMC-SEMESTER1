import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js"
import { db } from "./shared.js"

const mainWindow = document.querySelector(".main-window")
const sidebar = document.querySelector(".sidebar")

const messages = mainWindow.querySelector(".messages")
const chats = sidebar.querySelector(".chats")

const placeholder = chats.querySelector(".pholder")

class Message {
    constructor(role) {
        this.role = role
        this.thinking = false
    }

    render(content) {
        if (this.role == "system") return
        if (!this.element) {
            this.element = document.createElement("div")
            this.element.setAttribute("data-role", this.role)
            this.element.classList.add("message")

            if (this.role == "assistant") {
                this.thinking_container = document.createElement("div")
                this.thinking_container.classList.add("thinking", "text-zinc-500")

                this.content_container = document.createElement("div")
                this.content_container.classList.add("content")

                this.think_identifier = document.createElement("i")
                this.think_identifier.classList.add("text-zinc-400/50", "mb-2", "think-status", "hidden")

                this.element.appendChild(this.thinking_container)
                this.element.appendChild(this.think_identifier)
                this.element.appendChild(this.content_container)

                this.content_container.appendChild(document.createElement("p"))
            } else {
                this.content_par = document.createElement("p")
                this.element.appendChild(this.content_par)
            }
            messages.appendChild(this.element)
        }

        if (this.role == "assistant") {
            if (this.thinking) {
                // this.thinking_container.innerHTML = marked.parse(content)
                this.thinking_container.innerHTML = content
            } else {
                this.content_container.innerHTML = marked.parse(content)
            }
        } else {
            const files_start = content.indexOf("<Files>")
            const files_end = content.indexOf("</Files>")

            if (files_start != -1) {
                content = content.substring(0, files_start)
            }
            this.content_par.textContent = content
        }
    }

    set_streaming(bool) {
        if (this.element && this.role == "assistant") {
            this.element.classList.toggle("streaming", bool)
        }
    }
}

class Chat {
    constructor(id, chatName) {
        this.messages = []
        this.objects = []
        this._name = chatName ?? "Untitled"

        this.id = id ?? (new Date().getTime())
        placeholder.classList.add("hidden")

        this.chat_element = chats.querySelector("#chat-example").cloneNode(true)
        this.chat_element.removeAttribute("id")
        this.chat_element.classList.remove("hidden")
        this.chat_element.textContent = this._name
        this.chat_element.setAttribute("href", "?chat=" + this.id)

        chats.appendChild(this.chat_element)
    }

    get name() {
        return this._name
    }

    set name(value) {
        this._name = value
        this.chat_element.textContent = this._name

        let data = db.data
        data.chats[this.id].name = value
        db.update(data)
    }

    save() {
        let data = db.data
        let normalized_messages = []

        this.messages.forEach(message => {
            normalized_messages.push({
                role: message.role,
                content: message.content,
                thinking: message.thinking
            })
        })

        data.chats[this.id] = { messages: normalized_messages, name: this.name }
        db.update(data)
    }

    delete() {
        let data = db.data
        delete data.chats[this.id]

        db.update(data)
        delete this
    }

    add_message_entry(role) {
        const message_object = new Message(role)
        this.objects.push(message_object)
        return message_object
    }
}

export default Chat