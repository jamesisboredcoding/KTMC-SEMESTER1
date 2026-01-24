import Database from "./db.js";

const absoluteContainer = document.querySelector(".absolute-container")

export let current_chat = null
export const MODELS = {
    "kimi": ["kimi-k2:1t-cloud", "kimi-k2-thinking:cloud"],
    "gpt/medium": "gpt-oss:120b-cloud",
    "qwen": "qwen3-next:80b-cloud"
}

export const db = new Database({
    chats: {},
    think: false,
    extended: false,
    settings: {
        model: "kimi",
        system: null
    }
})

export function toggle_modal(modal, bool) {
    const targetModal = absoluteContainer.querySelector("#" + modal)
    if (!targetModal) return console.error(modal + " doesnt exist");

    targetModal.classList.toggle("inactive", !bool)
    absoluteContainer.classList.toggle("active", bool)
}

export function set_chat(chat) {
    current_chat = chat
}

export function get_model_info(query, think = false) {
    const keys = Object.keys(MODELS).filter(key => key.substring(0, query.length) == query)
    const key = keys[0]
    
    if (!key) return false;

    const info = key.split("/")
    const model = MODELS[key]
    const thinking = info[1]

    if (model) {
        return {
            name: typeof(model) == "object" ? (think ? model[1] : model[0]) : model,
            thinking: (think ? (
                (thinking ? thinking : (
                    (typeof(model) == "object" ? model[1] : true)
                ))
            ) : (typeof(model) == "object" ? model[0] : false))
        }
    }
}

export function set_system(messages, value) {
    let done = false
    messages.forEach((message, index) => {
        if (message.role == "system") {
            done = true
            messages[index].content = value
        }
    })
    if (!done) {
        messages = [
            { role: "system", content: value },
            ...messages
        ]
    }
    return messages
}