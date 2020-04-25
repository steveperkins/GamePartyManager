function PlayerClient () {
    this.rootUrl = "api/player"
    this.getAll = (callback) => {
        $.get(`${this.rootUrl}s`, function(data, status) {
            if (status !== "success") {
                throw data.message
            }
            callback(data)
        })
    }

    this.addPlayer = (player, callback) => {
        $.post(`${this.rootUrl}`, player, function(data, status) {
            if (status !== "success") {
                throw data.message
            }
            callback(data)
        })
    }

    this.updatePlayer = (player, callback) => {
        $.put(`${this.rootUrl}/${player.id}`, player, function(data, status) {
            if (status !== "success") {
                throw data.message
            }
            callback(data)
        })
    }
}