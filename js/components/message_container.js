import Chat from "../modules/chat.js"
import stream from "../modules/proxy.js"
import { db, current_chat as current, get_model_info, set_system } from "../modules/shared.js"

const mainWindow = document.querySelector(".main-window")
const container = mainWindow.querySelector(".message-container")
const messages = mainWindow.querySelector(".messages")

const send_message = container.querySelector("#send")
const think_button = container.querySelector("#think")
const attach_files = container.querySelector("#attach")
const message_area = container.querySelector("textarea")
const files = container.querySelector(".files")

const file_attach = document.querySelector("#file-attach")

let current_chat = null
let attached_files = {}

function bytes_to_str(bytes) {
    const sizes = ["B", "KB", "MB", "GB"]
    const index = Math.floor(Math.log(bytes) / Math.log(1024))

    return parseFloat( (bytes / Math.pow(1024, index)).toFixed(2) ) + " " + sizes[index]
}

function add_file(name, size, key) {
    const file = container.querySelector("#file-template").cloneNode(true)
    file.removeAttribute("id")
    file.classList.remove("hidden")

    file.querySelector(".file-name").textContent = name
    file.querySelector(".file-size").textContent = bytes_to_str(size)

    file.querySelector(".file-remove").addEventListener("click", () => {
        delete attached_files[key]
        file.remove()
    })

    console.log("Added " + name + " file")
    files.appendChild(file)
    return file
}

async function handle_message(content) {
    if (!current_chat && !current) {
        current_chat = new Chat(null, content)
    } else if (!current_chat && current) {
        current_chat = current
    }

    mainWindow.classList.add("inited")
    current_chat.add_message_entry("user").render(content)
    messages.scrollTo({ top: messages.scrollHeight, behavior: "smooth" })

    const thinking_message = current_chat.add_message_entry("assistant")
    const message = current_chat.add_message_entry("assistant")

    if (Object.keys(attached_files).length > 0) {
        content = content + "\n<Files>"
        for (const key in attached_files) {
            const file = attached_files[key]
            content = content + `\n\n${file.name} content:\n${file.content}`
            file.element.querySelector(".file-remove").click()
        }
    }
    
    message.set_streaming(true)
    message.render("")
    current_chat.messages.push({ role: "user", content: content })

    const message_list = set_system(current_chat.messages, db.data.settings.system)
    const model = get_model_info(db.data.settings.model, db.data.think)

    const body = {
        model: model.name,
        stream: true,
        messages: message_list
    }

    if (model && typeof(model.thinking) == "bool") {
        body.think = model.thinking
    }
    
    stream(body, (data) => {
        if (data.type == "thinking") {
            message.set_streaming(false)
            thinking_message.thinking = true
            thinking_message.render(data.content)
        } else {
            message.set_streaming(true)
            thinking_message.render("")
            message.render(data.content)
        }
        messages.scrollTo({ top: messages.scrollHeight, behavior: "smooth" })
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

think_button.addEventListener("click", () => {
    think_button.classList.toggle("selected")

    const data = db.data
    data.think = think_button.classList.contains("selected")
    db.update(data)
})

attach_files.addEventListener("click", () => {
    file_attach.click()
})

file_attach.addEventListener("change", (e) => {
    Array.from(e.target.files).forEach(file => {
        if (file.size > 1048576) {
            return alert(`File size of ${file.name} too big, maximum 1MB`)
        }

        const key = new Date().getTime()
        const fileReader = new FileReader()

        fileReader.readAsText(file)
        fileReader.onloadend = () => {
            const element = add_file(file.name, file.size, key)
            attached_files[key] = {
                name: file.name,
                size: file.size,
                content: fileReader.result,
                element: element
            }
        }
    })
    e.target.value = ""
})