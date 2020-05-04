function ScoreClient () {
    ScoreClient.prototype.rootUrl = "api/score"
}

ScoreClient.prototype.getAll = function() {
    return new Promise((successCallback, errorCallback) => {
        $.get(`${this.rootUrl}s`, this.successHandler(successCallback, errorCallback))
            .fail(this.failureHandler(errorCallback))
    })
}

ScoreClient.prototype.add = function(playerid, gameid, score) {
    return new Promise((successCallback, errorCallback) => {
        $.post(`${this.rootUrl}`, { playerid, gameid, score}, this.successHandler(successCallback, errorCallback))
            .fail(this.failureHandler(errorCallback))
    })
}

ScoreClient.prototype.update = ScoreClient.prototype.add

ScoreClient.prototype.delete = function(reportId) {
    return new Promise((successCallback, errorCallback) => {
        $.delete(`${this.rootUrl}/${reportId}`, this.successHandler(successCallback, errorCallback))
            .fail(this.failureHandler(errorCallback))
    })
}

ScoreClient.prototype.successHandler = function(successCallback) {
    return function(data, status) {
        successCallback(data)
    }
}

ScoreClient.prototype.failureHandler = function(errorCallback) {
    return function(data, status) {
        errorCallback(data.responseJSON.message)
    }
}