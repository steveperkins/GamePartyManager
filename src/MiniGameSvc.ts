import winston from "winston"
import { MiniGame } from "./models/MiniGame"
import { DbSvc } from "./DbSvc";

const logger = winston.createLogger({
    level: "debug",
    format: winston.format.json(),
    defaultMeta: { service: "MiniGameSvc" },
    transports: [new winston.transports.Console()]
 });

export class MiniGameSvc {
    private dbSvc: DbSvc
    constructor(dbSvc: DbSvc) {
        this.dbSvc = dbSvc
    }

    /**
     * Adds a new minigame
     */
     insert = async (req: any, res: any) : Promise<MiniGame> => {
        if (!req.body) {
            res.status(400)
            res.json({ message: "Minigame is required", code: "MISSING_BODY"})
            return
        }
        const game = req.body as MiniGame
        if (!game.name) {
            res.status(400)
            res.json({ message: "Game name is required", code: "MISSING_NAME" })
            return
        }

        const existingGame = await this.dbSvc.getMiniGameByName(game.name)
        if (existingGame) {
            res.status(400)
            res.json({ message: "Name already taken - try another", code: "NAME_TAKEN" })
            return
        }

        try {
            const result = await this.dbSvc.insertMiniGame(game)
            res.status(200)
            res.json(result)
        } catch (e) {
            logger.error(`Game add threw exception!\r\n${JSON.stringify(e)}`)
            res.status(500)
            res.json({ message: e.message })
            return;
        }

        res.end()
    }

    /**
     * Updates a minigame's name
     */
    update = async (req: any, res: any): Promise<MiniGame> => {
        if (!req.body) {
            res.status(400)
            res.json({ message: "Minigame is required", code: "MISSING_BODY"})
            return
        }
        const game = req.body as MiniGame
        if (!game.name) {
            res.status(400)
            res.json({ message: "Game name is required", code: "MISSING_NAME" })
            return
        }
        if (!req.params.gameId) {
            res.status(400)
            res.json({ message: "Game ID is required", code: "MISSING_ID" })
            return
        }

        const existingGame = await this.dbSvc.getMiniGameByName(game.name)
        if (existingGame && +existingGame.id !== +game.id) {
            res.status(400)
            res.json({ message: "Name already taken - try another", code: "NAME_TAKEN" })
            return
        }

        game.id = req.params.gameId
        try {
            const result = await this.dbSvc.updateMiniGame(game)
            res.status(200)
            res.json(result)
        } catch (e) {
            logger.error(`Game update threw exception!\r\n${JSON.stringify(e)}`)
            res.status(500)
            res.json({ message: e.message })
            return;
        }

        res.end()
    }

    /**
     * Deletes a minigame
     */
    delete = async (req: any, res: any): Promise<MiniGame> => {
        if (!req.params.gameId) {
            res.status(400)
            res.json({ message: "Game ID is required", code: "MISSING_ID" })
            return
        }

        try {
            await this.dbSvc.deleteMiniGame(req.params.gameId)
            res.status(200)
            res.json({})
        } catch (e) {
            logger.error(`Game delete threw exception!\r\n${JSON.stringify(e)}`)
            res.status(500)
            res.json({ message: e.message })
            return;
        }

        res.end()
    }

    /**
     * Gets all minigames
     */
    getAll = async (req: any, res: any): Promise<MiniGame[]> => {
        try {
            const result = await this.dbSvc.getMiniGames()
            res.status(200)
            res.json(result)
        } catch (e) {
            logger.error(`Game retrieval threw exception!\r\n${JSON.stringify(e)}`)
            res.status(500)
            res.json({ message: e.message, code: "GAMES_INACCESSIBLE" })
            return;
        }

        res.end()
    }
}