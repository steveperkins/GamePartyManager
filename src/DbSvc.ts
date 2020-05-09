import { Pool } from "pg"
import { Player } from "./models/Player"
import { MiniGame } from "./models/MiniGame"
import { ScoreReport } from "./models/ScoreReport"
import { HighScores } from "./models/HighScores"
import { HighScore } from "./models/HighScore"

const INSERT_PLAYER_SQL = "INSERT INTO player (name) VALUES($1) RETURNING *"
const UPDATE_PLAYER_SQL = "UPDATE player SET name = $1 WHERE id=$2"
const DELETE_PLAYER_SQL = "DELETE FROM player WHERE id = $1"
const GET_PLAYERS_SQL = "SELECT * FROM player ORDER BY name"
const GET_PLAYER_BY_NAME_SQL = `SELECT * FROM player WHERE name = $1`

const INSERT_MINIGAME_SQL = `INSERT INTO mini_game ("name", maxscore)
    VALUES($1, $2)
    ON CONFLICT ("name")
    DO UPDATE SET maxscore = $2
    WHERE mini_game.name = $1
    RETURNING *`
const UPDATE_MINIGAME_SQL = "UPDATE mini_game SET name = $1, maxscore = $2 WHERE id=$3"
const GET_MINIGAMES_SQL = "SELECT * FROM mini_game ORDER BY id"
const GET_MINIGAME_BY_NAME_SQL = "SELECT * FROM mini_game WHERE mini_game.name = $1"
const DELETE_MINIGAME_SQL = "DELETE FROM mini_game WHERE mini_game.id = $1"

const INSERT_SCORE_REPORT_SQL = `INSERT INTO score_report (playerid, gameid, score)
    VALUES($1, $2, $3)
    ON CONFLICT (playerid, gameid)
    DO UPDATE SET score=$3
    WHERE score_report.playerid = $1 AND score_report.gameid = $2`
const DELETE_SCORE_REPORT_SQL = "DELETE FROM score_report WHERE score_report.playerid = $1 AND score_report.gameid = $2"

const GET_HIGH_SCORES_SQL = `SELECT p.name, SUM(sr.score) AS score, COUNT(mg.id) AS gamesPlayed
    FROM player p
    JOIN score_report sr ON p.id = sr.playerid
    JOIN mini_game mg ON sr.gameid = mg.id
    GROUP BY p.id
    ORDER BY SUM(sr.score) DESC`

export class DbSvc {
    private pool: Pool;
    constructor(hostOrConnectionString: string, port?: number, dbname?: string, user?: string, password?: string) {
        // If only the host is populated, the user is passing a connection string
        if (hostOrConnectionString && !port && !dbname && !user && !password) {
            this.pool = new Pool({ connectionString: hostOrConnectionString })
        } else {
            this.pool = new Pool({
                host: hostOrConnectionString,
                database: dbname,
                user,
                password,
                port
            })
        }
    }

    async init() {
        await this.pool.query(`CREATE TABLE IF NOT EXISTS player (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL UNIQUE,
            created TIMESTAMP DEFAULT NOW()
        )`)

        await this.pool.query(`CREATE TABLE IF NOT EXISTS mini_game (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) UNIQUE,
            maxscore INTEGER DEFAULT 0,
            created TIMESTAMP DEFAULT NOW()
        )`)

        await this.pool.query(`CREATE TABLE IF NOT EXISTS score_report (
            playerid INT NOT NULL,
            gameid INT NOT NULL,
            score INT NOT NULL,
            created TIMESTAMP DEFAULT NOW(),
            PRIMARY KEY(playerid, gameid)
        )`)

        /*
            To add a new user to the database:
            create user vgp_service with encrypted password 'o[i53[i6yrs=dgzakdfae';
            grant all privileges on database video_game_party to vgp_service;
        */
    }


    async insertPlayer(player: Player) : Promise<Player> {
        const result = await this.pool.query(INSERT_PLAYER_SQL, [player.name])
        if (result && result.rows && result.rows.length) {
            return result.rows[0] as Player
        }
        return {} as Player
    }

    async updatePlayer(player: Player) : Promise<Player> {
        await this.pool.query(UPDATE_PLAYER_SQL, [player.name, player.id])
        return player
    }

    async deletePlayer(playerId: number) : Promise<void> {
        await this.pool.query(DELETE_PLAYER_SQL, [playerId])
    }

    async getPlayers() : Promise<Player[]> {
        const result = await this.pool.query(GET_PLAYERS_SQL)
        return result.rows as Player[]
    }

    async getPlayerByName(name: string) : Promise<Player> {
        const result = await this.pool.query(GET_PLAYER_BY_NAME_SQL, [name])
        if (result && result.rows && result.rows.length) {
            return result.rows[0] as Player
        }
        return undefined
    }

    async insertMiniGame(game: MiniGame) : Promise<MiniGame> {
        const result = await this.pool.query(INSERT_MINIGAME_SQL, [game.name, +game.maxscore])
        if (result && result.rows && result.rows.length) {
            return result.rows[0] as MiniGame
        }
        return {} as MiniGame
    }

    async updateMiniGame(game: MiniGame) : Promise<MiniGame> {
        await this.pool.query(UPDATE_MINIGAME_SQL, [game.name, +game.maxscore, +game.id])
        return game
    }

    async deleteMiniGame(gameId: number) : Promise<void> {
        await this.pool.query(DELETE_MINIGAME_SQL, [+gameId])
    }

    async getMiniGames() : Promise<MiniGame[]> {
        const result = await this.pool.query(GET_MINIGAMES_SQL)
        return result.rows as MiniGame[]
    }

    async getMiniGameByName(name: string) : Promise<MiniGame> {
        const result = await this.pool.query(GET_MINIGAME_BY_NAME_SQL, [name])
        if (result && result.rows && result.rows.length) {
            return result.rows[0] as MiniGame
        }
        return undefined
    }

    async insertScoreReport(report: ScoreReport) : Promise<ScoreReport> {
        await this.pool.query(INSERT_SCORE_REPORT_SQL, [report.playerid, report.gameid, report.score])
        return report
    }

    async deleteScoreReport(report: ScoreReport) : Promise<void> {
        await this.pool.query(DELETE_SCORE_REPORT_SQL, [report.playerid, report.gameid, report.score])
    }

    async getHighScores() : Promise<HighScores> {
        const scores = new HighScores()
        const result = await this.pool.query(GET_HIGH_SCORES_SQL)
        if (result && result.rows && result.rows.length) {
            scores.scores = result.rows as HighScore[]
        }
        return scores
    }
}