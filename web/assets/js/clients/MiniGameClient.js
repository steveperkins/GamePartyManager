function MiniGameClient () {
    this.rootUrl = "api/minigames"
    this.getAll = (callback) => {
        $.get(this.rootUrl, function(data, status) {
            if (status !== "success") {
                throw data.message
            }
            callback(data)
        })
    }
}