function MiniGameClient () {
    MiniGameClient.prototype.rootUrl = "api/minigame"
}

MiniGameClient.prototype.getAll = function() {
    return new Promise((successCallback, errorCallback) => {
        $.get(`${this.rootUrl}s`, this.successHandler(successCallback, errorCallback))
            .fail(this.failureHandler(errorCallback))
    })
}

/**
 * Expects `game` to have a name and maxScore
 */
MiniGameClient.prototype.add = function(game) {
    return new Promise((successCallback, errorCallback) => {
        $.post(this.rootUrl, game, this.successHandler(successCallback, errorCallback))
            .fail(this.failureHandler(errorCallback))
    })
}

/**
 * Expects `game` to have an id, name, and maxScore
 */
MiniGameClient.prototype.update = function(game) {
    return new Promise((successCallback, errorCallback) => {
        $.put(`${this.rootUrl}/${game.id}`, game, this.successHandler(successCallback, errorCallback))
            .fail(this.failureHandler(errorCallback))
    })
}

MiniGameClient.prototype.delete = function(gameId) {
    return new Promise((successCallback, errorCallback) => {
        $.delete(`${this.rootUrl}/${gameId}`, this.successHandler(successCallback))
            .fail(this.failureHandler(errorCallback))
    })
}

MiniGameClient.prototype.successHandler = function(successCallback) {
    return function(data, status) {
        successCallback(data)
    }
}

MiniGameClient.prototype.failureHandler = function(errorCallback) {
    return function(data, status) {
        errorCallback(data.responseJSON.message)
    }
}