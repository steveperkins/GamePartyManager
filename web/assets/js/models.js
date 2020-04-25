function HighScore(player, score, gamesPlayed) {
    this.player = player
    this.score = score
    this.gamesPlayed = gamesPlayed
}

function HighScores(scores) {
    this.scores = scores
}

function MiniGame(name, maxscore) {
    this.id = undefined
    this.name = name
    this.maxscore = maxscore
    this.created = undefined
}

function Player(name) {
    this.id = undefined
    this.name = name
    this.maxscore = maxscore
    this.created = undefined
}

function ScoreReport(gameid, playerid, score) {
    this.id = undefined
    this.gameid = gameid
    this.playerid = playerid
    this.score = score
    this.created = undefined
}