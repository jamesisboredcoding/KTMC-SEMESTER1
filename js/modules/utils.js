const content_modal = document.querySelector(".content-modal")

export async function get_config() {
    try {
       const response = await fetch("../config.json")
       const data = await response.json()
       return data
    } catch (err) {
        console.error(err)
    }
}

export function show_modal(title, overview, banner, id) {
    
}

export function hide_modal() {
    
}