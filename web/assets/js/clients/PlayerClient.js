function PlayerClient () {
    PlayerClient.prototype.rootUrl = "api/player"
}

PlayerClient.prototype.getAll = function() {
    return new Promise((successCallback, errorCallback) => {
        $.get(`${this.rootUrl}s`, this.successHandler(successCallback, errorCallback))
            .fail(this.failureHandler(errorCallback))
    })
}

PlayerClient.prototype.addPlayer = function(player) {
    return new Promise((successCallback, errorCallback) => {
        $.post(`${this.rootUrl}`, player, this.successHandler(successCallback, errorCallback))
            .fail(this.failureHandler(errorCallback))
    })
}

PlayerClient.prototype.updatePlayer = function(player) {
    return new Promise((successCallback, errorCallback) => {
        $.put(`${this.rootUrl}/${player.id}`, player, this.successHandler(successCallback, errorCallback))
            .fail(this.failureHandler(errorCallback))
    })
}

PlayerClient.prototype.deletePlayer = function(playerId) {
    return new Promise((successCallback, errorCallback) => {
        $.delete(`${this.rootUrl}/${playerId}`, this.successHandler(successCallback, errorCallback))
            .fail(this.failureHandler(errorCallback))
    })
}

PlayerClient.prototype.successHandler = function(successCallback) {
    return function(data, status) {
        successCallback(data)
    }
}

PlayerClient.prototype.failureHandler = function(errorCallback) {
    return function(data, status) {
        errorCallback(data.responseJSON.message)
    }
}