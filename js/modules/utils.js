export async function get_config() {
    try {
       const response = await fetch("../config.json")
       const data = await response.json()
       return data
    } catch (err) {
        console.error(err)
    }
}