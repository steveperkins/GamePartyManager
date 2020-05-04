function AdminPlayers(tableId) {
    AdminPlayers.prototype._this = this
    this.tableId = tableId

    AdminPlayers.prototype.playerClient = new PlayerClient()
    AdminPlayers.prototype.playerClient.getAll()
        .then((response) => {
            let html = ""
            for(const player of response) {
                html += this.createRow(player)
            }

            $(`#${tableId} tbody`).append(html)
            this.table = new BSTable(this.tableId, {
                editableColumns: "1",
                onEdit: (row) => {
                    const id = row[0].cells[0].innerText || row[0].cells[0].textContent
                    const name = row[0].cells[1].innerText || row[0].cells[1].textContent
                    if (!id || !name) {
                        const error = "All fields are required"
                        this.showError(error)
                        return error
                    }
                    this.update({ id, name })
                }, 
                onBeforeDelete: (row) => {
                    const id = row[0].cells[0].innerText || row[0].cells[0].textContent
                    this.delete(id)
                }
            })
            this.table.init()
        })
        .catch((error) => {
            AdminPlayers.prototype._this.showError(error)
    })
}

AdminPlayers.prototype.reinit = function() {
    this.playersTable.refresh()
}
AdminPlayers.prototype.createRow = function(player) {
    return `<tr id="player-${player.id}"><td>${player.id}</td><td>${player.name}</td></tr>`
}

AdminPlayers.prototype.showError = function(error) {
    $("#players .error").html(error)
}

AdminPlayers.prototype.delete = function(playerId) {
    this.playerClient.deletePlayer(playerId)
        .then(() => {
            $(`#${this.tableId} #${playerId}`).detach()
        })
        .catch((error) => {
            this.showError(error)
        })
}

AdminPlayers.prototype.update = function(player) {
    this.playerClient.updatePlayer(player)
        .catch((error) => {
            this.showGameError(error)
        })
}

AdminPlayers.prototype.add = function() {
    const name = $("#players input[name]").val()
    const table = this.table
    this.playerClient.addPlayer({ name })
        .then((player) => {
            $(`#${this.tableId} tbody`).append(this.createRow(player))
            table.refresh()
        })
        .catch((error) => {
            this.showError(error)
     })
}