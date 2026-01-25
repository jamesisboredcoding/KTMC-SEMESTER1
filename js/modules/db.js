class Database {
    constructor(defaultData) {
        this.data = this.fetch() ?? defaultData
        this.update(this.data)
    }

    fetch() {
        try {
            const parsed = JSON.parse(localStorage.getItem("chatai-db"))
            if (parsed) {
                return parsed
            }
        } catch (err) {
            console.error(err)
        }
    }

    update(new_data) {
        this.data = new_data
        this.__update()
    }

    __update() {
        try {
            const json_string = JSON.stringify(this.data)
            if (json_string) {
                localStorage.setItem("chatai-db", json_string)
            }
        } catch (err) {
            console.error(err)
        } finally {
            console.log("Data sucessfully saved")
        }
    }
}

export default Database