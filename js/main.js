import * as smd from "./modules/smd.js"

const KEY = "8702503f89e34602ba8db67dc7c2ff18.THFscoQuyJ_3arIxHaV5uznR"

const renderer = smd.default_renderer(document.querySelector("[data-role='assistant'] .content"))
const parser = smd.parser(renderer)

const think_renderer = smd.default_renderer(document.querySelector("[data-role='assistant'] .thinking"))
const think_parser = smd.parser(think_renderer)

fetch("https://ktmcsemester-1-proxy.vercel.app/chat", {
    method: "POST",
    headers: {
        Authorization: `Bearer ${KEY}`,
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        model: "gpt-oss:120b-cloud",
        messages: [{ role: "user", content: "find the seahorse emoji" }],
        stream: true,
        think: "medium"
    })
}).then(async response => {
    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    let buffer = ""
    let think_time = null

    try {
        while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true });
            while (true) {
                const lineEnd = buffer.indexOf("\n")
                if (lineEnd === -1) break

                const line = buffer.slice(0, lineEnd).trim()
                buffer = buffer.slice(lineEnd + 1)

                const data = JSON.parse(line)
                if (data) {
                    try {
                        if (data.message.thinking) {
                            if (!think_time) {
                                think_time = new Date().getTime()
                                console.log(think_time)
                            }
                            document.querySelector("[data-role='assistant'] .thinking").classList.toggle("hidden", false)
                            smd.parser_write(think_parser, data.message.thinking)
                        } else {
                            if (think_time) {
                                const duration = (new Date().getTime() - think_time) / 1000
                                document.querySelector(".think-status").classList.toggle("hidden", false)
                                document.querySelector(".think-status").textContent = `Thought for ${duration} seconds`
                                think_time = null
                            }
                            document.querySelector("[data-role='assistant'] .thinking").classList.toggle("hidden", true)
                            smd.parser_write(parser, data.message.content)
                        }
                    } catch (err) {
                        // ignore
                    }
                }
            }
        }
    } finally {
        smd.parser_end(parser)
        reader.cancel()
    }
})