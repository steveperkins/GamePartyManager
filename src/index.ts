import winston from "winston"
import express from "express"
import bodyParser from "body-parser"
import https from "https"
import { DbSvc } from "./DbSvc"
import Bonjour from "bonjour"
import { Player } from "./models/Player"
import { PlayerSvc } from "./PlayerSvc"
import { MiniGameSvc } from "./MiniGameSvc"
import { ScoreSvc } from "./ScoreSvc"

const logger = winston.createLogger({
   level: "debug",
   format: winston.format.json(),
   defaultMeta: { service: "index" },
   transports: [new winston.transports.Console()]
});

try {
   const dbSvc = new DbSvc(process.env.DATABASE_URL || "postgres://vgp_service:o[i53[i6yrs=dgzakdfae@localhost:5433/video_game_party")
   dbSvc.init();

   const playerSvc = new PlayerSvc(dbSvc)
   const miniGameSvc = new MiniGameSvc(dbSvc)
   const scoreSvc = new ScoreSvc(dbSvc)

   const app = express();
   app.use(express.static(`${__dirname}/web/`))
   app.use(express.static("web"))

   app.use("/api/*", bodyParser.urlencoded({ extended: false }));
   app.use("/api/*", bodyParser.json());

   //// API endpoints
   // Player endpoints
   app.post("/api/player", playerSvc.insert)
   app.put("/api/player/:playerId", playerSvc.update)
   app.delete("/api/player/:playerId", playerSvc.delete)
   app.get("/api/players", playerSvc.getAll)

   // Minigame endpoints
   app.post("/api/minigame", miniGameSvc.insert)
   app.put("/api/minigame/:gameId", miniGameSvc.update)
   app.get("/api/minigames", miniGameSvc.getAll)
   app.delete("/api/minigame/:gameId", miniGameSvc.delete)

   // Score endpoints
   app.post("/api/score", scoreSvc.insert)
   app.get("/api/scores", scoreSvc.getAll)
   app.delete("/api/score/:playerId/:gameId", scoreSvc.delete)

   const serverPort = 8080
   const server = app.listen(serverPort, () => {
      logger.info(`Server now listening at port ${serverPort}`)
   })

   const bonjour = Bonjour()
   bonjour.publish({ name: "video-game-party", type: "http", port: serverPort })

} catch(e) {
   logger.error("Great. Something got hosed. " + e)
}