import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js"
import { db } from "./shared.js"

const mainWindow = document.querySelector(".main-window")
const messages = mainWindow.querySelector(".messages")

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
                this.thinking_container.innerHTML = marked.parse(content)
            } else {
                this.content_container.innerHTML = marked.parse(content)
            }
        } else {
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
    constructor(id) {
        this.messages = []
        this.objects = []

        this.id = id ?? (new Date().getTime())
        mainWindow.classList.add("inited")
        console.log(`Created chat with ID: ${this.id}`)
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

        data.chats[this.id] = normalized_messages
        console.log(normalized_messages, data)
        db.update(data)
    }

    add_message_entry(role) {
        const message_object = new Message(role)
        this.objects.push(message_object)
        return message_object
    }
}

export default Chat