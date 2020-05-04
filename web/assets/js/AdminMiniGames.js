function AdminMiniGames(tableId) {
    AdminMiniGames.prototype._this = this
    this.tableId = tableId

    AdminMiniGames.prototype.miniGameClient = new MiniGameClient()
    AdminMiniGames.prototype.miniGameClient.getAll()
        .then((response) => {
            let html = ""
            for(const game of response) {
                html += this.createGameRow(game)
            }

            $(`#${tableId} tbody`).append(html)
            this.miniGamesTable = new BSTable(this.tableId, {
                editableColumns: "1,2",
                onEdit: (row) => {
                    const id = row[0].cells[0].innerText || row[0].cells[0].textContent
                    const name = row[0].cells[1].innerText || row[0].cells[1].textContent
                    const maxscore = row[0].cells[2].innerText || row[0].cells[2].textContent
                    if (!id || !name || !maxscore) {
                        const error = "All fields are required"
                        this.showGameError(error)
                        return error
                    }
                    this.updateGame({ id, name, maxscore })
                }, 
                onBeforeDelete: (row) => {
                    const id = row[0].cells[0].innerText || row[0].cells[0].textContent
                    this.deleteGame(id)
                }
            })
            this.miniGamesTable.init()
        })
        .catch((error) => {
            AdminMiniGames.prototype._this.showGameError(error)
    })
}

AdminMiniGames.prototype.reinit = function() {
    this.miniGamesTable.refresh()
}
AdminMiniGames.prototype.createGameRow = function(game) {
    return `<tr id="miniGame-${game.id}"><td>${game.id}</td><td>${game.name}</td><td>${game.maxscore}</td></tr>`
}

AdminMiniGames.prototype.showGameError = function(error) {
    $("#miniGames .error").html(error)
}

AdminMiniGames.prototype.deleteGame = function(gameId) {
    this.miniGameClient.delete(gameId)
        .then(() => {
            $("#miniGamesTable #" + gameId).detach()
        })
        .catch((error) => {
            this.showGameError(error)
        })
}

AdminMiniGames.prototype.updateGame = function(game) {
    this.miniGameClient.update(game)
        .catch((error) => {
            this.showGameError(error)
        })
}

AdminMiniGames.prototype.addGame = function() {
    const name = $("#miniGames input[name]").val()
    const maxscore = $("#miniGames input[name=maxScore]").val()
    const table = this.miniGamesTable
    this.miniGameClient.add({ name, maxscore })
        .then((game) => {
            $("#miniGamesTable tbody").append(this.createGameRow(game))
            table.refresh()
        })
        .catch((error) => {
            this.showGameError(error)
     })
}