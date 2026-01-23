import "./components/message_container.js"




document.querySelector(".sidebar-button").addEventListener("click", () => {
    document.querySelector(".sidebar").classList.toggle("extended")
})










// fetch("https://ktmcsemester-1-proxy.vercel.app/chat", {
//     method: "POST",
//     headers: {
//         Authorization: `Bearer ${KEY}`,
//         "Content-Type": "application/json"
//     },
//     body: JSON.stringify({
//         model: "gpt-oss:120b-cloud",
//         messages: [{ role: "user", content: "write a presentation about lemon" }],
//         stream: true,
//         think: "medium"
//     })
// }).then(async response => {
//     const reader = response.body?.getReader()
//     const decoder = new TextDecoder()

//     let buffer = ""
//     let think_time = null

//     let thinking_content = ""
//     let message_content = ""

//     try {
//         while (true) {
//             const { done, value } = await reader.read()
//             if (done) break

//             buffer += decoder.decode(value, { stream: true });
//             while (true) {
//                 const lineEnd = buffer.indexOf("\n")
//                 if (lineEnd === -1) break

//                 const line = buffer.slice(0, lineEnd).trim()
//                 buffer = buffer.slice(lineEnd + 1)

//                 const data = JSON.parse(line)
//                 if (data) {
//                     try {
//                         if (data.message.thinking) {
//                             if (!think_time) {
//                                 think_time = new Date().getTime()
//                                 console.log(think_time)
//                             }
//                             document.querySelector("[data-role='assistant'] .thinking").classList.toggle("hidden", false)
//                             thinking_content = thinking_content + data.message.thinking
//                             document.querySelector("[data-role='assistant'] .thinking").innerHTML = marked.parse(thinking_content)
//                         } else {
//                             if (think_time) {
//                                 const duration = (new Date().getTime() - think_time) / 1000
//                                 document.querySelector(".think-status").classList.toggle("hidden", false)
//                                 document.querySelector(".think-status").textContent = `Thought for ${duration} seconds`
//                                 think_time = null
//                             }
//                             document.querySelector("[data-role='assistant'] .thinking").classList.toggle("hidden", true)
//                             message_content = message_content + data.message.content
//                             document.querySelector("[data-role='assistant'] .content").innerHTML = marked.parse(message_content)
//                         }
//                         document.querySelector(".messages").scrollTo({ top: 10000, behavior: "smooth" })
//                     } catch (err) {
//                         // ignore
//                     }
//                 }
//             }
//         }
//     } finally {
//         reader.cancel()
//     }
// }).catch(err => {
//     alert(err)
// })