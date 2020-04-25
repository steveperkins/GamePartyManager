import winston from "winston"
import { DbSvc } from "./DbSvc";
import { ScoreReport } from "./models/ScoreReport";
import { HighScores } from "./models/HighScores";

const logger = winston.createLogger({
    level: "debug",
    format: winston.format.json(),
    defaultMeta: { service: "ScoreSvc" },
    transports: [new winston.transports.Console()]
 });

export class ScoreSvc {
    private dbSvc: DbSvc
    constructor(dbSvc: DbSvc) {
        this.dbSvc = dbSvc
    }

    /**
     * Adds a new score report
     */
    insert = async(req: any, res: any) : Promise<ScoreReport> => {
        if (!req.body) {
            res.status(400)
            res.json({ message: "Report is required", code: "MISSING_BODY" })
            return
        }
        const report = req.body as ScoreReport
        if (!report.playerid) {
            res.status(400)
            res.json({ message: "Player ID is required", code: "MISSING_PLAYER_ID" })
            return
        }
        if (!report.gameid) {
            res.status(400)
            res.json({ message: "Game ID is required", code: "MISSING_GAME_ID" })
            return
        }
        if (report.score === undefined) {
            res.status(400)
            res.json({ message: "Game score is required", code: "MISSING_SCORE" })
            return
        }

        try {
            const result = await this.dbSvc.insertScoreReport(report)
            res.status(200)
            res.json(result)
        } catch (e) {
            logger.error(`Score report threw exception!\r\n${JSON.stringify(e)}`)
            res.status(500)
            res.json({ message: e.message })
            return;
        }

        res.end()
    }

    /**
     * Gets all player scores across all games
     */
    getAll = async (req: any, res: any): Promise<HighScores> => {
        try {
            const result = await this.dbSvc.getHighScores()
            res.status(200)
            res.json(result)
        } catch (e) {
            logger.error(`High score retrieval threw exception!\r\n${JSON.stringify(e)}`)
            res.status(500)
            res.json({ message: e.message, code: "SCORES_INACCESSIBLE" })
            return;
        }

        res.end()
    }
}