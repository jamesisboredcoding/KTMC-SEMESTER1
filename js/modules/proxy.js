function stream(messages, think = undefined, callback, finishCallback) {
    fetch("https://ktmcsemester-1-proxy.vercel.app/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "gpt-oss:120b-cloud",
            messages: messages,
            stream: true,
            think: think
        })
    }).then(async response => {
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()

        let buffer = ""
        let think_time = null

        let thinking_content = ""
        let message_content = ""

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
                                }

                                thinking_content = thinking_content + data.message.thinking
                                callback({ type: "thinking", content: thinking_content })
                            } else {
                                if (think_time) {
                                    const duration = (new Date().getTime() - think_time) / 1000
                                    document.querySelector(".think-status").classList.toggle("hidden", false)
                                    document.querySelector(".think-status").textContent = `Thought for ${duration} seconds`
                                    think_time = null
                                }

                                message_content = message_content + data.message.content
                                callback({ type: "response", content: message_content })
                            }
                        } catch (err) {
                            // ignore
                        }
                    }
                }
            }
        } finally {
            finishCallback({ thinking: thinking_content, response: message_content })
            reader.cancel()
        }
    }).catch(err => {
        alert(err)
    })
}

export default stream