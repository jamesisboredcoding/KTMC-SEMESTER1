import Chat from "../modules/chat.js"
import stream from "../modules/proxy.js"

const mainWindow = document.querySelector(".main-window")
const container = mainWindow.querySelector(".message-container")
const messages = mainWindow.querySelector(".messages")

const send_message = container.querySelector("#send")
const message_area = container.querySelector("textarea")

let current_chat = null

async function handle_message(content) {
    if (!current_chat) {
        current_chat = new Chat()
    }

    current_chat.add_message_entry("user").render(content)
    messages.scrollTo({ top: 10000, behavior: "smooth" })

    const thinking_message = current_chat.add_message_entry("assistant")
    const message = current_chat.add_message_entry("assistant")
    
    message.set_streaming(true)
    current_chat.messages.push({ role: "user", content: content })
    
    stream(current_chat.messages, "medium", (data) => {
        if (data.type == "thinking") {
            message.set_streaming(false)
            thinking_message.thinking = true
            thinking_message.render(data.content)
        } else {
            message.set_streaming(true)
            thinking_message.render("")
            message.render(data.content)
        }
        messages.scrollTo({ top: 10000, behavior: "smooth" })
    }, (data) => {
        message.set_streaming(false)
        current_chat.messages.push(
            { role: "assistant", content: data.response, thinking: data.thinking }
        )
        current_chat.save()
    })
}

send_message.disabled = "true"
message_area.addEventListener("input", () => {
    const enabled = (message_area.value.length > 0)
    if (enabled) {
        send_message.disabled = ""
    } else {
        send_message.disabled = "true"
    }
})

message_area.addEventListener("keydown", (e) => {
    if (e.code == "Enter" && !send_message.classList.contains("disabled")) {
        e.preventDefault()
        handle_message(message_area.value)
        message_area.value = ""
        send_message.disabled = "true"
    }
})

send_message.addEventListener("click", () => {
    if (send_message.hasAttribute("disabled")) return
    send_message.disabled = "true"
    handle_message(message_area.value)
    message_area.value = ""
})