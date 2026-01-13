import Notify from "./notifications.js"

export default class Database {
    constructor(def) {
        this._data = this.data || def
        this.push(def, false)
    }

    get data() {
        try {
            const saved = localStorage.getItem("local-db")
            if (saved) return JSON.parse(saved);
        } catch (err) {
            console.error(saved)
        }
    }

    push(content, overwrite = true) {
        if (!overwrite && this.data) {
            return
        }

        try {
            const stringified = JSON.stringify(content)
            if (stringified) {
                localStorage.setItem("local-db", stringified)
            }
        } catch (err) {
            console.error(err)
            Notify("error", "There was an error saving to DB")
        }
    }
}