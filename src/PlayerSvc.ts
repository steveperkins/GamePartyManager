import winston from "winston"
import { Player } from "./models/Player"
import { DbSvc } from "./DbSvc";

const logger = winston.createLogger({
    level: "debug",
    format: winston.format.json(),
    defaultMeta: { service: "PlayerSvc" },
    transports: [new winston.transports.Console()]
 });

export class PlayerSvc {
    private dbSvc: DbSvc
    constructor(dbSvc: DbSvc) {
        this.dbSvc = dbSvc
    }

    /**
     * Registers a new player
     */
    insert = async (req: any, res: any) => {
        if (!req.body) {
            res.status(400)
            res.json({ message: "Player is required", code: "MISSING_BODY" })
            return
        }
        const player = req.body as Player
        if (!player.name) {
            res.status(400)
            res.json({ message: "Player name is required", code: "MISSING_NAME" })
            return
        }

        const existingPlayer = await this.dbSvc.getPlayerByName(player.name)
        if (existingPlayer) {
            res.status(400)
            res.json({ message: "Name already taken - try another", code: "NAME_TAKEN" })
            return
        }

        try {
            const result = await this.dbSvc.insertPlayer(player)
            res.status(200)
            res.json(result)
        } catch (e) {
            logger.error(`Player registration threw exception!\r\n${JSON.stringify(e)}`)
            res.status(400)
            res.json({ message: e.message, code: "NAME_TAKEN" })
            return;
        }

        res.end()
    }

    /**
     * Updates a player's name
     */
    update = async(req: any, res: any): Promise<Player> => {
        if (!req.params.playerId) {
            res.status(400)
            res.json({ message: "Player ID is required", code: "MISSING_PLAYER_ID" })
            return
        }

        if (!req.body) {
            res.status(400)
            res.json({ message: "New player name is required", code: "MISSING_BODY" })
            return
        }

        const player = req.body as Player
        if (!player.name) {
            res.status(400)
            res.json({ message: "Player name is required", code: "MISSING_NAME" })
            return
        }

        player.id = req.params.playerId

        try {
            const result = await this.dbSvc.updatePlayer(player)
            res.status(200)
            res.json(result)
        } catch (e) {
            logger.error(`Player update threw exception!\r\n${JSON.stringify(e)}`)
            res.status(400)
            res.json({ message: e.message })
            return;
        }

        res.end()
    }

    /**
     * Deletes a player
     */
    delete = async(req: any, res: any): Promise<void> => {
        if (!req.params.playerId) {
            res.status(400)
            res.json({ message: "Player ID is required", code: "MISSING_PLAYER_ID" })
            return
        }

        try {
            await this.dbSvc.deletePlayer(req.params.playerId)
            res.status(200)
            res.json({})
        } catch (e) {
            logger.error(`Player update threw exception!\r\n${JSON.stringify(e)}`)
            res.status(400)
            res.json({ message: e.message })
            return;
        }

        res.end()
    }

    /**
     * Gets all players
     */
    getAll = async (req: any, res: any): Promise<Player[]> => {
        try {
            const result = await this.dbSvc.getPlayers()
            res.status(200)
            res.json(result)
        } catch (e) {
            logger.error(`Player retrieval threw exception!\r\n${JSON.stringify(e)}`)
            res.status(500)
            res.json({ message: e.message, code: "PLAYERS_INACCESSIBLE" })
            return;
        }

        res.end()
    }
}