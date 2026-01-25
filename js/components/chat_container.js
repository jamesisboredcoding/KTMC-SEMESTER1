import { toggle_modal, current_chat } from "../modules/shared.js";

const mainWindow = document.querySelector(".main-window")
const absoluteContainer = document.querySelector(".absolute-container")

const controller = mainWindow.querySelector(".controller")

const rename = controller.querySelector("#rename")
const del = controller.querySelector("#delete")

const delete_modal = absoluteContainer.querySelector("#confirm-delete")
const rename_modal = absoluteContainer.querySelector("#rename")

del.addEventListener("click", () => {
    toggle_modal("confirm-delete", true)
})

delete_modal.querySelector("#cancel").addEventListener("click", () => {
    toggle_modal("confirm-delete", false)
})

delete_modal.querySelector("#confirm").addEventListener("click", () => {
    if (current_chat) current_chat.delete();
    toggle_modal("confirm-delete", false)
    window.location.href = window.location.origin
})

rename.addEventListener("click", () => {
    rename_modal.querySelector("input").value = ""
    rename_modal.querySelector("label").textContent = `Rename '${current_chat.name}' chat`

    toggle_modal("rename", true)
})

rename_modal.querySelector("#cancel").addEventListener("click", () => {
    toggle_modal("rename", false)
})

rename_modal.querySelector("#confirm").addEventListener("click", () => {
    if (current_chat) current_chat.name = rename_modal.querySelector("input").value;
    toggle_modal("rename", false)
})